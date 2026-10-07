import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Maximum width class — defaults to max-w-lg */
  maxWidth?: string;
}

// ─── Focus trap helper ────────────────────────────────────────

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
  'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function trapFocus(containerEl: HTMLElement, e: KeyboardEvent) {
  const nodes = Array.from(containerEl.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (nodes.length === 0) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ─── Component ────────────────────────────────────────────────

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        trapFocus(dialogRef.current, e);
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    // Move focus into the dialog
    const frame = requestAnimationFrame(() => {
      if (dialogRef.current) {
        const firstFocusable = dialogRef.current.querySelector<HTMLElement>(FOCUSABLE);
        (firstFocusable ?? dialogRef.current).focus();
      }
    });
    // Prevent body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(frame);
      document.body.style.overflow = prev;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Dark scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        tabIndex={-1}
        className={[
          'relative w-full outline-none',
          maxWidth,
          'bg-stone-900 border border-stone-800 rounded-sm',
          'shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(245,158,11,0.08)]',
          // Ornamental glow edge
          'before:absolute before:inset-0 before:pointer-events-none',
          'before:rounded-sm before:border before:border-ember-600/20',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2
            id={titleId.current}
            className="font-cinzel text-lg font-semibold tracking-wider text-ember-400"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-parchment-200/50 hover:text-parchment-100 transition-colors
                       rounded focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-ember-400/60 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-parchment-100 font-crimson">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
