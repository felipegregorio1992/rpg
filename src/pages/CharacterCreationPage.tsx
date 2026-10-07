import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  CLASS_DEFINITIONS,
  RACE_DEFINITIONS,
  calculateBaseAttributes,
  calculateDerivedStats,
  getExperienceForLevel,
} from '../game/character/characterCreation';
import { createCharacter } from '../services/supabase/characterService';
import { useAuthStore } from '../store/authStore';
import type { CharacterClass, CharacterRace, CharacterAttributes } from '../types';

type Step = 1 | 2 | 3 | 4;

export function CharacterCreationPage() {
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

      // Success — redirect to campaigns
      navigate('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computed preview
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-4xl font-bold text-ember-400 tracking-wider mb-2">
            Criação de Personagem
          </h1>
          <p className="font-crimson text-parchment-200/60">
            Etapa {step} de 4
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-all ${
                s <= step ? 'bg-ember-600' : 'bg-stone-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Race */}
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
                        <Badge
                          key={attr}
                          variant={bonus && bonus > 0 ? 'success' : 'default'}
                        >
                          {attr.slice(0, 3).toUpperCase()}{' '}
                          {bonus && bonus > 0 ? '+' : ''}
                          {bonus}
                        </Badge>
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

        {/* Step 2: Class */}
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

        {/* Step 3: Background */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-cinzel text-2xl text-parchment-100 mb-6 text-center">
              História do Personagem
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="char-name"
                  className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide"
                >
                  Nome do Personagem *
                </label>
                <input
                  id="char-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Thorin Escudo de Ferro"
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60
                           text-parchment-100 font-crimson rounded-sm
                           focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30
                           placeholder-parchment-200/25 transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="char-background"
                  className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide"
                >
                  Background (Opcional)
                </label>
                <textarea
                  id="char-background"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="De onde você veio? Que eventos marcaram sua vida?"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60
                           text-parchment-100 font-crimson rounded-sm resize-none
                           focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30
                           placeholder-parchment-200/25 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="char-personality"
                  className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide"
                >
                  Personalidade (Opcional)
                </label>
                <textarea
                  id="char-personality"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Como você age? Qual sua atitude perante o mundo?"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700/60
                           text-parchment-100 font-crimson rounded-sm resize-none
                           focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30
                           placeholder-parchment-200/25 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
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
                  <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide">
                    Raça
                  </p>
                  <p className="font-crimson text-base text-parchment-100">
                    {RACE_DEFINITIONS[selectedRace].name}
                  </p>
                </div>
                <div>
                  <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide">
                    Classe
                  </p>
                  <p className="font-crimson text-base text-parchment-100">
                    {CLASS_DEFINITIONS[selectedClass].name}
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-800 pt-4 mb-4">
                <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-2">
                  Atributos
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(previewAttributes).map(([attr, value]) => (
                    <div key={attr} className="text-center">
                      <p className="font-cinzel text-xs text-parchment-200/60 uppercase">
                        {attr.slice(0, 3)}
                      </p>
                      <p className="font-cinzel text-lg text-ember-400">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-800 pt-4">
                <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-2">
                  Status Iniciais
                </p>
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
                  <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                    Background
                  </p>
                  <p className="font-crimson text-sm text-parchment-200/80 italic">
                    {background}
                  </p>
                </div>
              )}

              {personality && (
                <div className="border-t border-stone-800 pt-4 mt-4">
                  <p className="font-cinzel text-xs text-parchment-200/50 uppercase tracking-wide mb-1">
                    Personalidade
                  </p>
                  <p className="font-crimson text-sm text-parchment-200/80 italic">
                    {personality}
                  </p>
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

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-10 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
          >
            Voltar
          </Button>

          {step < 4 && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
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
