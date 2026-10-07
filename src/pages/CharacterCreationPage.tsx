import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  CLASS_DEFINITIONS,
  RACE_DEFINITIONS,
  calculateBaseAttributes,
  calculateDerivedStats,
} from '../game/character/characterCreation';
import {
  FG_SPECIES_DEFINITIONS,
  FG_GRIMO_DEFINITIONS,
  FG_ROLE_DEFINITIONS,
  FG_CULTURE_DEFINITIONS,
  calculateFGCharacter,
} from '../game/character/fgCharacterCreation';
import { createCharacter } from '../services/supabase/characterService';
import { supabase } from '../services/supabase/client';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import type { CharacterClass, CharacterRace, CharacterAttributes } from '../types';
import type { FGSpecies, FGGrimo, FGRole, FGCulture } from '../types/fabulasGoblins';

// ─── Generic wizard ───────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

function GenericCharacterWizard() {
  const [step, setStep] = useState<Step>(1);
  const [selectedRace, setSelectedRace] = useState<CharacterRace | null>(null);
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [personality, setPersonality] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const canProceed = (): boolean => {
    if (step === 1 && !selectedRace) return false;
    if (step === 2 && !selectedClass) return false;
    if (step === 3 && name.trim().length < 2) return false;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleCreate = async () => {
    if (!user || !selectedRace || !selectedClass || !name.trim()) {
      setError('Dados incompletos');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const attributes = calculateBaseAttributes(selectedClass, selectedRace);
    const derived = calculateDerivedStats(selectedClass, attributes, 1);

    void derived; // used for preview only

    const characterData = {
      name: name.trim(),
      class: selectedClass,
      race: selectedRace,
      background: background.trim() || 'Um aventureiro em busca de sua sorte.',
      personality: personality.trim() || 'Corajoso e determinado.',
      description: `${RACE_DEFINITIONS[selectedRace].name} ${CLASS_DEFINITIONS[selectedClass].name} de nível 1.`,
      attributes,
    };

    try {
      const { data: character, error: createError } = await createCharacter(
        user.id,
        characterData,
      );

      if (createError || !character) {
        setError(createError ?? 'Falha ao criar personagem');
        return;
      }

      navigate('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewAttributes: CharacterAttributes | null =
    selectedRace && selectedClass
      ? calculateBaseAttributes(selectedClass, selectedRace)
      : null;

  const previewDerived =
    selectedClass && previewAttributes
      ? calculateDerivedStats(selectedClass, previewAttributes, 1)
      : null;

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-4xl font-bold text-ember-400 tracking-wider mb-2">
            Criação de Personagem
          </h1>
          <p className="font-crimson text-parchment-200/60">Etapa {step} de 4</p>
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-all ${s <= step ? 'bg-ember-600' : 'bg-stone-800'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              Escolha sua Raça
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(RACE_DEFINITIONS).map((race) => (
                <Card
                  key={race.id}
                  className={`cursor-pointer transition-all ${
                    selectedRace === race.id
                      ? 'border-ember-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                  onClick={() => setSelectedRace(race.id)}
                >
                  <h3 className="font-cinzel text-lg font-semibold text-ember-400 mb-2">
                    {race.name}
                  </h3>
                  <p className="font-crimson text-sm text-parchment-200/80 mb-3">
                    {race.description}
                  </p>
                  <div className="mb-3">
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Bônus de Atributos
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(race.attributeBonus).map(([attr, bonus]) => (
                        <span
                          key={attr}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-stone-800 text-stone-300 border border-stone-600/50"
                        >
                          {attr.slice(0, 3).toUpperCase()} {bonus && bonus > 0 ? '+' : ''}{bonus}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="font-crimson text-xs italic text-parchment-200/60">
                    {race.flavorText}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              Escolha sua Classe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(CLASS_DEFINITIONS).map((cls) => (
                <Card
                  key={cls.id}
                  className={`cursor-pointer transition-all ${
                    selectedClass === cls.id
                      ? 'border-ember-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                  onClick={() => setSelectedClass(cls.id)}
                >
                  <h3 className="font-cinzel text-lg font-semibold text-ember-400 mb-2">
                    {cls.name}
                  </h3>
                  <p className="font-crimson text-sm text-parchment-200/80 mb-3">
                    {cls.description}
                  </p>
                  <div className="mb-2">
                    <p className="font-crimson text-xs text-parchment-200/60">
                      <strong>Atributo Primário:</strong> {cls.primaryAttribute}
                    </p>
                    <p className="font-crimson text-xs text-parchment-200/60">
                      <strong>HP base:</strong> {cls.baseHp} + {cls.hpPerLevel}/nível
                    </p>
                    {cls.baseMana > 0 && (
                      <p className="font-crimson text-xs text-parchment-200/60">
                        <strong>Mana base:</strong> {cls.baseMana} + {cls.manaPerLevel}/nível
                      </p>
                    )}
                  </div>
                  <p className="font-crimson text-xs italic text-parchment-200/60">
                    {cls.flavorText}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              História do Personagem
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="char-name" className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide">
                  Nome do Personagem *
                </label>
                <input
                  id="char-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Thorin Escudo de Ferro"
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60 text-parchment-100 font-crimson rounded-sm focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30 placeholder-parchment-200/25 transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="char-background" className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide">
                  Background (Opcional)
                </label>
                <textarea
                  id="char-background"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="De onde você veio? Que eventos marcaram sua vida?"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60 text-parchment-100 font-crimson rounded-sm resize-none focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30 placeholder-parchment-200/25 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="char-personality" className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide">
                  Personalidade (Opcional)
                </label>
                <textarea
                  id="char-personality"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Como você age? Qual sua atitude perante o mundo?"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60 text-parchment-100 font-crimson rounded-sm resize-none focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30 placeholder-parchment-200/25 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && selectedRace && selectedClass && previewAttributes && previewDerived && (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              Confirmar Personagem
            </h2>
            <Card className="border-ember-600/40">
              <h3 className="font-cinzel text-xl font-semibold text-ember-400 mb-4">
                {name || 'Sem Nome'}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide">Raça</p>
                  <p className="font-crimson text-base text-parchment-100">{RACE_DEFINITIONS[selectedRace].name}</p>
                </div>
                <div>
                  <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide">Classe</p>
                  <p className="font-crimson text-base text-parchment-100">{CLASS_DEFINITIONS[selectedClass].name}</p>
                </div>
              </div>
              <div className="border-t border-stone-800 pt-4 mb-4">
                <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-2">Atributos</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(previewAttributes).map(([attr, value]) => (
                    <div key={attr} className="text-center">
                      <p className="font-cinzel text-xs text-parchment-200/60 uppercase">{attr.slice(0, 3)}</p>
                      <p className="font-cinzel text-lg text-ember-400">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-stone-800 pt-4">
                <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-2">Status Iniciais</p>
                <div className="grid grid-cols-2 gap-2 text-sm font-crimson text-parchment-200">
                  <p>HP: {previewDerived.maxHp}</p>
                  <p>Mana: {previewDerived.maxMana}</p>
                  <p>Ataque: +{previewDerived.attack}</p>
                  <p>Defesa: +{previewDerived.defense}</p>
                  <p>Iniciativa: +{previewDerived.initiative}</p>
                  <p>Crítico: {previewDerived.criticalChance}%</p>
                </div>
              </div>
              {background && (
                <div className="border-t border-stone-800 pt-4 mt-4">
                  <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">Background</p>
                  <p className="font-crimson text-sm text-parchment-200/80 italic">{background}</p>
                </div>
              )}
              {personality && (
                <div className="border-t border-stone-800 pt-4 mt-4">
                  <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">Personalidade</p>
                  <p className="font-crimson text-sm text-parchment-200/80 italic">{personality}</p>
                </div>
              )}
            </Card>
            {error && (
              <div className="mt-4 px-4 py-2 bg-blood-700/20 border border-blood-500/40 rounded text-sm font-crimson text-blood-500">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-10 max-w-2xl mx-auto">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || isSubmitting}>
            Voltar
          </Button>
          {step < 4 && (
            <Button variant="primary" onClick={handleNext} disabled={!canProceed()}>
              Próximo
            </Button>
          )}
          {step === 4 && (
            <Button
              variant="primary"
              onClick={handleCreate}
              loading={isSubmitting}
              disabled={isSubmitting || !name.trim()}
            >
              Criar Personagem
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── F&G wizard ───────────────────────────────────────────────

type FGStep = 1 | 2 | 3 | 4 | 5;

function FGCharacterWizard() {
  const [step, setStep] = useState<FGStep>(1);
  const [selectedSpecies, setSelectedSpecies] = useState<FGSpecies | null>(null);
  const [selectedGrimo, setSelectedGrimo] = useState<FGGrimo | null>(null);
  const [selectedRole, setSelectedRole] = useState<FGRole | null>(null);
  const [selectedCulture, setSelectedCulture] = useState<FGCulture | null>(null);
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [personality, setPersonality] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const setFGCharacter = useGameStore((s) => s.setFGCharacter);
  const navigate = useNavigate();

  const canProceed = (): boolean => {
    if (step === 1 && !selectedSpecies) return false;
    if (step === 2 && !selectedGrimo) return false;
    if (step === 3 && !selectedRole) return false;
    if (step === 4 && !selectedCulture) return false;
    if (step === 5 && name.trim().length < 2) return false;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step < 5) setStep((step + 1) as FGStep);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as FGStep);
  };

  // Live preview for step 5
  const previewChar =
    selectedSpecies && selectedGrimo && selectedRole && selectedCulture
      ? calculateFGCharacter(
          selectedSpecies,
          selectedGrimo,
          selectedRole,
          selectedCulture,
          name || 'Personagem',
          background,
          personality,
          user?.id ?? '',
        )
      : null;

  const handleCreateFG = async () => {
    if (
      !user ||
      !selectedSpecies ||
      !selectedGrimo ||
      !selectedRole ||
      !selectedCulture ||
      !name.trim()
    ) {
      setError('Dados incompletos');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fgChar = calculateFGCharacter(
        selectedSpecies,
        selectedGrimo,
        selectedRole,
        selectedCulture,
        name.trim(),
        background.trim() || 'Um aventureiro das Terras Místicas.',
        personality.trim() || 'Determinado e corajoso.',
        user.id,
      );

      // Map F&G attributes to generic ones for the characters table
      const genericAttributes = {
        strength: fgChar.attributes.forca,
        dexterity: fgChar.attributes.agilidade,
        constitution: fgChar.attributes.resiliencia,
        intelligence: fgChar.attributes.intelecto,
        wisdom: fgChar.attributes.espirito,
        charisma: fgChar.attributes.influencia,
      };

      const description = `${FG_SPECIES_DEFINITIONS[selectedSpecies].name} — ${FG_ROLE_DEFINITIONS[selectedRole].name} — Grimo: ${FG_GRIMO_DEFINITIONS[selectedGrimo].name}`;

      // Create character in DB using generic service (class='warrior' bypasses CHECK constraint)
      const { data: character, error: createError } = await createCharacter(user.id, {
        name: fgChar.name,
        class: 'warrior',
        race: selectedSpecies,
        background: fgChar.background,
        personality: fgChar.personality,
        description,
        attributes: genericAttributes,
      });

      if (createError || !character) {
        setError(createError ?? 'Falha ao criar personagem');
        return;
      }

      // Store F&G data in the fg_character_data column
      await supabase
        .from('characters')
        .update({
          game_system: 'fabulas-goblins',
          fg_character_data: fgChar,
        })
        .eq('id', character.id);

      // Update fgChar id to match the DB id
      const finalFGChar = { ...fgChar, id: character.id };

      setFGCharacter(finalFGChar);
      navigate('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEP_LABELS: Record<FGStep, string> = {
    1: 'Espécie',
    2: 'Grimo',
    3: 'Papel',
    4: 'Cultura',
    5: 'Nome & História',
  };

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-4xl font-bold text-ember-400 tracking-wider mb-2">
            Fábulas & Goblins
          </h1>
          <p className="font-crimson text-parchment-200/60">
            Etapa {step} de 5 — {STEP_LABELS[step]}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-10">
          {([1, 2, 3, 4, 5] as FGStep[]).map((s) => (
            <div
              key={s}
              className={`h-2 w-14 rounded-full transition-all ${s <= step ? 'bg-ember-600' : 'bg-stone-800'}`}
            />
          ))}
        </div>

        {/* Step 1: Species */}
        {step === 1 && (
          <div>
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              Escolha sua Espécie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(FG_SPECIES_DEFINITIONS).map((species) => (
                <Card
                  key={species.id}
                  className={`cursor-pointer transition-all ${
                    selectedSpecies === species.id
                      ? 'border-ember-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                  onClick={() => setSelectedSpecies(species.id)}
                >
                  <h3 className="font-cinzel text-lg font-semibold text-ember-400 mb-2">
                    {species.name}
                  </h3>
                  <p className="font-crimson text-sm text-parchment-200/80 mb-3">
                    {species.description}
                  </p>
                  <div className="mb-2">
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Bônus de Atributos
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Object.entries(species.attributeBonus).map(([attr, bonus]) => (
                        <span
                          key={attr}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-stone-800 text-stone-300 border border-stone-600/50"
                        >
                          {attr.slice(0, 3).toUpperCase()} +{bonus}
                        </span>
                      ))}
                      {species.pvBonus > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-forest-700/20 text-forest-600 border border-forest-600/40">
                          +{species.pvBonus} PV
                        </span>
                      )}
                      {species.pmBonus > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-arcane-600/15 text-arcane-400 border border-arcane-500/40">
                          +{species.pmBonus} PM
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Traços
                    </p>
                    <ul className="font-crimson text-xs text-parchment-200/70 space-y-0.5">
                      {species.traits.map((t) => (
                        <li key={t} className="flex gap-1">
                          <span className="text-ember-400 shrink-0">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="font-crimson text-xs italic text-parchment-200/50 mt-2">
                    {species.flavorText}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Grimo */}
        {step === 2 && (
          <div>
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              Escolha seu Grimo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(FG_GRIMO_DEFINITIONS).map((grimo) => (
                <Card
                  key={grimo.id}
                  className={`cursor-pointer transition-all ${
                    selectedGrimo === grimo.id
                      ? 'border-ember-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                  onClick={() => setSelectedGrimo(grimo.id)}
                >
                  <h3 className="font-cinzel text-lg font-semibold text-ember-400 mb-2">
                    {grimo.name}
                  </h3>
                  <p className="font-crimson text-sm text-parchment-200/80 mb-3">
                    {grimo.description}
                  </p>
                  <div className="mb-2">
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Atributos Primários
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {grimo.primaryAttributes.map((attr) => (
                        <span
                          key={attr}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-ember-600/10 text-ember-400 border border-ember-500/40"
                        >
                          {attr} +2
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Armas Iniciais
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {grimo.startingWeapons.map((w) => (
                        <span
                          key={w.name}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-crimson rounded-full bg-stone-800 text-parchment-200/70 border border-stone-700/50"
                        >
                          {w.name} ({w.damage})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Poderes
                    </p>
                    <ul className="font-crimson text-xs text-parchment-200/70 space-y-1">
                      {grimo.powers.map((p) => (
                        <li key={p.name} className="flex gap-1">
                          <span className="text-ember-400 shrink-0">•</span>
                          <span><strong className="text-ember-400/80">{p.name}:</strong> {p.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Role */}
        {step === 3 && (
          <div>
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              Escolha seu Papel de Jogo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(FG_ROLE_DEFINITIONS).map((role) => (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'border-ember-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <h3 className="font-cinzel text-lg font-semibold text-ember-400 mb-2">
                    {role.name}
                  </h3>
                  <p className="font-crimson text-sm text-parchment-200/80 mb-3">
                    {role.description}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center bg-stone-900 rounded p-2">
                      <p className="font-cinzel text-xs text-parchment-200/50 uppercase">PV</p>
                      <p className="font-cinzel text-lg text-ember-400">{role.basePV}</p>
                    </div>
                    <div className="text-center bg-stone-900 rounded p-2">
                      <p className="font-cinzel text-xs text-parchment-200/50 uppercase">PM</p>
                      <p className="font-cinzel text-lg text-arcane-400">{role.basePM}</p>
                    </div>
                    <div className="text-center bg-stone-900 rounded p-2">
                      <p className="font-cinzel text-xs text-parchment-200/50 uppercase">MOV</p>
                      <p className="font-cinzel text-lg text-forest-600">{role.movimento}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Poderes
                    </p>
                    <ul className="font-crimson text-xs text-parchment-200/70 space-y-0.5">
                      {role.powers.map((p) => (
                        <li key={p} className="flex gap-1">
                          <span className="text-ember-400 shrink-0">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Culture */}
        {step === 4 && (
          <div>
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              Escolha sua Cultura
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(FG_CULTURE_DEFINITIONS).map((culture) => (
                <Card
                  key={culture.id}
                  className={`cursor-pointer transition-all ${
                    selectedCulture === culture.id
                      ? 'border-ember-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                  onClick={() => setSelectedCulture(culture.id)}
                >
                  <h3 className="font-cinzel text-lg font-semibold text-ember-400 mb-2">
                    {culture.name}
                  </h3>
                  <p className="font-crimson text-sm text-parchment-200/80 mb-3">
                    {culture.description}
                  </p>
                  <div className="mb-2">
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Bônus
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(culture.attributeBonus).map(([attr, bonus]) => (
                        <span
                          key={attr}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-stone-800 text-stone-300 border border-stone-600/50"
                        >
                          {attr.slice(0, 3).toUpperCase()} +{bonus}
                        </span>
                      ))}
                      {culture.pvBonus && culture.pvBonus > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-forest-700/20 text-forest-600 border border-forest-600/40">
                          +{culture.pvBonus} PV
                        </span>
                      )}
                      {culture.pmBonus && culture.pmBonus > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-cinzel tracking-wide rounded-full bg-arcane-600/15 text-arcane-400 border border-arcane-500/40">
                          +{culture.pmBonus} PM
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-stone-800 pt-2 mt-2">
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                      Poder Cultural
                    </p>
                    <p className="font-crimson text-xs text-parchment-200/70">
                      {culture.culturalPower}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Name & Background */}
        {step === 5 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              Nome & História
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor="fg-char-name" className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide">
                    Nome do Personagem *
                  </label>
                  <input
                    id="fg-char-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Zix o Ágil, Mira Pedra-Negra"
                    className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60 text-parchment-100 font-crimson rounded-sm focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30 placeholder-parchment-200/25 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="fg-char-background" className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide">
                    Background (Opcional)
                  </label>
                  <textarea
                    id="fg-char-background"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="De onde você vem nas Terras Místicas? Como obteve seu Grimo?"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60 text-parchment-100 font-crimson rounded-sm resize-none focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30 placeholder-parchment-200/25 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="fg-char-personality" className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide">
                    Personalidade (Opcional)
                  </label>
                  <textarea
                    id="fg-char-personality"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="Como você reage ao Blecaute? O que te motiva?"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60 text-parchment-100 font-crimson rounded-sm resize-none focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30 placeholder-parchment-200/25 transition-colors"
                  />
                </div>
              </div>

              {/* Live preview */}
              {previewChar && (
                <Card className="border-ember-600/30 h-fit">
                  <h3 className="font-cinzel text-lg font-semibold text-ember-400 mb-4">
                    {name || 'Personagem'}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm font-crimson text-parchment-200/80">
                    <div>
                      <span className="font-cinzel text-xs text-parchment-200/50 uppercase block">Espécie</span>
                      {selectedSpecies && FG_SPECIES_DEFINITIONS[selectedSpecies].name}
                    </div>
                    <div>
                      <span className="font-cinzel text-xs text-parchment-200/50 uppercase block">Grimo</span>
                      {selectedGrimo && FG_GRIMO_DEFINITIONS[selectedGrimo].name}
                    </div>
                    <div>
                      <span className="font-cinzel text-xs text-parchment-200/50 uppercase block">Papel</span>
                      {selectedRole && FG_ROLE_DEFINITIONS[selectedRole].name}
                    </div>
                    <div>
                      <span className="font-cinzel text-xs text-parchment-200/50 uppercase block">Cultura</span>
                      {selectedCulture && FG_CULTURE_DEFINITIONS[selectedCulture].name}
                    </div>
                  </div>

                  <div className="border-t border-stone-800 pt-3 mb-3">
                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                      <div className="bg-stone-900 rounded p-2">
                        <p className="font-cinzel text-xs text-parchment-200/50">PV</p>
                        <p className="font-cinzel text-lg text-forest-600">{previewChar.maxPV}</p>
                      </div>
                      <div className="bg-stone-900 rounded p-2">
                        <p className="font-cinzel text-xs text-parchment-200/50">PM</p>
                        <p className="font-cinzel text-lg text-arcane-400">{previewChar.maxPM}</p>
                      </div>
                      <div className="bg-stone-900 rounded p-2">
                        <p className="font-cinzel text-xs text-parchment-200/50">MOV</p>
                        <p className="font-cinzel text-lg text-parchment-100">{previewChar.movimento}</p>
                      </div>
                    </div>
                    <div className="text-center bg-stone-900 rounded p-2">
                      <p className="font-cinzel text-xs text-parchment-200/50">Iniciativa</p>
                      <p className="font-cinzel text-lg text-ember-400">+{previewChar.iniciativa}</p>
                    </div>
                  </div>

                  <div className="border-t border-stone-800 pt-3">
                    <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-2">
                      Atributos
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.entries(previewChar.attributes) as [string, number][]).map(([attr, val]) => (
                        <div key={attr} className="text-center bg-stone-900 rounded py-1.5">
                          <p className="font-cinzel text-xs text-parchment-200/50 uppercase">
                            {attr.slice(0, 3)}
                          </p>
                          <p className="font-cinzel text-base text-ember-400">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {error && (
              <div className="mt-4 px-4 py-2 bg-blood-700/20 border border-blood-500/40 rounded text-sm font-crimson text-blood-500">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-10 max-w-2xl mx-auto">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || isSubmitting}>
            Voltar
          </Button>
          {step < 5 && (
            <Button variant="primary" onClick={handleNext} disabled={!canProceed()}>
              Próximo
            </Button>
          )}
          {step === 5 && (
            <Button
              variant="primary"
              onClick={handleCreateFG}
              loading={isSubmitting}
              disabled={isSubmitting || !name.trim()}
            >
              Criar Personagem
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

export function CharacterCreationPage() {
  const selectedSystem = useGameStore((s) => s.selectedSystem);

  if (selectedSystem === 'fabulas-goblins') {
    return <FGCharacterWizard />;
  }

  return <GenericCharacterWizard />;
}
