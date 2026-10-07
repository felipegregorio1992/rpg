import type { Campaign } from '../../types';

// ─── Campaign identifier ──────────────────────────────────────

export const CINZAS_DE_VALDRIS_SLUG = 'cinzas-de-valdris';

// ─── Static campaign metadata ─────────────────────────────────

export const CINZAS_DE_VALDRIS_CAMPAIGN: Omit<Campaign, 'id'> = {
  slug: CINZAS_DE_VALDRIS_SLUG,
  title: 'As Cinzas de Valdris',
  description:
    'Uma vila fronteiriça à beira do caos. Uma torre que voltou a queimar após cinquenta anos. ' +
    'Um artefato que promete poder — e cobra um preço.',
  imageUrl: undefined,
  isActive: true,
};

// ─── AI narrator system prompt ────────────────────────────────

export const CAMPAIGN_SYSTEM_PROMPT = `Você está narrando a campanha "As Cinzas de Valdris".

MUNDO: Valdris é uma vila medieval em região de fronteira, cercada de florestas sombrias e ruínas antigas. A região viveu em paz por décadas, mas eventos inexplicáveis perturbam essa paz.

CENÁRIO ATUAL:
- Uma torre abandonada no sopé da montanha voltou a emitir uma luz vermelha pulsante após 50 anos apagada.
- A torre pertencia ao mago Sorath, que desapareceu misteriosamente há 50 anos após experimentos com um artefato poderoso.
- Os moradores de Valdris temem a torre e evitam falar sobre Sorath.
- O mago Eldrin, ancião respeitado da vila, sabe mais do que aparenta e monitora a torre secretamente.

NPCS PRINCIPAIS:
- ELDRIN: Mago ancião de 80 anos, cabelos brancos, olhos penetrantes. Misterioso, escolhe cuidadosamente o que revela. Ama quebra-cabeças e metáforas. Guarda segredos pesados sobre Sorath.
- MARTA: Estalajadeira de 50 anos, prática, direta, hospitaleira. Fonte de boatos da vila. Não acredita em "tolices mágicas" mas tem medo genuíno da torre.
- GREGOR: Ferreiro de 40 anos, braços grossos, homem de poucas palavras. Bom coração. Perdeu um filho para a floresta há anos e tem rancor de criaturas mágicas.
- CAPITÃO ALDRIC: Guarda da vila, 35 anos, leal e honrado. Tenta manter a ordem mas está claramente sobrecarregado com os eventos recentes.

O ARTEFATO:
- Chama-se Orbe de Ressonância
- Localizado em uma câmara secreta abaixo da torre
- Capaz de amplificar enormemente qualquer magia
- Sorath o usou para tentar transcender a morte — algo deu errado
- O artefato ainda está ativo e influenciando sutilmente os sonhos dos moradores

POSSÍVEIS FINAIS:
1. HERÓI: Destruir o Orbe — elimina a ameaça, salva a vila, mas perde poder enorme
2. PODER: Usar o Orbe — poder imenso, mas com consequências imprevisíveis
3. NEUTRO: Vender/entregar o Orbe — recompensa financeira, mas a ameaça pode retornar

GATILHOS NARRATIVOS IMPORTANTES:
- Se o jogador explorar a torre: encontra evidências de experimentos e notas de Sorath
- Se conversar com Eldrin: ele revela informações em camadas conforme a confiança aumenta
- Se entrar na floresta à noite: encontra criaturas corrompidas pelo Orbe
- Se descobrir a passagem secreta: acessa a câmara do Orbe e o clímax da campanha

MANTENHA:
- Tom de mistério crescente
- Senso de perigo real
- NPCs com memória das decisões anteriores do jogador
- Consequências visíveis das escolhas`;

// ─── Opening scene ────────────────────────────────────────────

export const INITIAL_SCENE_DESCRIPTION = `A noite cai sobre Valdris como um manto de veludo negro. As chamas das lanternas da vila tremem com uma brisa que não deveria existir nesta noite de outono.

Você acaba de chegar à estalagem "O Corvo Dourado", depois de semanas de viagem pela Estrada do Leste. A poeira da estrada ainda está em suas roupas quando Marta, a estalajadeira, coloca um caneco de cerveja escura sobre o balcão sem nem perguntar.

"Vinte Tarenos a noite, estranho. E se você está com sorte, essa cerveja vai te ajudar a não olhar muito para aquela torre."

Ela aponta para a janela, onde, no horizonte, uma luz vermelha pulsa suavemente no topo de uma torre de pedra enegrecida.

"Cinquenta anos apagada", ela murmura, mais para si mesma do que para você. "E esta semana ela simplesmente... acendeu de volta."`;

// ─── Starting NPCs ────────────────────────────────────────────

export const CAMPAIGN_STARTING_NPCS = [
  {
    templateId: 'eldrin',
    name: 'Eldrin',
    description: 'Mago ancião da vila. Cabelos brancos, olhos cinza penetrantes, veste robes gastos.',
    personality:
      'Misterioso e cuidadoso com cada palavra. Fala em metáforas. Carrega um peso visível.',
    locationId: 'valdris-tower-base',
    relationship: 'neutral' as const,
    relationshipValue: 0,
    isAlive: true,
    dialogues: [],
    quests: ['investigate-the-tower'],
  },
  {
    templateId: 'marta',
    name: 'Marta',
    description: 'Estalajadeira corpulenta de cabelos grisalhos, avental manchado de cerveja.',
    personality: 'Prática, direta, hospitaleira. Fonte inesgotável de boatos da vila.',
    locationId: 'valdris-inn',
    relationship: 'friendly' as const,
    relationshipValue: 20,
    isAlive: true,
    dialogues: [],
    quests: [],
  },
  {
    templateId: 'gregor',
    name: 'Gregor',
    description: 'Ferreiro de braços grossos e mãos calejadas. Sempre está martelando algo.',
    personality: 'Poucos palavras, bom coração. Desconfia de magia desde que perdeu o filho.',
    locationId: 'valdris-smithy',
    relationship: 'neutral' as const,
    relationshipValue: 0,
    isAlive: true,
    dialogues: [],
    quests: [],
  },
  {
    templateId: 'aldric',
    name: 'Capitão Aldric',
    description: 'Capitão da guarda, uniforme surrado mas mantido impecavelmente limpo.',
    personality: 'Leal, honrado, visivelmente sobrecarregado com os eventos recentes.',
    locationId: 'valdris-guard-post',
    relationship: 'neutral' as const,
    relationshipValue: 0,
    isAlive: true,
    dialogues: [],
    quests: [],
  },
];

// ─── Starting locations ───────────────────────────────────────

export const CAMPAIGN_STARTING_LOCATIONS = [
  {
    templateId: 'valdris-inn',
    name: 'O Corvo Dourado',
    description:
      'A única estalagem de Valdris. Madeira escura, cheiros de cerveja e ensopado, ' +
      'uma lareira sempre acesa. Marta conhece todo mundo.',
    type: 'village' as const,
    isDiscovered: true,
    npcs: ['marta'],
    enemies: [],
    connectedLocations: ['valdris-square'],
  },
  {
    templateId: 'valdris-square',
    name: 'Praça de Valdris',
    description:
      'Centro da vila. Uma fonte seca, um poste de avisos, e a torre sempre visível no horizonte.',
    type: 'village' as const,
    isDiscovered: true,
    npcs: ['aldric'],
    enemies: [],
    connectedLocations: ['valdris-inn', 'valdris-smithy', 'valdris-road-east'],
  },
  {
    templateId: 'valdris-smithy',
    name: 'Forja de Gregor',
    description: 'Cheiro de carvão e metal quente. Ferramentas penduradas em cada parede.',
    type: 'village' as const,
    isDiscovered: false,
    npcs: ['gregor'],
    enemies: [],
    connectedLocations: ['valdris-square'],
  },
  {
    templateId: 'valdris-dark-forest',
    name: 'Floresta das Sombras',
    description:
      'A floresta ao redor de Valdris ficou estranhamente quieta. Trilhas conhecidas ' +
      'parecem diferentes à noite.',
    type: 'forest' as const,
    isDiscovered: false,
    npcs: [],
    enemies: ['corrupted-wolf', 'shadow-sprite'],
    connectedLocations: ['valdris-square', 'sorath-tower'],
  },
  {
    templateId: 'sorath-tower',
    name: 'Torre de Sorath',
    description:
      'Uma torre de pedra enegrecida pelo tempo. Uma luz vermelha pulsa no topo. ' +
      'A porta de ferro está enferrujada mas não trancada.',
    type: 'tower' as const,
    isDiscovered: false,
    npcs: ['eldrin'],
    enemies: ['animated-guardian'],
    connectedLocations: ['valdris-dark-forest', 'sorath-secret-chamber'],
  },
];
