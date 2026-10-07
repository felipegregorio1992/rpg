// ─── F&G Species ──────────────────────────────────────────────

export type FGSpecies =
  | 'goblin'
  | 'armadon'
  | 'metaloide'
  | 'razalan'
  | 'valdari'
  | 'luminin';

// ─── F&G Grimos ───────────────────────────────────────────────

export type FGGrimo =
  | 'brasao-giurad'
  | 'olho-kanus'
  | 'joia-lunn'
  | 'orbe-alura'
  | 'totem-darian'
  | 'arca-ravna'
  | 'aparato-magni'
  | 'frasco-zanari'
  | 'insignia-qatun'
  | 'selo-ixin';

// ─── F&G Role (Papel de Jogo) ─────────────────────────────────

export type FGRole =
  | 'carregador'
  | 'atirador'
  | 'conjurador'
  | 'suporte'
  | 'tanque'
  | 'utilitario';

// ─── F&G Culture ─────────────────────────────────────────────

export type FGCulture =
  | 'orvalho'
  | 'caldera'
  | 'areias'
  | 'arcadia'
  | 'ilhas'
  | 'tempestade'
  | 'subterraneo'
  | 'povo-livre'
  | 'eregor'
  | 'timeria';

// ─── F&G Attributes ──────────────────────────────────────────

export interface FGAttributes {
  forca: number;
  agilidade: number;
  resiliencia: number;
  intelecto: number;
  eloMagico: number;
  espirito: number;
  sobrevivencia: number;
  influencia: number;
  destino: number;
}

// ─── F&G Character ───────────────────────────────────────────

export interface FGCharacter {
  id: string;
  userId: string;
  name: string;
  species: FGSpecies;
  grimo: FGGrimo;
  secondGrimo?: FGGrimo;
  role: FGRole;
  culture: FGCulture;
  level: number;
  grau: number;
  pontosAventura: number;
  currentPV: number;
  maxPV: number;
  currentPM: number;
  maxPM: number;
  movimento: number;
  attributes: FGAttributes;
  iniciativa: number;
  gold: number;
  background: string;
  personality: string;
}

// ─── F&G Dice Roll (2d20 system) ─────────────────────────────

export interface FGDiceRoll2d20 {
  dice1: number;
  dice2: number;
  selected: number;
  modifier: number;
  total: number;
  isTriunfo: boolean;
  isDesastre: boolean;
  isEpico: boolean;
  isAnulado: boolean;
  isNumerosIguais: boolean;
  result:
    | 'triunfo_epico'
    | 'triunfo'
    | 'sucesso'
    | 'falha'
    | 'desastre'
    | 'desastre_epico';
}

// ─── F&G Skill Test ──────────────────────────────────────────

export interface FGSkillTest {
  attribute: keyof FGAttributes;
  difficulty?: number;
  type: 'pericia' | 'desafio';
  roll: FGDiceRoll2d20;
  success: boolean;
}
