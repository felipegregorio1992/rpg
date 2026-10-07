import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useGameStore } from '../store/gameStore';

interface SystemCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  diceSystem: string;
  available: boolean;
  selected: boolean;
  onSelect: () => void;
}

function SystemCard({
  emoji,
  title,
  subtitle,
  description,
  diceSystem,
  available,
  selected,
  onSelect,
}: SystemCardProps) {
  return (
    <Card
      className={`transition-all ${
        available ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
      } ${
        selected
          ? 'border-ember-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
          : available
            ? 'border-stone-800 hover:border-stone-600'
            : 'border-stone-800'
      }`}
      onClick={available ? onSelect : undefined}
    >
      {/* Availability badge */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-3xl" role="img" aria-label={title}>
          {emoji}
        </span>
        {available ? (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-forest-700/20 text-forest-600 border border-forest-600/40">
            Disponível
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-stone-800 text-stone-400 border border-stone-600/50">
            Em Breve
          </span>
        )}
      </div>

      {/* Title and subtitle */}
      <h3 className="font-cinzel text-lg font-semibold text-ember-400 mb-1">
        {title}
      </h3>
      <p className="font-crimson text-sm text-parchment-200/60 mb-3 italic">
        {subtitle}
      </p>

      {/* Description */}
      <p className="font-crimson text-sm text-parchment-200/80 mb-4 leading-relaxed">
        {description}
      </p>

      {/* Dice system */}
      <div className="border-t border-stone-800 pt-3">
        <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
          Sistema de Dados
        </p>
        <p className="font-crimson text-sm text-ember-400 font-semibold">
          {diceSystem}
        </p>
      </div>
    </Card>
  );
}

export function GameSystemSelectPage() {
  const setSelectedSystem = useGameStore((s) => s.setSelectedSystem);
  const selectedSystem = useGameStore((s) => s.selectedSystem);
  const navigate = useNavigate();

  const handleSelect = (system: 'fabulas-goblins') => {
    setSelectedSystem(system);
    navigate('/create-character');
  };

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-cinzel text-4xl font-bold text-ember-400 tracking-wider mb-3">
            Escolha seu Sistema de Jogo
          </h1>
          <p className="font-crimson text-lg text-parchment-200/60">
            Selecione o sistema de regras para sua aventura
          </p>
        </div>

        {/* System cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Fábulas & Goblins — AVAILABLE */}
          <SystemCard
            emoji="🍄"
            title="Fábulas & Goblins"
            subtitle="Fast Play — Terras Místicas"
            description="Um mundo único onde o Blecaute baniu a magia direta. Grimos são artefatos que permitem canalizar poderes. Espécies únicas como Goblins, Armadons e Metaloides habitam as Terras Místicas."
            diceSystem="2d20 — pega o maior"
            available={true}
            selected={selectedSystem === 'fabulas-goblins'}
            onSelect={() => handleSelect('fabulas-goblins')}
          />

          {/* Card 2: D&D 5e — SOON */}
          <SystemCard
            emoji="🐉"
            title="D&D 5e"
            subtitle="Dungeons & Dragons"
            description="O sistema de RPG mais popular do mundo. Domine magias, enfrente dragões e explore masmorras repletas de tesouros e perigos em um universo de fantasia clássica."
            diceSystem="d20 — rolagem única"
            available={false}
            selected={false}
            onSelect={() => {}}
          />

          {/* Card 3: Sistema Próprio — SOON */}
          <SystemCard
            emoji="⚙️"
            title="Sistema Próprio"
            subtitle="Crie suas próprias regras"
            description="Construa seu sistema de regras do zero. Defina seus próprios atributos, mecânicas de dados e como o Mestre de IA deve interpretar suas ações únicas."
            diceSystem="Personalizável"
            available={false}
            selected={false}
            onSelect={() => {}}
          />
        </div>

        {/* Info footer */}
        <p className="text-center font-crimson text-sm text-parchment-200/40 mt-10">
          Mais sistemas serão adicionados em breve. Cada sistema traz sua própria experiência única de jogo.
        </p>
      </div>
    </div>
  );
}
