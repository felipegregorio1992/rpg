import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '../layouts/GameLayout';
import { NarrativeDisplay } from '../components/story/NarrativeDisplay';
import { ActionInput } from '../components/story/ActionInput';
import { CharacterSheet } from '../components/character/CharacterSheet';
import { DiceRoller } from '../components/game/DiceRoller';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useGameStore } from '../store/gameStore';
import { useGame } from '../hooks/useGame';
import { INITIAL_SCENE_DESCRIPTION } from '../data/campaigns/cinzasDeValdris';
import type { NarrativeMessage } from '../types';

export function GamePage() {
  const character = useGameStore((s) => s.character);
  const narrativeHistory = useGameStore((s) => s.narrativeHistory);
  const activeCombat = useGameStore((s) => s.activeCombat);
  const isLoading = useGameStore((s) => s.isLoading);
  const addNarrativeMessage = useGameStore((s) => s.addNarrativeMessage);

  const { processAction, processCombatTurn, isProcessing, suggestedActions } = useGame();

  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const navigate = useNavigate();

  // Initialize with opening scene if no narrative history
  useEffect(() => {
    if (narrativeHistory.length === 0 && character) {
      const openingMessage: NarrativeMessage = {
        id: crypto.randomUUID(),
        type: 'narrator',
        content: INITIAL_SCENE_DESCRIPTION,
        timestamp: new Date().toISOString(),
      };
      addNarrativeMessage(openingMessage);
    }
  }, [narrativeHistory.length, character, addNarrativeMessage]);

  // Redirect if no character loaded
  useEffect(() => {
    if (!isLoading && !character) {
      navigate('/campaigns');
    }
  }, [isLoading, character, navigate]);

  if (!character) {
    return (
      <div className="h-screen w-full bg-stone-950 flex items-center justify-center">
        <p className="font-crimson text-parchment-200/60">Carregando aventura…</p>
      </div>
    );
  }

  // ─── Top bar with quick stats ──────────────────────────────────────

  const topBar = (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <h2 className="font-cinzel text-lg text-ember-400 font-semibold">
          {character.name}
        </h2>
        <span className="font-crimson text-sm text-parchment-200/60">
          Nível {character.level}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Quick HP bar */}
        <div className="w-32">
          <ProgressBar
            type="hp"
            current={character.currentHp}
            max={character.maxHp}
          />
        </div>

        {character.maxMana > 0 && (
          <div className="w-32">
            <ProgressBar
              type="mana"
              current={character.currentMana}
              max={character.maxMana}
            />
          </div>
        )}

        {/* Gold */}
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-sm text-ember-400">{character.gold}</span>
          <span className="font-crimson text-xs text-parchment-200/50">Tarenos</span>
        </div>

        {/* Quick actions */}
        <button
          onClick={() => setIsDiceModalOpen(true)}
          className="font-crimson text-sm text-parchment-200 hover:text-ember-400 transition-colors"
        >
          🎲 Dados
        </button>

        <button
          onClick={() => setIsInventoryModalOpen(true)}
          className="font-crimson text-sm text-parchment-200 hover:text-ember-400 transition-colors"
        >
          🎒 Inventário
        </button>
      </div>
    </div>
  );

  // ─── Sidebar ───────────────────────────────────────────────────────

  const sidebar = (
    <div className="p-4">
      <CharacterSheet character={character} />
    </div>
  );

  // ─── Main content ──────────────────────────────────────────────────

  const handleAction = (action: string) => {
    if (activeCombat?.isActive) {
      // If in combat, treat plain text as attack command
      void processCombatTurn('attack');
    } else {
      void processAction(action);
    }
  };

  return (
    <>
      <GameLayout topBar={topBar} sidebar={sidebar}>
        <div className="h-full flex flex-col gap-4">
          {/* Narrative display */}
          <div className="flex-1 overflow-hidden">
            <NarrativeDisplay
              messages={narrativeHistory}
              className="h-full"
            />
          </div>

          {/* Combat panel (if active) */}
          {activeCombat?.isActive && (
            <div className="shrink-0 p-4 bg-stone-900 border border-blood-500/40 rounded-sm">
              <h3 className="font-cinzel text-lg text-blood-500 uppercase tracking-wide mb-3">
                ⚔ Combate Ativo
              </h3>

              <div className="flex flex-wrap gap-3 mb-4">
                {activeCombat.enemies
                  .filter((e) => e.currentHp > 0)
                  .map((enemy) => (
                    <div
                      key={enemy.id}
                      className="bg-stone-950 border border-stone-800 rounded px-3 py-2"
                    >
                      <p className="font-cinzel text-sm text-parchment-100 font-semibold">
                        {enemy.name}
                      </p>
                      <ProgressBar
                        type="hp"
                        current={enemy.currentHp}
                        max={enemy.maxHp}
                        className="mt-1"
                      />
                    </div>
                  ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => processCombatTurn('attack')}
                  disabled={isProcessing}
                >
                  Atacar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => processCombatTurn('defend')}
                  disabled={isProcessing}
                >
                  Defender
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => processCombatTurn('flee')}
                  disabled={isProcessing}
                >
                  Fugir
                </Button>
              </div>
            </div>
          )}

          {/* Action input */}
          <div className="shrink-0">
            <ActionInput
              onSubmit={handleAction}
              suggestedActions={suggestedActions}
              isLoading={isProcessing}
            />
          </div>
        </div>
      </GameLayout>

      {/* Modals */}
      <Modal
        isOpen={isDiceModalOpen}
        onClose={() => setIsDiceModalOpen(false)}
        title="Rolagem de Dados"
      >
        <div className="flex justify-center py-6">
          <DiceRoller />
        </div>
      </Modal>

      <Modal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        title="Inventário"
        maxWidth="max-w-2xl"
      >
        <div className="py-4">
          <p className="font-crimson text-parchment-200/60 text-center">
            Sistema de inventário em desenvolvimento.
          </p>
        </div>
      </Modal>
    </>
  );
}
