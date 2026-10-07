import type {
  Character,
  Enemy,
  CombatState,
  CombatLogEntry,
  StatusEffect,
  DiceRoll,
} from '../../types';
import { rollDice, rollD20, getAttributeModifier } from '../dice/diceEngine';

export interface AttackResult {
  attackRoll: DiceRoll;
  attackTotal: number;
  hit: boolean;
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
}

export interface CombatTurnResult {
  attacker: 'player' | 'enemy';
  action: string;
  attackResult: AttackResult;
  newEnemyHp?: number;
  newPlayerHp?: number;
  logEntry: CombatLogEntry;
}

export function calculateInitiative(character: Character): number {
  const roll = rollD20();
  const dexMod = getAttributeModifier(character.attributes.dexterity);
  return roll.total + dexMod;
}

export function playerAttack(
  character: Character,
  enemy: Enemy,
  weaponDamageDice: string = 'd6',
): AttackResult {
  const attackRoll = rollD20();
  const strMod = getAttributeModifier(character.attributes.strength);
  const attackTotal = attackRoll.total + strMod + character.modifiers.attack;

  if (attackRoll.isCriticalFail) {
    return {
      attackRoll,
      attackTotal,
      hit: false,
      damage: 0,
      isCritical: false,
      isMiss: true,
    };
  }

  const hit = attackRoll.isCriticalSuccess || attackTotal >= enemy.defense;

  if (!hit) {
    return {
      attackRoll,
      attackTotal,
      hit: false,
      damage: 0,
      isCritical: false,
      isMiss: false,
    };
  }

  const damageRoll = rollDice(weaponDamageDice);
  let damage = damageRoll.total + strMod;

  if (attackRoll.isCriticalSuccess) {
    damage = damage * 2;
  }

  return {
    attackRoll,
    attackTotal,
    hit: true,
    damage: Math.max(1, damage),
    isCritical: attackRoll.isCriticalSuccess,
    isMiss: false,
  };
}

export function enemyAttack(enemy: Enemy, character: Character): AttackResult {
  const attackRoll = rollD20();
  const attackTotal = attackRoll.total + Math.floor(enemy.attack / 3);

  if (attackRoll.isCriticalFail) {
    return {
      attackRoll,
      attackTotal,
      hit: false,
      damage: 0,
      isCritical: false,
      isMiss: true,
    };
  }

  const playerDefense = 10 + character.modifiers.defense;
  const hit = attackRoll.isCriticalSuccess || attackTotal >= playerDefense;

  if (!hit) {
    return {
      attackRoll,
      attackTotal,
      hit: false,
      damage: 0,
      isCritical: false,
      isMiss: false,
    };
  }

  const baseDamage = Math.floor(enemy.attack / 2) + rollDice('d4').total;
  const damage = attackRoll.isCriticalSuccess ? baseDamage * 2 : baseDamage;

  return {
    attackRoll,
    attackTotal,
    hit: true,
    damage: Math.max(1, damage),
    isCritical: attackRoll.isCriticalSuccess,
    isMiss: false,
  };
}

export function applyStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((effect) => ({ ...effect, duration: effect.duration - 1 }))
    .filter((effect) => effect.duration > 0);
}

export function createCombatState(enemies: Enemy[]): CombatState {
  return {
    id: crypto.randomUUID(),
    isActive: true,
    turn: 1,
    isPlayerTurn: true,
    enemies: enemies.map((e) => ({ ...e })),
    playerEffects: [],
    log: [],
  };
}

export function isCombatOver(combat: CombatState): 'victory' | 'defeat' | null {
  if (combat.enemies.every((e) => e.currentHp <= 0)) return 'victory';
  return null;
}

export function formatAttackResultForAI(
  attacker: string,
  target: string,
  result: AttackResult,
  currentHp?: number,
): string {
  if (result.isMiss) {
    return `${attacker} errou o ataque contra ${target}. Falha crítica!`;
  }
  if (!result.hit) {
    return `${attacker} atacou ${target} mas não conseguiu superar a defesa. Rolagem: ${result.attackTotal}.`;
  }
  const critText = result.isCritical ? ' ACERTO CRÍTICO!' : '';
  const hpText = currentHp !== undefined ? ` Vida restante: ${currentHp}.` : '';
  return `${attacker} acertou ${target}.${critText} Rolagem de ataque: ${result.attackTotal}. Dano causado: ${result.damage}.${hpText}`;
}
