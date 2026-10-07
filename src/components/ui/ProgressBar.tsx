// ─── ProgressBar ─────────────────────────────────────────────

type ProgressBarType = 'hp' | 'mana' | 'xp' | 'energy';

interface ProgressBarProps {
  type: ProgressBarType;
  current: number;
  max: number;
  label?: string;
  className?: string;
}

// Colours per type
const trackClasses: Record<ProgressBarType, string> = {
  hp: 'bg-stone-800',
  mana: 'bg-stone-800',
  xp: 'bg-stone-800',
  energy: 'bg-stone-800',
};

const fillClasses: Record<ProgressBarType, string> = {
  hp: 'bg-gradient-to-r from-blood-700 to-blood-500',
  mana: 'bg-gradient-to-r from-arcane-600 to-arcane-400',
  xp: 'bg-gradient-to-r from-ember-600 to-ember-400',
  energy: 'bg-gradient-to-r from-forest-700 to-forest-600',
};

const labelColorClasses: Record<ProgressBarType, string> = {
  hp: 'text-blood-500',
  mana: 'text-arcane-400',
  xp: 'text-ember-400',
  energy: 'text-forest-600',
};

const defaultLabels: Record<ProgressBarType, string> = {
  hp: 'HP',
  mana: 'Mana',
  xp: 'XP',
  energy: 'Energia',
};

export function ProgressBar({ type, current, max, label, className = '' }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const percentage = Math.min(100, Math.max(0, (current / safeMax) * 100));
  const displayLabel = label ?? defaultLabels[type];

  return (
    <div className={`w-full ${className}`}>
      {/* Label row */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-cinzel tracking-wide uppercase ${labelColorClasses[type]}`}>
          {displayLabel}
        </span>
        <span className="text-xs text-parchment-200/60 font-crimson">
          {current} / {max}
        </span>
      </div>

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={displayLabel}
        className={`h-2 w-full rounded-full overflow-hidden ${trackClasses[type]}`}
      >
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fillClasses[type]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
