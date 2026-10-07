import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NarrativeMessage, NarrativeMessageType } from '../../types';

// ─── Types ────────────────────────────────────────────────────

interface NarrativeDisplayProps {
  messages: NarrativeMessage[];
  className?: string;
}

// ─── Per-type style config ────────────────────────────────────

interface MessageStyle {
  containerClass: string;
  textClass: string;
  labelClass?: string;
  label?: string;
}

const MESSAGE_STYLES: Record<NarrativeMessageType, MessageStyle> = {
  narrator: {
    containerClass: 'pl-4 border-l-2 border-ember-600/30',
    textClass: 'font-crimson italic text-parchment-100 leading-relaxed text-base',
  },
  player: {
    containerClass:
      'ml-8 pl-4 border-l-2 border-arcane-500/40 bg-stone-800/40 rounded-r-sm py-1',
    textClass: 'font-crimson text-parchment-200 text-sm',
    labelClass: 'text-arcane-400 text-xs font-cinzel uppercase tracking-wide mb-0.5',
    label: 'Você',
  },
  system: {
    containerClass: '',
    textClass: 'font-crimson text-xs text-ember-500/70 italic',
  },
  dice_roll: {
    containerClass:
      'bg-stone-800/60 border border-ember-600/20 rounded px-4 py-2 inline-flex flex-col gap-0.5',
    textClass: 'font-cinzel text-sm text-ember-400',
    label: '🎲 Rolagem de Dado',
    labelClass: 'font-cinzel text-xs text-parchment-200/40 uppercase tracking-wider mb-1',
  },
  combat: {
    containerClass: 'border-l-2 border-blood-500/50 pl-3 bg-blood-700/10 py-1 rounded-r-sm',
    textClass: 'font-cinzel text-sm font-semibold text-parchment-100',
    label: '⚔ Combate',
    labelClass: 'font-cinzel text-xs text-blood-500 uppercase tracking-wider mb-0.5',
  },
  npc_dialogue: {
    containerClass: 'pl-4 border-l-2 border-forest-600/40 bg-stone-800/30 rounded-r-sm py-1',
    textClass: 'font-crimson text-parchment-200 text-base italic',
    labelClass: 'font-cinzel text-xs text-forest-600 uppercase tracking-wide mb-0.5',
  },
};

// ─── Single message ───────────────────────────────────────────

function Message({ msg }: { msg: NarrativeMessage }) {
  const style = MESSAGE_STYLES[msg.type];

  // For npc_dialogue, extract speaker from metadata if present
  const npcName =
    msg.type === 'npc_dialogue' && msg.metadata?.npcName
      ? String(msg.metadata.npcName)
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full ${style.containerClass}`}
    >
      {style.label && (
        <p className={style.labelClass}>{npcName ?? style.label}</p>
      )}
      {npcName && msg.type === 'npc_dialogue' && (
        <p className={style.labelClass}>{npcName}</p>
      )}
      <p className={style.textClass}>{msg.content}</p>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────

export function NarrativeDisplay({ messages, className = '' }: NarrativeDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      aria-live="polite"
      aria-label="Narrativa da aventura"
      className={[
        'flex flex-col gap-4 overflow-y-auto',
        'pr-2', // space for scrollbar
        // Custom scrollbar via global index.css styles
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
      </AnimatePresence>

      {/* Sentinel for auto-scroll */}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
