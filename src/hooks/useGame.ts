import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDice } from './useDice';
import { narrateAction, narrateCombatResult } from '../services/ai/aiService';
import {
  playerAttack,
  enemyAttack,
  isCombatOver,
  formatAttackResultForAI,
} from '../game/combat/combatEngine';
import { addMemory } from '../services/supabase/campaignService';
import type { NarrativeMessage, Memory, Enemy } from '../types';
import type { CampaignContext } from '../game/narrative/aiPromptBuilder';
import type { FGAttributes } from '../types/fabulasGoblins';
import { buildFGSystemPrompt } from '../data/systems/fabulasGoblins/aiSystemPrompt';

function makeNarrativeMessage(
  type: NarrativeMessage['type'],
  content: string,
  metadata?: Record<string, unknown>,
): NarrativeMessage {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

/**
 * useGame — the main game orchestration hook.
 *
 * Ties together: AI calls → system action resolution → store state → narrative updates.
 */
export function useGame() {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    character,
    activeCombat,
    narrativeHistory,
    memories,
    quests,
    npcs,
    campaignPlayerId,
    selectedSystem,
    fgCharacter,
    addNarrativeMessage,
    updateCharacterHp,
    updateCharacterMana,
    updateCharacterGold,
    addMemory: addMemoryToStore,
    startCombat,
    endCombat,
    addCombatLogEntry,
    saveGame,
    setLoading,
  } = useGameStore();

  const { rollAttribute } = useDice();

  // ─── Build context for AI ──────────────────────────────────────────

  const buildContext = useCallback((): CampaignContext | null => {
    if (!character) return null;

    const recentMessages = narrativeHistory.slice(-12);
    const activeQuests = quests.filter((q) => q.status === 'active');

    const campaignSummary = selectedSystem === 'fabulas-goblins'
      ? '' // FG system prompt is injected in narrateAction via buildFGSystemPrompt
      : memories
          .filter((m) => m.type === 'summary')
          .slice(-3)
          .map((m) => m.content)
          .join(' ');

    return {
      character,
      currentLocation: null,
      activeQuests,
      npcsPresent: npcs,
      memories,
      recentMessages,
      activeCombat,
      campaignSummary,
    };
  }, [character, narrativeHistory, memories, quests, npcs, activeCombat, selectedSystem]);

  // ─── processAction ─────────────────────────────────────────────────

  const processAction = useCallback(
    async (playerAction: string) => {
      if (!character || isProcessing) return;

      const context = buildContext();
      if (!context) return;

      setIsProcessing(true);
      setLoading(true);

      // 1. Add player message to narrative
      addNarrativeMessage(
        makeNarrativeMessage('player', playerAction),
      );

      try {
        // 2. Call AI for initial interpretation
        const { data: aiResponse, error: aiError } = selectedSystem === 'fabulas-goblins'
          ? await narrateAction(
              { ...context, campaignSummary: buildFGSystemPrompt(context) },
              playerAction,
            )
          : await narrateAction(context, playerAction);

        if (aiError || !aiResponse) {
          addNarrativeMessage(
            makeNarrativeMessage(
              'system',
              `[Narrador indisponível: ${aiError ?? 'sem resposta'}]`,
            ),
          );
          return;
        }

        // 3. Handle skill check
        if (aiResponse.skillCheck) {
          const skillCheck = aiResponse.skillCheck;
          // For F&G sessions, attributes live in fgCharacter (FG keys like forca/agilidade).
          // For generic sessions, they live in character.attributes (strength/dexterity/etc.).
          const attrValue =
            selectedSystem === 'fabulas-goblins' && fgCharacter
              ? (fgCharacter.attributes[skillCheck.attribute as keyof FGAttributes] ?? 1)
              : character.attributes[skillCheck.attribute as keyof typeof character.attributes];
          const testResult = await rollAttribute(attrValue, skillCheck.difficulty, skillCheck.action);

          // Show dice roll in narrative
          const outcomeLabel: Record<string, string> = {
            critical_success: 'Sucesso Crítico',
            success: 'Sucesso',
            failure: 'Falha',
            critical_failure: 'Falha Crítica',
          };
          addNarrativeMessage(
            makeNarrativeMessage(
              'dice_roll',
              `Teste de ${skillCheck.attribute}: ${testResult.roll} + ${testResult.modifier} = ${testResult.total} vs CD ${testResult.difficulty} — ${outcomeLabel[testResult.outcome]}`,
              { testResult },
            ),
          );

          // Re-narrate with the system result
          const resultText = `Teste de ${skillCheck.attribute}: total ${testResult.total} vs CD ${testResult.difficulty}. Resultado: ${outcomeLabel[testResult.outcome]}.`;
          const { data: skillNarrative } = await narrateAction(context, playerAction, resultText);

          if (skillNarrative) {
            addNarrativeMessage(
              makeNarrativeMessage('narrator', skillNarrative.narrative),
            );
          } else {
            addNarrativeMessage(
              makeNarrativeMessage('narrator', aiResponse.narrative),
            );
          }
        } else if (aiResponse.combatTrigger) {
          // 4. Combat trigger: display initial narrative then init combat
          addNarrativeMessage(
            makeNarrativeMessage('combat', aiResponse.combatTrigger.narrative),
          );

          // Build minimal enemy stubs from slugs (real data would come from DB/data files)
          const stubEnemies: Enemy[] = aiResponse.combatTrigger.enemies.map((slug) => ({
            id: crypto.randomUUID(),
            templateId: slug,
            name: slug
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
            level: character.level,
            currentHp: 20 + character.level * 5,
            maxHp: 20 + character.level * 5,
            attack: 8 + character.level * 2,
            defense: 10 + character.level,
            speed: 10,
            skills: [],
            experienceReward: 50 + character.level * 25,
            goldReward: 10 + character.level * 5,
            lootTable: [],
            weaknesses: [],
            statusEffects: [],
          }));

          startCombat(stubEnemies);

          addNarrativeMessage(
            makeNarrativeMessage(
              'system',
              `Combate iniciado! ${stubEnemies.map((e) => e.name).join(', ')} aparecem!`,
            ),
          );
        } else {
          // 5. Standard narrative
          addNarrativeMessage(
            makeNarrativeMessage('narrator', aiResponse.narrative),
          );
        }

        // 6. Handle reward
        if (aiResponse.reward) {
          const reward = aiResponse.reward;
          if (reward.gold) updateCharacterGold((character.gold ?? 0) + reward.gold);
          if (reward.experience && character.id) {
            // XP update handled via characterService in a full integration;
            // here we show it in narrative
          }
          if (reward.narrative) {
            addNarrativeMessage(makeNarrativeMessage('system', reward.narrative));
          }
        }

        // 7. Handle memory update
        if (aiResponse.memoryUpdate) {
          const mu = aiResponse.memoryUpdate;
          const memory: Memory = {
            id: crypto.randomUUID(),
            campaignId: campaignPlayerId ?? '',
            type: mu.importance >= 8 ? 'permanent' : 'recent',
            content: mu.content,
            importance: mu.importance,
            timestamp: new Date().toISOString(),
          };
          addMemoryToStore(memory);

          if (campaignPlayerId) {
            void addMemory(
              campaignPlayerId,
              memory.type,
              memory.content,
              memory.importance,
            );
          }
        }

        // 8. Persist suggested actions as metadata on last message (stored via narrative history)
        // Suggested actions are available from aiResponse.suggestedActions if needed by UI

        // 9. Save game state
        void saveGame();
      } finally {
        setIsProcessing(false);
        setLoading(false);
      }
    },
    [
      character,
      isProcessing,
      buildContext,
      addNarrativeMessage,
      rollAttribute,
      updateCharacterGold,
      addMemoryToStore,
      startCombat,
      campaignPlayerId,
      saveGame,
      setLoading,
      selectedSystem,
    ],
  );

  // ─── processCombatTurn ─────────────────────────────────────────────

  const processCombatTurn = useCallback(
    async (
      action: 'attack' | 'defend' | 'flee' | 'skill',
      weaponDice?: string,
    ) => {
      if (!character || !activeCombat || isProcessing) return;

      const context = buildContext();
      if (!context) return;

      setIsProcessing(true);
      setLoading(true);

      try {
        const aliveEnemies = activeCombat.enemies.filter((e) => e.currentHp > 0);
        if (aliveEnemies.length === 0) {
          endCombat('victory');
          return;
        }

        const target = aliveEnemies[0];

        // ── Player turn ──────────────────────────────────────────────
        if (action === 'flee') {
          addNarrativeMessage(makeNarrativeMessage('combat', 'Você tenta fugir do combate!'));

          const context2 = buildContext();
          if (context2) {
            const { data } = await narrateCombatResult(
              context2,
              'O jogador fugiu do combate.',
            );
            if (data) {
              addNarrativeMessage(makeNarrativeMessage('narrator', data.narrative));
            }
          }

          endCombat('fled');
          return;
        }

        let playerResultText = '';

        if (action === 'attack' || action === 'skill') {
          const attackResult = playerAttack(character, target, weaponDice ?? 'd6');

          // Update enemy HP
          const newEnemyHp = Math.max(0, target.currentHp - attackResult.damage);

          // Update combat state enemies
          const updatedEnemies = activeCombat.enemies.map((e) =>
            e.id === target.id ? { ...e, currentHp: newEnemyHp } : e,
          );

          // Build log entry
          const logEntry = {
            turn: activeCombat.turn,
            actor: 'player' as const,
            action: action === 'skill' ? 'habilidade' : 'ataque',
            result: attackResult.hit
              ? `Acerto — ${attackResult.damage} de dano`
              : attackResult.isMiss
                ? 'Falha crítica!'
                : 'Bloqueado',
            damage: attackResult.damage,
            timestamp: new Date().toISOString(),
          };
          addCombatLogEntry(logEntry);

          playerResultText = formatAttackResultForAI(
            character.name,
            target.name,
            attackResult,
            newEnemyHp,
          );

          // Show dice in narrative
          addNarrativeMessage(
            makeNarrativeMessage(
              'dice_roll',
              `Ataque: d20 = ${attackResult.attackRoll.results[0]} + ${character.modifiers.attack} = ${attackResult.attackTotal} vs Defesa ${target.defense}${attackResult.isCritical ? ' — CRÍTICO!' : ''}`,
              { attackResult },
            ),
          );

          // Check if enemy died
          if (newEnemyHp <= 0) {
            const allDead = updatedEnemies.every((e) => e.currentHp <= 0);
            if (allDead) {
              // Narrate victory
              const victoryContext = buildContext();
              if (victoryContext) {
                const { data } = await narrateCombatResult(
                  victoryContext,
                  `${playerResultText} Todos os inimigos foram derrotados! Vitória do jogador!`,
                );
                if (data) {
                  addNarrativeMessage(makeNarrativeMessage('narrator', data.narrative));
                }
              }

              // XP/gold reward
              const totalXp = activeCombat.enemies.reduce((sum, e) => sum + e.experienceReward, 0);
              const totalGold = activeCombat.enemies.reduce((sum, e) => sum + e.goldReward, 0);
              addNarrativeMessage(
                makeNarrativeMessage(
                  'system',
                  `Vitória! +${totalXp} XP, +${totalGold} Tarenos`,
                ),
              );
              updateCharacterGold((character.gold ?? 0) + totalGold);
              endCombat('victory');
              return;
            }
          }
        } else if (action === 'defend') {
          playerResultText = `${character.name} adota postura defensiva, aumentando a defesa temporariamente.`;
          addNarrativeMessage(
            makeNarrativeMessage('combat', 'Você se concentra em defender.'),
          );
        }

        // Narrate player turn
        const playerContext = buildContext();
        if (playerContext) {
          const { data: playerNarrative } = await narrateCombatResult(
            playerContext,
            playerResultText,
          );
          if (playerNarrative) {
            addNarrativeMessage(
              makeNarrativeMessage('narrator', playerNarrative.narrative),
            );
          }
        }

        // ── Enemy turn ───────────────────────────────────────────────
        const stillAliveEnemies = activeCombat.enemies.filter((e) => e.currentHp > 0);
        if (stillAliveEnemies.length === 0) return;

        const attacker = stillAliveEnemies[0];
        const enemyAttackResult = enemyAttack(attacker, character);

        // Update player HP
        if (enemyAttackResult.hit) {
          const newHp = Math.max(0, character.currentHp - enemyAttackResult.damage);
          updateCharacterHp(newHp);

          if (newHp <= 0) {
            const defeatContext = buildContext();
            if (defeatContext) {
              const { data } = await narrateCombatResult(
                defeatContext,
                `${attacker.name} causou ${enemyAttackResult.damage} de dano ao jogador. Jogador derrotado!`,
              );
              if (data) {
                addNarrativeMessage(makeNarrativeMessage('narrator', data.narrative));
              }
            }
            addNarrativeMessage(
              makeNarrativeMessage('system', 'Você foi derrotado…'),
            );
            endCombat('defeat');
            return;
          }
        }

        const enemyLogEntry = {
          turn: activeCombat.turn,
          actor: 'enemy' as const,
          action: 'ataque',
          result: enemyAttackResult.hit
            ? `Acerto — ${enemyAttackResult.damage} de dano`
            : 'Errou',
          damage: enemyAttackResult.damage,
          timestamp: new Date().toISOString(),
        };
        addCombatLogEntry(enemyLogEntry);

        const enemyResultText = formatAttackResultForAI(
          attacker.name,
          character.name,
          enemyAttackResult,
          character.currentHp - (enemyAttackResult.hit ? enemyAttackResult.damage : 0),
        );

        addNarrativeMessage(
          makeNarrativeMessage(
            'dice_roll',
            `${attacker.name} ataca: d20 = ${enemyAttackResult.attackRoll.results[0]} = ${enemyAttackResult.attackTotal} vs Defesa ${10 + character.modifiers.defense}`,
            { attackResult: enemyAttackResult },
          ),
        );

        const enemyContext = buildContext();
        if (enemyContext) {
          const { data: enemyNarrative } = await narrateCombatResult(
            enemyContext,
            enemyResultText,
          );
          if (enemyNarrative) {
            addNarrativeMessage(
              makeNarrativeMessage('narrator', enemyNarrative.narrative),
            );
          }
        }

        // Check for end of combat after enemy turn
        const combatOverResult = isCombatOver(activeCombat);
        if (combatOverResult === 'victory') {
          endCombat('victory');
        }

        void saveGame();
      } finally {
        setIsProcessing(false);
        setLoading(false);
      }
    },
    [
      character,
      activeCombat,
      isProcessing,
      buildContext,
      addNarrativeMessage,
      addCombatLogEntry,
      updateCharacterHp,
      updateCharacterGold,
      endCombat,
      saveGame,
      setLoading,
    ],
  );

  // ─── Public API ────────────────────────────────────────────────────

  const suggestedActions: string[] = [];
  const lastNarrator = [...narrativeHistory]
    .reverse()
    .find((m) => m.type === 'narrator');
  // Suggested actions would be stored in metadata; expose them here
  const suggestedFromLast =
    lastNarrator?.metadata?.suggestedActions as string[] | undefined;
  if (suggestedFromLast) suggestedActions.push(...suggestedFromLast);

  return {
    processAction,
    processCombatTurn,
    isProcessing,
    suggestedActions,
  };
}
