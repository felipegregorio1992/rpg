import { Coins } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { getAttributeModifier } from '../../game/dice/diceEngine';
import type { Character, CharacterAttributes } from '../../types';

// ─── Types ────────────────────────────────────────────────────

interface CharacterSheetProps {
  character: Character;
  className?: string;
}

// ─── Attribute row ────────────────────────────────────────────

const ATTRIBUTE_LABELS: Record<keyof CharacterAttributes, string> = {
  strength: 'FOR',
  dexterity: 'DES',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'SAB',
  charisma: 'CAR',
};

const CLASS_LABELS: Record<string, string> = {
  warrior: 'Guerreiro',
  mage: 'Mago',
  archer: 'Arqueiro',
  rogue: 'Ladino',
  cleric: 'Clérigo',
  paladin: 'Paladino',
};

const RACE_LABELS: Record<string, string> = {
  human: 'Humano',
  elf: 'Elfo',
  dwarf: 'Anão',
  halfling: 'Halfling',
  orc: 'Orc',
  'half-elf': 'Meio-Elfo',
};

function AttributeRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const mod = getAttributeModifier(value);
  const modText = mod >= 0 ? `+${mod}` : `${mod}`;

  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="font-cinzel text-xs text-parchment-200/60 tracking-wider w-8">
        {label}
      </span>
      <span className="font-cinzel text-sm text-parchment-100 w-6 text-center">
        {value}
      </span>
      <span
        className={`font-cinzel text-xs w-8 text-right ${
          mod > 0 ? 'text-ember-400' : mod < 0 ? 'text-blood-500' : 'text-parchment-200/40'
        }`}
      >
        {modText}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export function CharacterSheet({ character, className = '' }: CharacterSheetProps) {
  const {
    name,
    class: charClass,
    race,
    level,
    experience,
    experienceToNextLevel,
    currentHp,
    maxHp,
    currentMana,
    maxMana,
    currentEnergy,
    maxEnergy,
    gold,
    attributes,
  } = character;

  const classLabel = CLASS_LABELS[charClass] ?? charClass;
  const raceLabel = RACE_LABELS[race] ?? race;

  return (
    <aside
      className={[
        'flex flex-col gap-3 p-4 bg-stone-900 border border-stone-800 rounded-sm',
        'text-parchment-100 font-crimson',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Identity */}
      <div className="border-b border-stone-800 pb-3">
        <h2 className="font-cinzel text-base font-semibold tracking-wide text-ember-400 truncate">
          {name}
        </h2>
        <p className="text-xs text-parchment-200/60 mt-0.5">
          {raceLabel} · {classLabel} · Nível {level}
        </p>
      </div>

      {/* Vitals */}
      <div className="flex flex-col gap-2">
        <ProgressBar type="hp" current={currentHp} max={maxHp} />
        {maxMana > 0 && (
          <ProgressBar type="mana" current={currentMana} max={maxMana} />
        )}
        {maxEnergy > 0 && (
          <ProgressBar type="energy" current={currentEnergy} max={maxEnergy} />
        )}
        <ProgressBar
          type="xp"
          current={experience}
          max={experienceToNextLevel}
          label="XP"
        />
      </div>

      {/* Attributes */}
      <div className="border-t border-stone-800 pt-3">
        <p className="font-cinzel text-xs text-parchment-200/40 uppercase tracking-widest mb-1">
          Atributos
        </p>
        <div className="flex flex-col">
          {(Object.entries(ATTRIBUTE_LABELS) as [keyof CharacterAttributes, string][]).map(
            ([key, label]) => (
              <AttributeRow key={key} label={label} value={attributes[key]} />
            ),
          )}
        </div>
      </div>

      {/* Gold */}
      <div className="border-t border-stone-800 pt-3 flex items-center gap-2">
        <Coins size={14} className="text-ember-400 shrink-0" aria-hidden="true" />
        <span className="font-cinzel text-sm text-ember-400">{gold}</span>
        <span className="text-xs text-parchment-200/50">Tarenos</span>
      </div>
    </aside>
  );
}
