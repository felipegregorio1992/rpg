import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// ─── Types ────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// ─── Style maps ───────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ember-600 hover:bg-ember-500 text-parchment-50 border border-ember-400/40 ' +
    'shadow-[0_0_8px_rgba(245,158,11,0.25)] hover:shadow-[0_0_14px_rgba(245,158,11,0.45)] ' +
    'active:bg-ember-600',
  secondary:
    'bg-stone-800 hover:bg-stone-900 text-parchment-100 border border-stone-700/60 ' +
    'hover:border-parchment-200/30 active:bg-stone-900',
  danger:
    'bg-blood-600 hover:bg-blood-500 text-parchment-50 border border-blood-500/40 ' +
    'shadow-[0_0_8px_rgba(139,26,26,0.3)] hover:shadow-[0_0_14px_rgba(139,26,26,0.5)] ' +
    'active:bg-blood-700',
  ghost:
    'bg-transparent hover:bg-stone-800/60 text-parchment-200 border border-transparent ' +
    'hover:border-stone-700/60 active:bg-stone-800',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-base gap-2',
  lg: 'px-7 py-3 text-lg gap-2.5',
};

// ─── Component ────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  variant = 'primary',
  size = 'md',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-cinzel tracking-wide',
        'rounded transition-all duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400/60',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading && (
        <span className="shrink-0">
          <LoadingSpinner size="sm" />
        </span>
      )}
      {children}
    </button>
  );
}
