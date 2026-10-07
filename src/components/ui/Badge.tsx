import type { ItemRarity } from '../../types';

// ─── Types ────────────────────────────────────────────────────

type BadgeVariant = ItemRarity | 'status';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

// ─── Rarity style map ─────────────────────────────────────────

const rarityClasses: Record<ItemRarity, string> = {
  common:
    'bg-stone-800 text-stone-300 border border-stone-600/50',
  uncommon:
    'bg-forest-700/20 text-forest-600 border border-forest-600/40',
  rare:
    'bg-arcane-600/15 text-arcane-400 border border-arcane-500/40',
  epic:
    'bg-purple-900/20 text-purple-400 border border-purple-500/40',
  legendary:
    // Animated golden shimmer
    'bg-ember-600/10 text-ember-400 border border-ember-500/50 ' +
    '[background-image:linear-gradient(90deg,transparent_0%,rgba(245,158,11,0.15)_50%,transparent_100%)] ' +
    '[background-size:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]',
};

const rarityLabels: Record<ItemRarity, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

// ─── Component ────────────────────────────────────────────────

export function Badge({ variant, label, className = '' }: BadgeProps) {
  const isRarity = variant !== 'status';
  const classes = isRarity ? rarityClasses[variant as ItemRarity] : 'bg-stone-800 text-parchment-200 border border-stone-600/50';

  return (
    <>
      {/* Inject shimmer keyframe for legendary badges */}
      {variant === 'legendary' && (
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      )}
      <span
        className={[
          'inline-flex items-center px-2 py-0.5',
          'text-xs font-cinzel tracking-wide rounded-full',
          classes,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isRarity ? rarityLabels[variant as ItemRarity] : label}
      </span>
    </>
  );
}
