import React from 'react';

// ─── Types ────────────────────────────────────────────────────

type CardVariant = 'parchment' | 'stone' | 'glass';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
}

// ─── Style maps ───────────────────────────────────────────────

const variantClasses: Record<CardVariant, string> = {
  parchment:
    'bg-parchment-100 text-stone-900 border border-parchment-200 ' +
    'shadow-[inset_0_0_40px_rgba(180,83,9,0.08)]',
  stone:
    'bg-stone-900 text-parchment-100 border border-stone-800 ' +
    'shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]',
  glass:
    'bg-stone-950/70 backdrop-blur-sm text-parchment-100 ' +
    'border border-parchment-200/10 shadow-[inset_0_0_30px_rgba(245,158,11,0.04)]',
};

const titleVariantClasses: Record<CardVariant, string> = {
  parchment: 'text-stone-800 border-b border-parchment-200',
  stone: 'text-ember-400 border-b border-stone-800',
  glass: 'text-parchment-100 border-b border-parchment-200/15',
};

// ─── Ornamental corner — rendered as absolute SVG ─────────────

function OrnamentalCorner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={`absolute pointer-events-none opacity-40 ${className}`}
    >
      <path d="M2 18 L2 2 L18 2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="2" cy="2" r="2" fill="currentColor" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────

export function Card({
  children,
  variant = 'stone',
  title,
  footer,
  className = '',
}: CardProps) {
  const isLight = variant === 'parchment';

  return (
    <div
      className={[
        'relative rounded-sm overflow-hidden',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Ornamental corners */}
      <OrnamentalCorner
        className={`top-1 left-1 ${isLight ? 'text-stone-700' : 'text-ember-500'}`}
      />
      <OrnamentalCorner
        className={`top-1 right-1 rotate-90 ${isLight ? 'text-stone-700' : 'text-ember-500'}`}
      />
      <OrnamentalCorner
        className={`bottom-1 left-1 -rotate-90 ${isLight ? 'text-stone-700' : 'text-ember-500'}`}
      />
      <OrnamentalCorner
        className={`bottom-1 right-1 rotate-180 ${isLight ? 'text-stone-700' : 'text-ember-500'}`}
      />

      {/* Title */}
      {title && (
        <div className={`px-5 py-3 ${titleVariantClasses[variant]}`}>
          <h2 className="font-cinzel text-base font-semibold tracking-wider uppercase">
            {title}
          </h2>
        </div>
      )}

      {/* Body */}
      <div className="p-5">{children}</div>

      {/* Footer */}
      {footer && (
        <div
          className={`px-5 py-3 ${isLight ? 'border-t border-parchment-200' : 'border-t border-stone-800'}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
