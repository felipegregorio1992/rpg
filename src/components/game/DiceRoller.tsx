import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rollDice } from '../../game/dice/diceEngine';
import type { DiceRoll } from '../../types';

// ─── Types ────────────────────────────────────────────────────

interface DiceRollerProps {
  /** Called with the completed DiceRoll after animation finishes */
  onRoll?: (result: DiceRoll) => void;
  /** Dice expression — defaults to d20 */
  expression?: string;
}

// ─── D20 face SVG ─────────────────────────────────────────────

function D20Face({ value, isCrit, isFail }: { value: number; isCrit: boolean; isFail: boolean }) {
  const faceColor = isCrit
    ? '#f59e0b'
    : isFail
      ? '#8b1a1a'
      : '#1a1714';
  const strokeColor = isCrit ? '#f59e0b' : isFail ? '#8b1a1a' : '#b45309';

  return (
    <svg
      viewBox="0 0 120 120"
      width="120"
      height="120"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Icosahedron silhouette (simplified d20) */}
      <polygon
        points="60,8 110,35 110,85 60,112 10,85 10,35"
        fill={faceColor}
        stroke={strokeColor}
        strokeWidth="2"
      />
      {/* Inner dividing lines */}
      <line x1="60" y1="8" x2="60" y2="112" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
      <line x1="10" y1="35" x2="110" y2="85" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
      <line x1="110" y1="35" x2="10" y2="85" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
      {/* Value */}
      <text
        x="60"
        y="66"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="30"
        fontFamily="Cinzel, serif"
        fontWeight="700"
        fill={isCrit ? '#1a1714' : isFail ? '#f5e6c8' : '#f5e6c8'}
      >
        {value}
      </text>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────

export function DiceRoller({ onRoll, expression = 'd20' }: DiceRollerProps) {
  const [result, setResult] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState<number>(20);

  const handleRoll = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    const finalResult = rollDice(expression);

    // Animate random numbers for 700 ms, then land on the real result
    let ticks = 0;
    const totalTicks = 14;
    const interval = setInterval(() => {
      ticks++;
      // Show random numbers during animation
      const fakeSides = finalResult.results.length === 1 && expression.includes('20') ? 20 : 6;
      setDisplayValue(Math.floor(Math.random() * fakeSides) + 1);

      if (ticks >= totalTicks) {
        clearInterval(interval);
        setDisplayValue(finalResult.total);
        setResult(finalResult);
        setIsRolling(false);
        onRoll?.(finalResult);
      }
    }, 50);
  }, [isRolling, expression, onRoll]);

  const isCrit = result?.isCriticalSuccess ?? false;
  const isFail = result?.isCriticalFail ?? false;

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Dice face */}
      <motion.div
        className="cursor-pointer"
        onClick={handleRoll}
        whileTap={{ scale: 0.92 }}
        animate={
          isRolling
            ? { rotate: [0, 15, -15, 10, -10, 5, -5, 0], transition: { duration: 0.7 } }
            : isCrit
              ? { scale: [1, 1.12, 1], transition: { duration: 0.4 } }
              : isFail
                ? {
                    x: [0, -6, 6, -4, 4, -2, 2, 0],
                    transition: { duration: 0.5 },
                  }
                : {}
        }
      >
        {/* Glow wrapper */}
        <div
          className="rounded-full transition-all duration-300"
          style={{
            filter: isCrit
              ? 'drop-shadow(0 0 16px rgba(245,158,11,0.9))'
              : isFail
                ? 'drop-shadow(0 0 14px rgba(139,26,26,0.9))'
                : isRolling
                  ? 'drop-shadow(0 0 8px rgba(181,83,9,0.5))'
                  : 'drop-shadow(0 0 4px rgba(181,83,9,0.2))',
          }}
        >
          <D20Face value={displayValue} isCrit={isCrit} isFail={isFail} />
        </div>
      </motion.div>

      {/* Result label */}
      <AnimatePresence mode="wait">
        {result && !isRolling && (
          <motion.div
            key={result.total}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            {isCrit && (
              <p className="font-cinzel text-sm text-ember-400 uppercase tracking-widest mb-1 animate-pulse">
                Sucesso Crítico!
              </p>
            )}
            {isFail && (
              <p className="font-cinzel text-sm text-blood-500 uppercase tracking-widest mb-1">
                Falha Crítica
              </p>
            )}
            <p className="text-xs text-parchment-200/50 font-crimson">
              {result.expression}
              {result.results.length > 1 && ` → [${result.results.join(', ')}]`}
              {result.modifier !== 0 &&
                ` ${result.modifier > 0 ? '+' : ''}${result.modifier}`}
              {' '}= <span className="text-parchment-100 font-semibold">{result.total}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={isRolling}
        className="font-cinzel text-sm tracking-wider uppercase px-5 py-2 rounded
                   bg-ember-600 hover:bg-ember-500 text-parchment-50 border border-ember-400/40
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400/60"
      >
        {isRolling ? 'Rolando…' : `Rolar ${expression.toUpperCase()}`}
      </button>
    </div>
  );
}
