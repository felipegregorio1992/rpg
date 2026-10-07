// ─── LoadingSpinner ───────────────────────────────────────────
// Arcane runic circle — CSS animated via Tailwind + inline SVG

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizePx: Record<NonNullable<LoadingSpinnerProps['size']>, number> = {
  sm: 16,
  md: 32,
  lg: 56,
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const px = sizePx[size];

  return (
    <span
      role="status"
      aria-label="Carregando…"
      className={`inline-block ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {/* Outer ring — slow spin */}
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="#b45309"
          strokeWidth="2"
          strokeDasharray="12 6"
          style={{ transformOrigin: '28px 28px', animation: 'spin 3s linear infinite' }}
        />
        {/* Inner ring — reverse spin */}
        <circle
          cx="28"
          cy="28"
          r="16"
          stroke="#818cf8"
          strokeWidth="1.5"
          strokeDasharray="8 8"
          style={{
            transformOrigin: '28px 28px',
            animation: 'spin 2s linear infinite reverse',
          }}
        />
        {/* Rune dots — 4 cardinal glyphs */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 28 + 24 * Math.sin(rad);
          const cy = 28 - 24 * Math.cos(rad);
          return (
            <circle key={deg} cx={cx} cy={cy} r="2.5" fill="#f59e0b" opacity="0.85" />
          );
        })}
        {/* Centre rune diamond */}
        <path
          d="M28 22 L34 28 L28 34 L22 28 Z"
          stroke="#f59e0b"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
          style={{ transformOrigin: '28px 28px', animation: 'spin 4s linear infinite' }}
        />
      </svg>

      {/* Inject keyframe only once via a style tag — Tailwind's `animate-spin` alone
          doesn't cover the reverse-spin variant we need. */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}
