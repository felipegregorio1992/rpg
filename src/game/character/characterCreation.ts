import type { CharacterClass, CharacterRace, CharacterAttributes } from '../../types';

export interface ClassDefinition {
  id: CharacterClass;
  name: string;
  description: string;
  attributeBonus: Partial<CharacterAttributes>;
  baseHp: number;
  hpPerLevel: number;
  baseMana: number;
  manaPerLevel: number;
  hasEnergy: boolean;
  weaponProficiencies: string[];
  primaryAttribute: keyof CharacterAttributes;
  startingSkillSlugs: string[];
  flavorText: string;
}

export interface RaceDefinition {
  id: CharacterRace;
  name: string;
  description: string;
  attributeBonus: Partial<CharacterAttributes>;
  traits: string[];
  flavorText: string;
}

export const CLASS_DEFINITIONS: Record<CharacterClass, ClassDefinition> = {
  warrior: {
    id: 'warrior',
    name: 'Guerreiro',
    description: 'Mestre das armas e da batalha, o guerreiro é o combatente mais resistente.',
    attributeBonus: { strength: 4, constitution: 3, dexterity: 1, intelligence: -1 },
    baseHp: 12,
    hpPerLevel: 8,
    baseMana: 0,
    manaPerLevel: 0,
    hasEnergy: false,
    weaponProficiencies: ['sword', 'axe', 'shield', 'heavy_armor'],
    primaryAttribute: 'strength',
    startingSkillSlugs: ['powerful-strike'],
    flavorText: 'A força e a resistência são suas maiores armas.',
  },
  mage: {
    id: 'mage',
    name: 'Mago',
    description: 'Manipulador de energias arcanas, o mago é devastador à distância.',
    attributeBonus: { intelligence: 4, wisdom: 2, constitution: -1, strength: -1 },
    baseHp: 6,
    hpPerLevel: 4,
    baseMana: 20,
    manaPerLevel: 8,
    hasEnergy: false,
    weaponProficiencies: ['staff', 'dagger', 'light_armor'],
    primaryAttribute: 'intelligence',
    startingSkillSlugs: ['fireball'],
    flavorText: 'O conhecimento arcano é seu escudo e sua espada.',
  },
  archer: {
    id: 'archer',
    name: 'Arqueiro',
    description: 'Especialista em combate à distância, o arqueiro é preciso e veloz.',
    attributeBonus: { dexterity: 4, wisdom: 1, constitution: 1, strength: 1 },
    baseHp: 8,
    hpPerLevel: 6,
    baseMana: 6,
    manaPerLevel: 3,
    hasEnergy: false,
    weaponProficiencies: ['bow', 'crossbow', 'dagger', 'medium_armor'],
    primaryAttribute: 'dexterity',
    startingSkillSlugs: ['precise-shot'],
    flavorText: 'Nenhum alvo está seguro do seu alcance.',
  },
  rogue: {
    id: 'rogue',
    name: 'Ladino',
    description: 'Especialista em furtividade e golpes precisos, o ladino evita confronto direto.',
    attributeBonus: { dexterity: 3, charisma: 2, intelligence: 1, constitution: -1 },
    baseHp: 8,
    hpPerLevel: 5,
    baseMana: 0,
    manaPerLevel: 0,
    hasEnergy: true,
    weaponProficiencies: ['dagger', 'short_sword', 'bow', 'light_armor'],
    primaryAttribute: 'dexterity',
    startingSkillSlugs: ['sneak-attack'],
    flavorText: 'As sombras são seus aliados, a precisão seu trunfo.',
  },
  cleric: {
    id: 'cleric',
    name: 'Clérigo',
    description: 'Guardião da fé, o clérigo cura aliados e pune os inimigos com poder divino.',
    attributeBonus: { wisdom: 3, charisma: 2, constitution: 2, strength: 1 },
    baseHp: 10,
    hpPerLevel: 7,
    baseMana: 12,
    manaPerLevel: 6,
    hasEnergy: false,
    weaponProficiencies: ['mace', 'staff', 'shield', 'medium_armor'],
    primaryAttribute: 'wisdom',
    startingSkillSlugs: ['divine-smite'],
    flavorText: 'A fé é sua armadura, a luz divina sua força.',
  },
  paladin: {
    id: 'paladin',
    name: 'Paladino',
    description: 'Guerreiro sagrado que combina combate físico com poder divino.',
    attributeBonus: { strength: 3, charisma: 2, constitution: 3, wisdom: 1 },
    baseHp: 11,
    hpPerLevel: 8,
    baseMana: 8,
    manaPerLevel: 4,
    hasEnergy: false,
    weaponProficiencies: ['sword', 'shield', 'heavy_armor', 'mace'],
    primaryAttribute: 'strength',
    startingSkillSlugs: ['holy-strike'],
    flavorText: 'Honra, coragem e fé: os três pilares do paladino.',
  },
};

export const RACE_DEFINITIONS: Record<CharacterRace, RaceDefinition> = {
  human: {
    id: 'human',
    name: 'Humano',
    description: 'Adaptáveis e ambiciosos, os humanos são a raça mais comum de Valdris.',
    attributeBonus: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    },
    traits: ['Versátil: +1 em todos os atributos', 'Determinação: rola dado extra uma vez por dia'],
    flavorText: 'A versatilidade é o maior dom dos humanos.',
  },
  elf: {
    id: 'elf',
    name: 'Elfo',
    description: 'Seres antiguos ligados à magia e à natureza, os elfos são graciosos e sábios.',
    attributeBonus: { dexterity: 2, intelligence: 1, wisdom: 1, constitution: -1 },
    traits: ['Visão élfica: enxerga no escuro', 'Graça arcana: +1 mana por nível'],
    flavorText: 'Mil anos de sabedoria caminham com cada elfo.',
  },
  dwarf: {
    id: 'dwarf',
    name: 'Anão',
    description: 'Forjados pelas montanhas, os anões são robustos, resilientes e mestres das forjas.',
    attributeBonus: { constitution: 2, strength: 1, wisdom: 1, charisma: -1 },
    traits: ['Resistência anã: +2 HP por nível', 'Pele de pedra: +1 defesa natural'],
    flavorText: 'Duro como pedra, firme como montanha.',
  },
  halfling: {
    id: 'halfling',
    name: 'Halfling',
    description: 'Pequenos mas ágeis, os halflings são sortudos e difíceis de acertar.',
    attributeBonus: { dexterity: 2, charisma: 1, constitution: 1, strength: -1 },
    traits: [
      'Sorte: rola novamente falhas críticas uma vez por dia',
      'Agilidade: +1 iniciativa',
    ],
    flavorText: 'A sorte dos halflings é lendária nas tavernas.',
  },
  orc: {
    id: 'orc',
    name: 'Orc',
    description: 'Guerreiros brutais de grande força, os orcs sobrevivem onde outros sucumbem.',
    attributeBonus: { strength: 3, constitution: 2, intelligence: -2, charisma: -1 },
    traits: [
      'Fúria orca: +3 ataque em HP baixo',
      'Resistência brutal: sobrevive com 1 HP uma vez por combate',
    ],
    flavorText: 'Força e ferocidade acima de tudo.',
  },
  'half-elf': {
    id: 'half-elf',
    name: 'Meio-Elfo',
    description:
      'Entre dois mundos, os meio-elfos combinam a adaptabilidade humana com a graça élfica.',
    attributeBonus: { charisma: 2, dexterity: 1, intelligence: 1 },
    traits: [
      'Herança dupla: escolhe dois traços de classe bônus',
      'Persuasão natural: vantagem em testes de carisma',
    ],
    flavorText: 'Dois mundos os rejeitam, mas dois mundos os fortalecem.',
  },
};

export function calculateBaseAttributes(
  characterClass: CharacterClass,
  race: CharacterRace,
): CharacterAttributes {
  const base: CharacterAttributes = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  const classBonus = CLASS_DEFINITIONS[characterClass].attributeBonus;
  const raceBonus = RACE_DEFINITIONS[race].attributeBonus;

  const attrs = { ...base };

  (Object.keys(classBonus) as Array<keyof CharacterAttributes>).forEach((key) => {
    if (classBonus[key] !== undefined) {
      attrs[key] = Math.max(1, attrs[key] + (classBonus[key] ?? 0));
    }
  });

  (Object.keys(raceBonus) as Array<keyof CharacterAttributes>).forEach((key) => {
    if (raceBonus[key] !== undefined) {
      attrs[key] = Math.max(1, attrs[key] + (raceBonus[key] ?? 0));
    }
  });

  return attrs;
}

export interface DerivedStats {
  maxHp: number;
  maxMana: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  initiative: number;
  criticalChance: number;
}

export function calculateDerivedStats(
  characterClass: CharacterClass,
  attributes: CharacterAttributes,
  level: number = 1,
): DerivedStats {
  const classDef = CLASS_DEFINITIONS[characterClass];
  const strMod = Math.floor((attributes.strength - 10) / 2);
  const dexMod = Math.floor((attributes.dexterity - 10) / 2);
  const conMod = Math.floor((attributes.constitution - 10) / 2);
  const intMod = Math.floor((attributes.intelligence - 10) / 2);

  const maxHp = classDef.baseHp + classDef.hpPerLevel * (level - 1) + conMod * level;
  const maxMana =
    classDef.baseMana +
    classDef.manaPerLevel * (level - 1) +
    intMod * Math.max(0, level - 1);
  const maxEnergy = classDef.hasEnergy ? 100 : 0;

  return {
    maxHp: Math.max(1, maxHp),
    maxMana: Math.max(0, maxMana),
    maxEnergy,
    attack: strMod + level,
    defense: dexMod + Math.floor(conMod / 2),
    initiative: dexMod,
    criticalChance: 5 + Math.max(0, dexMod),
  };
}

export function getExperienceForLevel(level: number): number {
  return Math.floor(300 * Math.pow(1.5, level - 1));
}
