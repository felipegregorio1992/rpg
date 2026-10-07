import { useState, useCallback } from 'react';
import type { DiceRoll, AttributeTestResult } from '../types';
import { rollDice, rollD20, rollAttribute as engineRollAttribute } from '../game/dice/diceEngine';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../services/supabase/client';

const ANIMATION_DELAY_MS = 300;

/**
 * useDice — wraps the dice engine with UI animation delay and optional Supabase persistence.
 */
export function useDice() {
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const campaignPlayerId = useGameStore((s) => s.campaignPlayerId);

  // ─── Persist to Supabase ──────────────────────────────────────────

  const persistRoll = useCallback(
    async (expression: string, result: DiceRoll, context?: string) => {
      if (!campaignPlayerId) return;

      try {
        await supabase.from('dice_rolls').insert({
          campaign_player_id: campaignPlayerId,
          expression,
          results: result.results,
          modifier: result.modifier,
          total: result.total,
          is_critical_success: result.isCriticalSuccess,
          is_critical_fail: result.isCriticalFail,
          context: context ?? null,
          rolled_at: new Date().toISOString(),
        });
      } catch {
        // Non-critical — silently ignore persistence errors
      }
    },
    [campaignPlayerId],
  );

  // ─── roll(expression) ─────────────────────────────────────────────

  const roll = useCallback(
    async (expression: string, context?: string): Promise<DiceRoll> => {
      setIsRolling(true);

      // Brief animation delay before committing the result to UI
      await new Promise<void>((resolve) => setTimeout(resolve, ANIMATION_DELAY_MS));

      const result = rollDice(expression);
      setLastRoll(result);
      setIsRolling(false);

      void persistRoll(expression, result, context);

      return result;
    },
    [persistRoll],
  );

  // ─── rollD20() ────────────────────────────────────────────────────

  const rollD20Hook = useCallback(
    async (context?: string): Promise<DiceRoll> => {
      setIsRolling(true);

      await new Promise<void>((resolve) => setTimeout(resolve, ANIMATION_DELAY_MS));

      const result = rollD20();
      setLastRoll(result);
      setIsRolling(false);

      void persistRoll('d20', result, context);

      return result;
    },
    [persistRoll],
  );

  // ─── rollAttribute(attributeValue, difficulty) ────────────────────

  const rollAttributeHook = useCallback(
    async (
      attributeValue: number,
      difficulty: number,
      context?: string,
    ): Promise<AttributeTestResult> => {
      setIsRolling(true);

      await new Promise<void>((resolve) => setTimeout(resolve, ANIMATION_DELAY_MS));

      const result = engineRollAttribute(attributeValue, difficulty);

      // Represent the d20 portion as the lastRoll so DiceRoller components can display it
      const diceRollRepresentation: DiceRoll = {
        dice: 'd20',
        results: [result.roll],
        modifier: result.modifier,
        total: result.total,
        expression: `d20${result.modifier >= 0 ? '+' : ''}${result.modifier} vs DC${difficulty}`,
        isCriticalSuccess: result.outcome === 'critical_success',
        isCriticalFail: result.outcome === 'critical_failure',
      };

      setLastRoll(diceRollRepresentation);
      setIsRolling(false);

      void persistRoll(
        `d20 vs DC${difficulty}`,
        diceRollRepresentation,
        context,
      );

      return result;
    },
    [persistRoll],
  );

  return {
    lastRoll,
    isRolling,
    roll,
    rollD20: rollD20Hook,
    rollAttribute: rollAttributeHook,
  };
}
