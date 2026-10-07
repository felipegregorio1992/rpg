import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// ─── Types ────────────────────────────────────────────────────

interface ActionInputProps {
  onSubmit: (action: string) => void;
  suggestedActions?: string[];
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────

export function ActionInput({
  onSubmit,
  suggestedActions = [],
  isLoading = false,
}: ActionInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = value.trim().length > 0 && !isLoading;

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue('');
    textareaRef.current?.focus();
  }, [value, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter sends; Shift+Enter inserts newline
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleSuggestion = useCallback(
    (action: string) => {
      setValue(action);
      textareaRef.current?.focus();
    },
    [],
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Suggested actions */}
      {suggestedActions.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-2">
          {suggestedActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleSuggestion(action)}
              className="text-xs font-crimson italic text-parchment-200/70 hover:text-parchment-100
                         bg-stone-800/60 hover:bg-stone-800 border border-stone-700/40
                         hover:border-ember-600/30 rounded px-3 py-1 transition-all duration-150
                         focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember-400/60"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 text-parchment-200/50 text-sm font-crimson italic py-1">
          <LoadingSpinner size="sm" />
          <span>O Mestre está narrando…</span>
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={2}
          placeholder="O que você faz? (Enter para enviar, Shift+Enter para nova linha)"
          aria-label="Ação do jogador"
          className={[
            'flex-1 resize-none rounded-sm px-4 py-2.5',
            'bg-stone-900 border border-stone-700/60 text-parchment-100',
            'font-crimson text-base leading-snug placeholder-parchment-200/25',
            'transition-colors duration-150',
            'focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            // Custom scrollbar inherits global styles
          ]
            .filter(Boolean)
            .join(' ')}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="Enviar ação"
          className={[
            'shrink-0 p-3 rounded-sm border transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400/60',
            canSubmit
              ? 'bg-ember-600 hover:bg-ember-500 border-ember-400/40 text-parchment-50 ' +
                'shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:shadow-[0_0_16px_rgba(245,158,11,0.45)]'
              : 'bg-stone-800 border-stone-700/40 text-parchment-200/30 cursor-not-allowed',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
