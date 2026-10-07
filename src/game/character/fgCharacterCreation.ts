import type {
  FGSpecies,
  FGGrimo,
  FGRole,
  FGCulture,
  FGAttributes,
  FGCharacter,
} from '../../types/fabulasGoblins';

// ─── Type definitions ─────────────────────────────────────────

export interface FGSpeciesDefinition {
  id: FGSpecies;
  name: string;
  description: string;
  traits: string[];
  attributeBonus: Partial<FGAttributes>;
  flavorText: string;
  pvBonus: number;
  pmBonus: number;
}

export interface FGWeapon {
  name: string;
  damage: string;
}

export interface FGGrimoDefinition {
  id: FGGrimo;
  name: string;
  description: string;
  primaryAttributes: (keyof FGAttributes)[];
  startingWeapons: FGWeapon[];
  powers: { name: string; description: string }[];
}

export interface FGRoleDefinition {
  id: FGRole;
  name: string;
  description: string;
  basePV: number;
  basePM: number;
  movimento: number;
  pvPerLevel: [number, number, number, number]; // grau 1-4
  pmPerLevel: [number, number, number, number];
  proficiencias: (keyof FGAttributes)[];
  powers: string[];
}

export interface FGCultureDefinition {
  id: FGCulture;
  name: string;
  description: string;
  attributeBonus: Partial<FGAttributes>;
  pvBonus?: number;
  pmBonus?: number;
  attackBonus?: number;
  defenseBonus?: number;
  culturalPower: string;
}

// ─── Species Data ─────────────────────────────────────────────

export const FG_SPECIES_DEFINITIONS: Record<FGSpecies, FGSpeciesDefinition> = {
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    description:
      'Pequenos e ágeis, os Goblins são adaptáveis e resilientes. Seu tamanho compacto permite infiltrar lugares impossíveis para espécies maiores.',
    traits: [
      'Adaptável: +2 em testes sociais',
      'Corpo Compacto: passa por espaços estreitos',
      'Resiliência Goblin: recupera PV mais rapidamente',
    ],
    attributeBonus: { agilidade: 1, resiliencia: 2 },
    flavorText: 'Subestimados por todos, superados por nenhum quando motivados.',
    pvBonus: 2,
    pmBonus: 0,
  },
  armadon: {
    id: 'armadon',
    name: 'Armadon',
    description:
      'Criaturas com escamas naturais que servem como armadura. Possuem um sentido sísmico que detecta vibrações no solo.',
    traits: [
      'Escamas: +2 de Defesa natural',
      'Sentido Sísmico: detecta movimento no solo a até 10m',
      'Resistência Física: imunidade a efeitos de tontura',
    ],
    attributeBonus: { forca: 2, resiliencia: 2 },
    flavorText: 'Sua armadura natural é tanto bênção quanto símbolo de sua espécie.',
    pvBonus: 4,
    pmBonus: 0,
  },
  metaloide: {
    id: 'metaloide',
    name: 'Metaloide',
    description:
      'Seres artificiais com corpo parcialmente mecânico. Podem transformar objetos comuns em artefatos mágicos temporários.',
    traits: [
      'Escalar Obstáculos: sobe superfícies verticais',
      'Transformação: transforma itens mundanos em mágicos por 1 rodada',
      'Manutenção Arcana: não precisa de sono, apenas recalibração',
    ],
    attributeBonus: { intelecto: 2, eloMagico: 1 },
    flavorText: 'Entre o orgânico e o mecânico, os Metaloídes encontraram seu próprio caminho.',
    pvBonus: 0,
    pmBonus: 4,
  },
  razalan: {
    id: 'razalan',
    name: 'Razalan',
    description:
      'Humanoides com asas que permitem planar e flutuar. São detentores dos Pergaminhos Radamagi, conhecimento arcano ancestral.',
    traits: [
      'Planar: desliza pelo ar por curtos períodos',
      'Pergaminhos Radamagi: acessa conhecimento arcano ancestral',
      'Presença Carismática: vantagem em negociações',
    ],
    attributeBonus: { influencia: 2, espirito: 1 },
    flavorText: 'Nascidos entre o céu e a terra, são mensageiros dos mistérios antigos.',
    pvBonus: 0,
    pmBonus: 2,
  },
  valdari: {
    id: 'valdari',
    name: 'Valdari',
    description:
      'Espécie anfíbia com concha Esnorque que permite respirar sob a água. Excelentes diplomatas naturais.',
    traits: [
      'Anfíbio: respira e se move normalmente na água',
      'Concha Esnorque: filtra ambientes hostis',
      'Diplomacia Natural: +2 em testes de negociação',
    ],
    attributeBonus: { sobrevivencia: 2, agilidade: 1 },
    flavorText: 'Dois mundos, uma única identidade — os Valdari navegam entre eles com graça.',
    pvBonus: 2,
    pmBonus: 0,
  },
  luminin: {
    id: 'luminin',
    name: 'Luminin',
    description:
      'Seres bioluminescentes de 1,30m que veneram o deus Igadash. Podem usar cristais para camuflar sua luminosidade.',
    traits: [
      'Bioluminescência: emite luz natural, ilumina área de 3m',
      'Camuflagem de Cristal: suprime sua luz por até 1 hora',
      'Veneração de Igadash: acesso a orações de cura menores',
    ],
    attributeBonus: { espirito: 2, eloMagico: 2 },
    flavorText: 'A luz que carregam não é fraqueza — é o brilho de uma fé inabalável.',
    pvBonus: 0,
    pmBonus: 4,
  },
};

// ─── Grimo Data ───────────────────────────────────────────────

export const FG_GRIMO_DEFINITIONS: Record<FGGrimo, FGGrimoDefinition> = {
  'brasao-giurad': {
    id: 'brasao-giurad',
    name: 'Brasão de Giurad',
    description:
      'Grimo dos cavaleiros da justiça. Vinculado ao ideal de proteção e honra, seus portadores são guerreiros corpo a corpo que protegem os aliados.',
    primaryAttributes: ['resiliencia', 'forca'],
    startingWeapons: [
      { name: 'Machado de Giurad', damage: '2d12+2' },
      { name: 'Espada de Giurad', damage: '2d12+2' },
    ],
    powers: [
      {
        name: 'Fôlego de Herói',
        description: 'Quando você seria reduzido a 0 PV, revive com 1 PV uma vez por combate.',
      },
      {
        name: 'Proteger',
        description:
          'Reação: você absorve um ataque destinado a um aliado adjacente, recebendo o dano no lugar.',
      },
    ],
  },
  'olho-kanus': {
    id: 'olho-kanus',
    name: 'Olho de Kanus',
    description:
      'Grimo dos caçadores. Especialistas em bioma e criaturas, são temíveis com arco e adaga.',
    primaryAttributes: ['sobrevivencia', 'agilidade'],
    startingWeapons: [
      { name: 'Arco de Kanus', damage: '2d10+2' },
      { name: 'Adaga de Caçador', damage: '2d8+2' },
    ],
    powers: [
      {
        name: 'Especialidade de Bioma',
        description: '+2 em todos os testes em seu bioma favorito (escolhido na criação).',
      },
      {
        name: 'Especialidade de Criatura',
        description: '+2 em todos os testes contra seu tipo de criatura favorito.',
      },
    ],
  },
  'joia-lunn': {
    id: 'joia-lunn',
    name: 'Joia de Lunn',
    description:
      'Grimo dos sacerdotes e curandeiros. Carregam poder divino de cura e proteção, equilibrando luz e trevas.',
    primaryAttributes: ['eloMagico', 'espirito'],
    startingWeapons: [
      { name: 'Cajado Sagrado', damage: '2d8+2' },
      { name: 'Cruz de Lunn', damage: '2d10+2' },
    ],
    powers: [
      {
        name: 'Proteção contra Trevas',
        description:
          'Cria um escudo sagrado em um aliado que reduz em 2 o dano de ataques sombrios.',
      },
      {
        name: 'Proteção contra Luz',
        description: 'Cria um escudo sombrio que reduz em 2 o dano de ataques de luz.',
      },
    ],
  },
  'orbe-alura': {
    id: 'orbe-alura',
    name: 'Orbe de Alura',
    description:
      'Grimo dos magos elementais. Domina 12 elementos diferentes, tornando seus portadores versáteis e imprevisíveis em combate.',
    primaryAttributes: ['intelecto', 'eloMagico'],
    startingWeapons: [
      { name: 'Orbe Elemental', damage: '2d10+2' },
      { name: 'Cetro de Alura', damage: '2d8+2' },
    ],
    powers: [
      {
        name: 'Resistência Elemental',
        description: 'Reduz em 3 o dano de um elemento escolhido ao nível 1.',
      },
      {
        name: 'Efeito Elemental',
        description:
          'Adiciona um efeito de status do elemento dominante aos ataques mágicos (queimar, congelar, etc).',
      },
    ],
  },
  'totem-darian': {
    id: 'totem-darian',
    name: 'Totem de Darian',
    description:
      'Grimo dos xamãs e caminhantes espirituais. Comunicam-se com espíritos e percebem o que olhos comuns não veem.',
    primaryAttributes: ['espirito', 'intelecto'],
    startingWeapons: [
      { name: 'Tábua Espiritual', damage: '2d8+2' },
      { name: 'Graveto de Darian', damage: '2d10+2' },
    ],
    powers: [
      {
        name: 'Andarilho Espiritual',
        description:
          'Entra em transe espiritual por 1 turno para obter informação sobre o ambiente ou inimigos próximos.',
      },
      {
        name: 'Clarividência',
        description:
          'Vê eventos que ocorreram em um local nas últimas 24 horas com um teste de Espírito CD 14.',
      },
    ],
  },
  'arca-ravna': {
    id: 'arca-ravna',
    name: 'Arca de Ravna',
    description:
      'Grimo dos magos selvagens. Canalizam magia bruta de formas imprevisíveis, copiando habilidades inimigas e petrificando alvos.',
    primaryAttributes: ['eloMagico', 'intelecto'],
    startingWeapons: [
      { name: 'Urna de Ravna', damage: '2d12+2' },
      { name: 'Estilingue Arcano', damage: '2d8+2' },
    ],
    powers: [
      {
        name: 'Mimesis',
        description:
          'Copia temporariamente uma habilidade de um inimigo que você observou usar neste combate.',
      },
      {
        name: 'Fossilizar',
        description:
          'Um alvo falha no próximo movimento que tentar executar (fica paralisado por 1 turno, CD Resiliência 14).',
      },
    ],
  },
  'aparato-magni': {
    id: 'aparato-magni',
    name: 'Aparato de Magni',
    description:
      'Grimo dos necromantes mecânicos. Constroem e comandam autômatos, combinando engenharia com magia sombria.',
    primaryAttributes: ['intelecto', 'forca'],
    startingWeapons: [
      { name: 'Bomba de Magni', damage: '2d8+2' },
      { name: 'Manopla Elétrica', damage: '2d10+2' },
    ],
    powers: [
      {
        name: 'Criar Magni',
        description:
          'Constrói um construto mecânico simples (Magni) que age como aliado com PV 10 e Ataque d6.',
      },
      {
        name: 'Sinergia Mecânica',
        description:
          'Quando um Magni aliado acerta um alvo, seu próximo ataque contra esse alvo tem +3 de dano.',
      },
    ],
  },
  'frasco-zanari': {
    id: 'frasco-zanari',
    name: 'Frasco de Zanari',
    description:
      'Grimo dos assassinos das sombras. Mestres em veneno, furtividade e golpes letais por trás.',
    primaryAttributes: ['sobrevivencia', 'agilidade'],
    startingWeapons: [
      { name: 'Katar de Zanari', damage: '2d10+2' },
      { name: 'Dardo Envenenado', damage: '2d4+2' },
      { name: 'Punhal das Sombras', damage: '2d8+2' },
    ],
    powers: [
      {
        name: 'Leitura das Sombras',
        description: 'Detecta automaticamente armadilhas e emboscadas se passar por uma área.',
      },
      {
        name: 'Absorver Veneno',
        description:
          'Imunidade a venenos e pode absorver um efeito de veneno para adicionar ao próximo ataque.',
      },
    ],
  },
  'insignia-qatun': {
    id: 'insignia-qatun',
    name: 'Insígnia de Qatun',
    description:
      'Grimo dos ilusionistas e manipuladores mentais. Distorcem a percepção da realidade para aliados e inimigos.',
    primaryAttributes: ['influencia', 'destino', 'forca'],
    startingWeapons: [
      { name: 'Bengala de Qatun', damage: '2d10+2' },
      { name: 'Punhal da Morte', damage: '2d8+2' },
      { name: 'Saxofone Arcano', damage: '2d10+2' },
    ],
    powers: [
      {
        name: 'Manipular Mente',
        description:
          'Força um inimigo a fazer uma ação simples de sua escolha (não pode ser se machucar, CD Espírito 15).',
      },
      {
        name: 'Ilusão Conveniente',
        description:
          'Cria uma ilusão visual convincente por até 1 hora que engana sentidos não-mágicos.',
      },
    ],
  },
  'selo-ixin': {
    id: 'selo-ixin',
    name: 'Selo de Ixin',
    description:
      'Grimo dos combatentes rúnicos. Inscrevem runas em armas e corpo, teleportando-se em combate e criando sinergias poderosas.',
    primaryAttributes: ['agilidade', 'intelecto', 'forca'],
    startingWeapons: [
      { name: 'Bastão Rúnico', damage: '2d10+2' },
      { name: 'Prisma de Ixin', damage: '2d12+2' },
      { name: 'Espada Larga', damage: '2d12+2' },
    ],
    powers: [
      {
        name: 'Translocação Natural',
        description:
          'Teleporta-se para qualquer espaço vazio que possa ver a até 10m (1 vez por rodada).',
      },
      {
        name: 'Sinergia Rúnica',
        description:
          'Quando ativa uma runa, o próximo ataque causa dano adicional igual ao seu Intelecto.',
      },
    ],
  },
};

// ─── Role Data ────────────────────────────────────────────────

export const FG_ROLE_DEFINITIONS: Record<FGRole, FGRoleDefinition> = {
  carregador: {
    id: 'carregador',
    name: 'Carregador',
    description:
      'Especialista em combate físico direto. Causa dano massivo e pode criar dano colateral nos inimigos próximos ao alvo.',
    basePV: 14,
    basePM: 12,
    movimento: 5,
    pvPerLevel: [4, 4, 8, 8],
    pmPerLevel: [2, 2, 4, 4],
    proficiencias: ['forca', 'agilidade'],
    powers: ['Ataque Poderoso', 'Dano Colateral'],
  },
  atirador: {
    id: 'atirador',
    name: 'Atirador',
    description:
      'Mestre do combate à distância. Usa precisão cirúrgica e pode se desengajar de inimigos próximos com facilidade.',
    basePV: 14,
    basePM: 12,
    movimento: 5,
    pvPerLevel: [3, 3, 6, 6],
    pmPerLevel: [2, 2, 4, 4],
    proficiencias: ['agilidade', 'sobrevivencia'],
    powers: ['Precisão Afiada', 'Desengajar'],
  },
  conjurador: {
    id: 'conjurador',
    name: 'Conjurador',
    description:
      'Canaliza o poder do Grimo para magia ofensiva. Pode sobrecarregar seus ataques mágicos por mais dano ou recuperar PM em momentos críticos.',
    basePV: 12,
    basePM: 14,
    movimento: 4,
    pvPerLevel: [2, 4, 4, 6],
    pmPerLevel: [3, 3, 6, 6],
    proficiencias: ['intelecto', 'eloMagico', 'espirito'],
    powers: ['Sobrecarga Mágica', 'Fôlego Mágico'],
  },
  suporte: {
    id: 'suporte',
    name: 'Suporte',
    description:
      'Guardião dos aliados. Salva companheiros de ataques letais e realiza curas poderosas no momento certo.',
    basePV: 12,
    basePM: 18,
    movimento: 3,
    pvPerLevel: [2, 2, 4, 4],
    pmPerLevel: [5, 5, 10, 10],
    proficiencias: ['intelecto', 'eloMagico', 'espirito'],
    powers: ['Salvar Aliado', 'Cura Poderosa'],
  },
  tanque: {
    id: 'tanque',
    name: 'Tanque',
    description:
      'Fortaleza viva do grupo. Provoca inimigos para proteger aliados e usa instâncias de defesa para minimizar dano.',
    basePV: 18,
    basePM: 12,
    movimento: 4,
    pvPerLevel: [5, 5, 10, 10],
    pmPerLevel: [2, 2, 4, 4],
    proficiencias: ['forca', 'resiliencia'],
    powers: ['Provocar', 'Instância de Defesa'],
  },
  utilitario: {
    id: 'utilitario',
    name: 'Utilitário',
    description:
      'O coringa do grupo. Adapta-se a qualquer situação e tem acesso a manobras táticas únicas que nenhum outro Papel domina.',
    basePV: 14,
    basePM: 14,
    movimento: 4,
    pvPerLevel: [3, 3, 6, 6],
    pmPerLevel: [3, 3, 6, 6],
    proficiencias: ['forca', 'agilidade', 'resiliencia', 'intelecto', 'eloMagico', 'espirito', 'sobrevivencia', 'influencia', 'destino'],
    powers: ['Início Utilitário', 'Manobra Utilitária'],
  },
};

// ─── Culture Data ─────────────────────────────────────────────

export const FG_CULTURE_DEFINITIONS: Record<FGCulture, FGCultureDefinition> = {
  orvalho: {
    id: 'orvalho',
    name: 'Povo do Orvalho',
    description:
      'Vivem nas florestas úmidas das Terras Místicas. Coletores e rastreadores natos, conhecem cada planta e criatura de seu bioma.',
    attributeBonus: { sobrevivencia: 1, agilidade: 1, intelecto: 1 },
    pmBonus: 2,
    culturalPower: 'Conhecimento Florestal: identifica plantas, venenos e rastros automaticamente.',
  },
  caldera: {
    id: 'caldera',
    name: 'Povo da Caldera',
    description:
      'Habitam regiões vulcânicas e forjas subterrâneas. Resistentes ao calor extremo e habilidosos com metais e explosivos.',
    attributeBonus: { agilidade: 1, influencia: 1, resiliencia: 1 },
    culturalPower: 'Resistência ao Calor: imunidade a dano de fogo ambiental e redução de 2 em dano de fogo em combate.',
  },
  areias: {
    id: 'areias',
    name: 'Povo das Areias',
    description:
      'Nômades dos desertos das Terras Místicas. Extremamente resistentes à privação e mestres da navegação por estrelas e areia.',
    attributeBonus: { resiliencia: 1, sobrevivencia: 1, forca: 1 },
    pvBonus: 2,
    culturalPower: 'Sobrevivência no Deserto: pode sobreviver sem água por até 3 dias sem penalidade.',
  },
  arcadia: {
    id: 'arcadia',
    name: 'Povo de Arcádia',
    description:
      'Vivem em cidades-torres de cristal onde a magia permeia cada aspecto da vida cotidiana. Acadêmicos e pesquisadores arcanos.',
    attributeBonus: { intelecto: 1, eloMagico: 1, resiliencia: 1 },
    pmBonus: 2,
    culturalPower: 'Herança Arcana: uma vez por descanso longo, regenera 4 PM automaticamente.',
  },
  ilhas: {
    id: 'ilhas',
    name: 'Povo das Ilhas',
    description:
      'Navegadores e comerciantes que habitam arquipélagos. Conhecem rotas marítimas secretas e línguas raras de povos distantes.',
    attributeBonus: { espirito: 1, eloMagico: 1, sobrevivencia: 1 },
    pmBonus: 2,
    culturalPower: 'Linguagem Universal: se comunica com criaturas marinhas e entende dialetos raros.',
  },
  tempestade: {
    id: 'tempestade',
    name: 'Povo da Tempestade',
    description:
      'Habitantes de regiões de constante tempestade elétrica. Acreditam que o destino os escolheu para grandes feitos.',
    attributeBonus: { destino: 1, influencia: 1, espirito: 1 },
    culturalPower: 'Toque do Destino: uma vez por sessão, re-rola um resultado de dados e fica com o segundo.',
  },
  subterraneo: {
    id: 'subterraneo',
    name: 'Povo Subterrâneo',
    description:
      'Vivem em redes de cavernas profundas. Enxergam no escuro absoluto e são combatentes brutais em espaços confinados.',
    attributeBonus: { resiliencia: 1 },
    pvBonus: 2,
    attackBonus: 1,
    defenseBonus: 1,
    culturalPower: 'Visão no Escuro: enxerga perfeitamente até 12m em escuridão total.',
  },
  'povo-livre': {
    id: 'povo-livre',
    name: 'Povo Livre',
    description:
      'Sem território fixo, vagam pelas Terras Místicas. Negociadores brilhantes e mercenários confiáveis — por um preço.',
    attributeBonus: { influencia: 1, agilidade: 1 },
    attackBonus: 1,
    culturalPower: 'Sem Fronteiras: nunca paga taxa de entrada em cidades ou acampamentos mercenários.',
  },
  eregor: {
    id: 'eregor',
    name: 'Povo de Eregor',
    description:
      'Guerreiros honrados de uma nação antiga. Seguem um código de honra rígido e são temidos em batalha por sua disciplina.',
    attributeBonus: { forca: 1, influencia: 1, resiliencia: 1 },
    culturalPower: 'Código de Eregor: aliados adjacentes ganham +1 de Defesa enquanto você estiver de pé.',
  },
  timeria: {
    id: 'timeria',
    name: 'Povo de Timeria',
    description:
      'Construtores e engenheiros das Terras Místicas. Seus assentamentos são fortalezas naturais e seus habitantes, resilientes combatentes.',
    attributeBonus: { resiliencia: 1, sobrevivencia: 1, forca: 1 },
    pvBonus: 2,
    culturalPower: 'Arquitetura Natural: pode transformar qualquer espaço em uma posição defensiva com 10 minutos de trabalho.',
  },
};

// ─── Character Calculator ─────────────────────────────────────

/**
 * Creates a new level-1 F&G character from selections.
 */
export function calculateFGCharacter(
  species: FGSpecies,
  grimo: FGGrimo,
  role: FGRole,
  culture: FGCulture,
  name: string,
  background: string,
  personality: string,
  userId: string,
): FGCharacter {
  const speciesDef = FG_SPECIES_DEFINITIONS[species];
  const grimoDef = FG_GRIMO_DEFINITIONS[grimo];
  const roleDef = FG_ROLE_DEFINITIONS[role];
  const cultureDef = FG_CULTURE_DEFINITIONS[culture];

  // Base attributes start at 1
  const attrs: FGAttributes = {
    forca: 1,
    agilidade: 1,
    resiliencia: 1,
    intelecto: 1,
    eloMagico: 1,
    espirito: 1,
    sobrevivencia: 1,
    influencia: 1,
    destino: 1,
  };

  // Apply +2 to each primary attribute of the chosen Grimo
  for (const attr of grimoDef.primaryAttributes) {
    attrs[attr] = (attrs[attr] ?? 1) + 2;
  }

  // Apply species attribute bonuses
  for (const [key, bonus] of Object.entries(speciesDef.attributeBonus) as [keyof FGAttributes, number][]) {
    attrs[key] = (attrs[key] ?? 1) + bonus;
  }

  // Apply culture attribute bonuses
  for (const [key, bonus] of Object.entries(cultureDef.attributeBonus) as [keyof FGAttributes, number][]) {
    attrs[key] = (attrs[key] ?? 1) + bonus;
  }

  // Calculate PV and PM
  const maxPV = roleDef.basePV + speciesDef.pvBonus + (cultureDef.pvBonus ?? 0);
  const maxPM = roleDef.basePM + speciesDef.pmBonus + (cultureDef.pmBonus ?? 0);

  // Iniciativa = agilidade + destino
  const iniciativa = attrs.agilidade + attrs.destino;

  return {
    id: crypto.randomUUID(),
    userId,
    name,
    species,
    grimo,
    role,
    culture,
    level: 1,
    grau: 1,
    pontosAventura: 0,
    currentPV: maxPV,
    maxPV,
    currentPM: maxPM,
    maxPM,
    movimento: roleDef.movimento,
    attributes: attrs,
    iniciativa,
    gold: 10,
    background,
    personality,
  };
}
