import type { FGDiceRoll2d20, FGSkillTest, FGAttributes } from '../../types/fabulasGoblins';

// ─── Secure random d20 ────────────────────────────────────────

function secureD20(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % 20) + 1;
}

// ─── Core 2d20 roll ───────────────────────────────────────────

/**
 * Roll the Fábulas & Goblins 2d20 system.
 *
 * Priority order for special cases:
 * 1. dice1=1 AND dice2=20 (or vice-versa) → isAnulado, result='falha'
 * 2. Both dice same non-extreme number → isNumerosIguais, result='falha'
 * 3. Both dice=20 → isTriunfo + isEpico, result='triunfo_epico'
 * 4. Both dice=1  → isDesastre + isEpico, result='desastre_epico'
 * 5. Any die=20   → isTriunfo, result='triunfo'
 * 6. Any die=1    → isDesastre, result='desastre'
 * 7. Normal: selected=max(dice1, dice2), compare total vs difficulty
 */
export function rollDuo20(
  modifier: number = 0,
  difficulty: number = 14,
): FGDiceRoll2d20 {
  const dice1 = secureD20();
  const dice2 = secureD20();

  // Flags (all start false)
  let isAnulado = false;
  let isNumerosIguais = false;
  let isTriunfo = false;
  let isDesastre = false;
  let isEpico = false;
  let selected: number;
  let result: FGDiceRoll2d20['result'];

  // Priority 1: Anulado (1+20 combo)
  if ((dice1 === 1 && dice2 === 20) || (dice1 === 20 && dice2 === 1)) {
    isAnulado = true;
    selected = dice1; // doesn't matter much — both are present
    const total = selected + modifier;
    return {
      dice1,
      dice2,
      selected,
      modifier,
      total,
      isTriunfo: false,
      isDesastre: false,
      isEpico: false,
      isAnulado: true,
      isNumerosIguais: false,
      result: 'falha',
    };
  }

  // Priority 2: Números Iguais (both same, neither is 20+20 nor 1+1 handled below)
  // We'll check it after the both-20 and both-1 cases below.
  // Actually we handle it right here since the extremes come next.

  // Priority 3: Both dice = 20
  if (dice1 === 20 && dice2 === 20) {
    isTriunfo = true;
    isEpico = true;
    selected = 20;
    const total = selected + modifier;
    return {
      dice1,
      dice2,
      selected,
      modifier,
      total,
      isTriunfo: true,
      isDesastre: false,
      isEpico: true,
      isAnulado: false,
      isNumerosIguais: false,
      result: 'triunfo_epico',
    };
  }

  // Priority 4: Both dice = 1
  if (dice1 === 1 && dice2 === 1) {
    isDesastre = true;
    isEpico = true;
    selected = 1;
    const total = selected + modifier;
    return {
      dice1,
      dice2,
      selected,
      modifier,
      total,
      isTriunfo: false,
      isDesastre: true,
      isEpico: true,
      isAnulado: false,
      isNumerosIguais: false,
      result: 'desastre_epico',
    };
  }

  // Priority 2 (checked here, after extremes are handled): números iguais
  if (dice1 === dice2) {
    isNumerosIguais = true;
    selected = dice1;
    const total = selected + modifier;
    return {
      dice1,
      dice2,
      selected,
      modifier,
      total,
      isTriunfo: false,
      isDesastre: false,
      isEpico: false,
      isAnulado: false,
      isNumerosIguais: true,
      result: 'falha',
    };
  }

  // Normal flow: pick highest
  selected = Math.max(dice1, dice2);

  // Priority 5: Any die = 20
  if (dice1 === 20 || dice2 === 20) {
    isTriunfo = true;
    selected = 20;
    const total = selected + modifier;
    return {
      dice1,
      dice2,
      selected,
      modifier,
      total,
      isTriunfo: true,
      isDesastre: false,
      isEpico: false,
      isAnulado: false,
      isNumerosIguais: false,
      result: 'triunfo',
    };
  }

  // Priority 6: Desastre only when the *selected* (highest) die is 1.
  // If one die is 1 but the other is higher, selected is already the higher value —
  // this is a normal roll and should be evaluated against difficulty, not flagged as Desastre.
  // Both-1 is already handled above (Priority 4), so this branch only fires when
  // exactly one die is 1 and the other die is also 1 (impossible here) or higher.
  // In practice: selected === 1 is impossible here because both-1 was handled in Priority 4,
  // so this branch is kept for clarity but will only trigger in the edge case where
  // Math.max(dice1, dice2) === 1 — which cannot occur after Priorities 1-4.
  // The correct behavior: do NOT set isDesastre when one die is 1 but selected > 1.

  // Priority 7: Normal outcome
  const total = selected + modifier;

  if (total >= difficulty) {
    result = 'sucesso';
  } else {
    result = 'falha';
  }

  return {
    dice1,
    dice2,
    selected,
    modifier,
    total,
    isTriunfo,
    isDesastre,
    isEpico,
    isAnulado,
    isNumerosIguais,
    result,
  };
}

// ─── Skill test ───────────────────────────────────────────────

/**
 * Perform a complete F&G skill test.
 * attributeValue is the raw attribute (e.g. 3), used directly as the modifier.
 */
export function rollFGSkillTest(
  attribute: keyof FGAttributes,
  attributeValue: number,
  difficulty: number = 14,
  type: FGSkillTest['type'] = 'pericia',
): FGSkillTest {
  const roll = rollDuo20(attributeValue, difficulty);

  const success =
    roll.result === 'sucesso' ||
    roll.result === 'triunfo' ||
    roll.result === 'triunfo_epico';

  return {
    attribute,
    difficulty,
    type,
    roll,
    success,
  };
}
