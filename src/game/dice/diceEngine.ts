import type { DiceRoll, AttributeTestResult } from '../../types';

interface ParsedExpression {
  count: number;
  sides: number;
  modifier: number;
}

function parseExpression(expression: string): ParsedExpression {
  // Support: d20, 2d6, 1d20+3, 2d8+5, d100, 2d6-1
  const normalized = expression.trim().toLowerCase().replace(/\s/g, '');
  const match = normalized.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!match) {
    throw new Error(`Invalid dice expression: ${expression}`);
  }
  return {
    count: match[1] ? parseInt(match[1], 10) : 1,
    sides: parseInt(match[2], 10),
    modifier: match[3] ? parseInt(match[3], 10) : 0,
  };
}

function secureRandom(max: number): number {
  // Use crypto.getRandomValues for better randomness
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % max) + 1;
}

export function rollDice(expression: string): DiceRoll {
  const parsed = parseExpression(expression);
  const results: number[] = [];

  for (let i = 0; i < parsed.count; i++) {
    results.push(secureRandom(parsed.sides));
  }

  const sum = results.reduce((a, b) => a + b, 0);
  const total = sum + parsed.modifier;

  // Critical success/fail only applies to d20 single rolls
  const isCriticalSuccess = parsed.sides === 20 && parsed.count === 1 && results[0] === 20;
  const isCriticalFail = parsed.sides === 20 && parsed.count === 1 && results[0] === 1;

  return {
    dice: `${parsed.count}d${parsed.sides}`,
    results,
    modifier: parsed.modifier,
    total,
    expression,
    isCriticalSuccess,
    isCriticalFail,
  };
}

export function rollD20(): DiceRoll {
  return rollDice('d20');
}

export function rollD6(): DiceRoll {
  return rollDice('d6');
}

export function getAttributeModifier(attributeValue: number): number {
  return Math.floor((attributeValue - 10) / 2);
}

export function rollAttribute(
  attributeValue: number,
  difficulty: number,
): AttributeTestResult {
  const roll = rollD20();
  const modifier = getAttributeModifier(attributeValue);
  const total = roll.total + modifier;

  let outcome: AttributeTestResult['outcome'];
  if (roll.isCriticalSuccess) {
    outcome = 'critical_success';
  } else if (roll.isCriticalFail) {
    outcome = 'critical_failure';
  } else if (total >= difficulty) {
    outcome = 'success';
  } else {
    outcome = 'failure';
  }

  return {
    roll: roll.results[0],
    modifier,
    total,
    difficulty,
    outcome,
  };
}

export function formatDiceExpression(expression: string): string {
  try {
    const parsed = parseExpression(expression);
    const modStr =
      parsed.modifier > 0
        ? `+${parsed.modifier}`
        : parsed.modifier < 0
          ? `${parsed.modifier}`
          : '';
    return `${parsed.count}d${parsed.sides}${modStr}`;
  } catch {
    return expression;
  }
}
