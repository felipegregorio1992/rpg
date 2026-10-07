-- ============================================================
-- Migration 003 — Seed Data
-- Campaign: As Cinzas de Valdris
-- ============================================================

-- ─── Hardcoded UUIDs for cross-reference ─────────────────────
-- Campaign
-- campaign            : 'a1b2c3d4-0001-0001-0001-000000000001'
--
-- Locations
-- Vila de Valdris     : 'a1b2c3d4-0002-0001-0001-000000000001'
-- Torre Abandonada    : 'a1b2c3d4-0002-0001-0001-000000000002'
-- Floresta das Sombras: 'a1b2c3d4-0002-0001-0001-000000000003'
-- Passagem Secreta    : 'a1b2c3d4-0002-0001-0001-000000000004'
-- Câmara do Artefato  : 'a1b2c3d4-0002-0001-0001-000000000005'
--
-- NPCs
-- Eldrin              : 'a1b2c3d4-0003-0001-0001-000000000001'
-- Marta               : 'a1b2c3d4-0003-0001-0001-000000000002'
-- Gregor              : 'a1b2c3d4-0003-0001-0001-000000000003'
-- Capitão Aldric      : 'a1b2c3d4-0003-0001-0001-000000000004'
--
-- Enemies
-- Goblin              : 'a1b2c3d4-0004-0001-0001-000000000001'
-- Lobo                : 'a1b2c3d4-0004-0001-0001-000000000002'
-- Esqueleto           : 'a1b2c3d4-0004-0001-0001-000000000003'
-- Orc                 : 'a1b2c3d4-0004-0001-0001-000000000004'
-- Aranha Gigante      : 'a1b2c3d4-0004-0001-0001-000000000005'
--
-- Items
-- Espada de Ferro     : 'a1b2c3d4-0005-0001-0001-000000000001'
-- Escudo de Madeira   : 'a1b2c3d4-0005-0001-0001-000000000002'
-- Poção de Cura       : 'a1b2c3d4-0005-0001-0001-000000000003'
-- Cajado de Mago      : 'a1b2c3d4-0005-0001-0001-000000000004'
-- Arco Curto          : 'a1b2c3d4-0005-0001-0001-000000000005'
-- Adaga               : 'a1b2c3d4-0005-0001-0001-000000000006'
--
-- Skills
-- Golpe Poderoso      : 'a1b2c3d4-0006-0001-0001-000000000001'
-- Bola de Fogo        : 'a1b2c3d4-0006-0001-0001-000000000002'
-- Flecha Certeira     : 'a1b2c3d4-0006-0001-0001-000000000003'
-- Ataque Furtivo      : 'a1b2c3d4-0006-0001-0001-000000000004'
--
-- Quests
-- a-luz-da-torre      : 'a1b2c3d4-0007-0001-0001-000000000001'
-- suprimentos-perdidos: 'a1b2c3d4-0007-0001-0001-000000000002'

-- ─── CAMPAIGN ────────────────────────────────────────────────
INSERT INTO campaigns (id, slug, title, description, is_active)
VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'as-cinzas-de-valdris',
  'As Cinzas de Valdris',
  'Uma antiga torre abandonada voltou a emitir uma luz vermelha sobre a vila de Valdris. '
  'Rumores de criaturas nas estradas e desaparecimentos misteriosos perturbam a paz local. '
  'O que se esconde nas ruínas? Apenas um aventureiro corajoso será capaz de descobrir a verdade.',
  TRUE
);

-- ─── LOCATIONS ───────────────────────────────────────────────
INSERT INTO locations (id, slug, name, description, type, map_x, map_y, connected_locations)
VALUES
  (
    'a1b2c3d4-0002-0001-0001-000000000001',
    'vila-de-valdris',
    'Vila de Valdris',
    'Uma pequena vila de pescadores e agricultores cercada por muros de madeira. '
    'Seus habitantes vivem com medo desde que a torre voltou a iluminar. '
    'A praça central abriga uma estalagem, uma ferraria e o posto dos guardas.',
    'village',
    10, 10,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000002', 'a1b2c3d4-0002-0001-0001-000000000003']
  ),
  (
    'a1b2c3d4-0002-0001-0001-000000000002',
    'torre-abandonada',
    'Torre Abandonada',
    'Uma torre de pedra escura que se ergue sombria no alto da colina a leste da vila. '
    'Janelas entaipadas deixam escapar um brilho vermelho pulsante à noite. '
    'A vegetação ao redor murcha e os animais evitam o local.',
    'tower',
    20, 5,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000001', 'a1b2c3d4-0002-0001-0001-000000000004']
  ),
  (
    'a1b2c3d4-0002-0001-0001-000000000003',
    'floresta-das-sombras',
    'Floresta das Sombras',
    'Uma densa floresta a oeste de Valdris cujas copas bloqueiam quase toda a luz do sol. '
    'Trilhas antigas cruzam a floresta, mas muitos que as seguiram não voltaram para contar. '
    'Criaturas hostis habitam a escuridão entre as árvores.',
    'forest',
    2, 15,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000001', 'a1b2c3d4-0002-0001-0001-000000000004']
  ),
  (
    'a1b2c3d4-0002-0001-0001-000000000004',
    'passagem-secreta',
    'Passagem Secreta',
    'Uma rede de túneis subterrâneos que liga a base da torre à floresta e às catacumbas abaixo da vila. '
    'Paredes de pedra cobertas de musgo e inscrições apagadas guardam segredos de séculos. '
    'O ar úmido carrega um cheiro de enxofre.',
    'cave',
    12, 8,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000002', 'a1b2c3d4-0002-0001-0001-000000000003', 'a1b2c3d4-0002-0001-0001-000000000005']
  ),
  (
    'a1b2c3d4-0002-0001-0001-000000000005',
    'camara-do-artefato',
    'Câmara do Artefato',
    'Uma câmara subterrânea circular com teto abobadado coberto de runas brilhantes. '
    'No centro repousa um pedestal de obsidiana sobre o qual um cristal vermelho pulsa lentamente. '
    'O artefato parece alimentar a magia corrompida que assola a região.',
    'dungeon',
    14, 12,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000004']
  );

-- ─── NPCS ────────────────────────────────────────────────────
INSERT INTO npcs (id, slug, name, description, personality, location_id, default_relationship, default_relationship_value)
VALUES
  (
    'a1b2c3d4-0003-0001-0001-000000000001',
    'eldrin-o-mago',
    'Eldrin',
    'Um mago idoso de robes azuis desgastados e olhos cor de âmbar que brilham com conhecimento arcano. '
    'Chegou a Valdris há três semanas após sentir a magia da torre despertar. '
    'Possui uma coleção de tomos raros e parece saber mais do que revela.',
    'Misterioso e cauteloso. Fala em riddles quando não confia em alguém. '
    'Generoso com quem demonstra inteligência e lealdade.',
    'a1b2c3d4-0002-0001-0001-000000000001',
    'neutral',
    0
  ),
  (
    'a1b2c3d4-0003-0001-0001-000000000002',
    'marta-a-estalajadeira',
    'Marta',
    'Uma mulher robusta de meia-idade que administra a Estalagem do Javali com mão de ferro. '
    'Conhece cada morador e visitante da vila. '
    'Serve a melhor cerveja de Valdris e nunca nega abrigo a quem paga.',
    'Direta e prática. Não tolera confusão em seu estabelecimento. '
    'Leal à vila e disposta a ajudar quem mostra boa-fé.',
    'a1b2c3d4-0002-0001-0001-000000000001',
    'friendly',
    20
  ),
  (
    'a1b2c3d4-0003-0001-0001-000000000003',
    'gregor-o-ferreiro',
    'Gregor',
    'Um ferreiro de ombros largos com cicatrizes de batalhas antigas. '
    'Foi soldado por vinte anos antes de se estabelecer em Valdris. '
    'Seu trabalho com metal é o melhor da região.',
    'Direto e pouco dado a conversa. Respeita força e honestidade. '
    'Desconfia de magos mas aprecia guerreiros competentes.',
    'a1b2c3d4-0002-0001-0001-000000000001',
    'neutral',
    0
  ),
  (
    'a1b2c3d4-0003-0001-0001-000000000004',
    'capitao-aldric',
    'Capitão Aldric',
    'O capitão dos guardas de Valdris, um homem de quarenta anos com postura militar impecável. '
    'Usa armadura com o brasão da vila e carrega uma espada longa hereditária. '
    'Responsável pela segurança dos cidadãos mas com recursos limitados.',
    'Leal à vila e às suas responsabilidades. Segue as regras à risca. '
    'Desconfiado de estranhos mas justo com quem prova seu valor.',
    'a1b2c3d4-0002-0001-0001-000000000001',
    'neutral',
    5
  );

-- ─── ENEMIES ─────────────────────────────────────────────────
INSERT INTO enemies (id, slug, name, level, max_hp, attack, defense, speed, experience_reward, gold_reward, loot_table, weaknesses)
VALUES
  (
    'a1b2c3d4-0004-0001-0001-000000000001',
    'goblin',
    'Goblin',
    1, 12, 5, 3, 12,
    30, 5,
    '[{"itemId":"a1b2c3d4-0005-0001-0001-000000000006","dropChance":0.3}]',
    ARRAY['fire','light']
  ),
  (
    'a1b2c3d4-0004-0001-0001-000000000002',
    'lobo',
    'Lobo',
    1, 10, 6, 2, 15,
    25, 2,
    '[]',
    ARRAY['fire']
  ),
  (
    'a1b2c3d4-0004-0001-0001-000000000003',
    'esqueleto',
    'Esqueleto',
    2, 15, 7, 5, 8,
    50, 8,
    '[{"itemId":"a1b2c3d4-0005-0001-0001-000000000001","dropChance":0.15}]',
    ARRAY['holy','blunt']
  ),
  (
    'a1b2c3d4-0004-0001-0001-000000000004',
    'orc',
    'Orc',
    3, 25, 10, 7, 9,
    90, 15,
    '[{"itemId":"a1b2c3d4-0005-0001-0001-000000000001","dropChance":0.25}]',
    ARRAY['magic']
  ),
  (
    'a1b2c3d4-0004-0001-0001-000000000005',
    'aranha-gigante',
    'Aranha Gigante',
    2, 18, 8, 4, 14,
    60, 6,
    '[{"itemId":"a1b2c3d4-0005-0001-0001-000000000003","dropChance":0.2}]',
    ARRAY['fire']
  );

-- ─── ITEMS ───────────────────────────────────────────────────
INSERT INTO items (id, slug, name, description, type, rarity, value, weight, effects)
VALUES
  (
    'a1b2c3d4-0005-0001-0001-000000000001',
    'espada-de-ferro',
    'Espada de Ferro',
    'Uma espada longa forjada em ferro comum. Resistente e equilibrada, ideal para iniciantes.',
    'weapon', 'common', 50, 3.5,
    '[{"stat":"attack","value":8,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0005-0001-0001-000000000002',
    'escudo-de-madeira',
    'Escudo de Madeira',
    'Um escudo redondo feito de carvalho reforçado com aros de ferro. Oferece proteção básica.',
    'armor', 'common', 30, 4.0,
    '[{"stat":"defense","value":5,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0005-0001-0001-000000000003',
    'pocao-de-cura',
    'Poção de Cura',
    'Um frasco de vidro com líquido rosado que restaura vitalidade ao ser consumido.',
    'potion', 'common', 25, 0.3,
    '[{"stat":"currentHp","value":20,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0005-0001-0001-000000000004',
    'cajado-de-mago',
    'Cajado de Mago',
    'Um cajado de madeira de freixo com uma gema azul na ponta que amplia o poder arcano do portador.',
    'weapon', 'common', 60, 2.0,
    '[{"stat":"attack","value":5,"type":"flat"},{"stat":"intelligence","value":2,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0005-0001-0001-000000000005',
    'arco-curto',
    'Arco Curto',
    'Um arco leve feito de madeira de teixo, ágil e preciso em curtas e médias distâncias.',
    'weapon', 'common', 45, 1.5,
    '[{"stat":"attack","value":7,"type":"flat"},{"stat":"dexterity","value":1,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0005-0001-0001-000000000006',
    'adaga',
    'Adaga',
    'Uma lâmina curta e afiada, ideal para ataques rápidos e combate furtivo.',
    'weapon', 'common', 20, 0.5,
    '[{"stat":"attack","value":4,"type":"flat"},{"stat":"initiative","value":2,"type":"flat"}]'
  );

-- ─── SKILLS ──────────────────────────────────────────────────
INSERT INTO skills (id, slug, name, description, class, type, mana_cost, energy_cost, cooldown, effects)
VALUES
  (
    'a1b2c3d4-0006-0001-0001-000000000001',
    'golpe-poderoso',
    'Golpe Poderoso',
    'O guerreiro concentra toda sua força em um único golpe devastador, causando dano amplificado ao alvo.',
    'warrior', 'active', 0, 30, 2,
    '[{"stat":"damage","value":150,"type":"percent"},{"stat":"stagger","value":1,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0006-0001-0001-000000000002',
    'bola-de-fogo',
    'Bola de Fogo',
    'O mago conjura uma esfera de fogo incandescente que explode ao atingir o alvo, causando dano mágico.',
    'mage', 'active', 20, 0, 1,
    '[{"stat":"magicDamage","value":18,"type":"flat"},{"stat":"burning","value":3,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0006-0001-0001-000000000003',
    'flecha-certeira',
    'Flecha Certeira',
    'O arqueiro mira com precisão cirúrgica, disparando uma flecha que ignora parte da defesa do inimigo.',
    'archer', 'active', 0, 25, 1,
    '[{"stat":"damage","value":120,"type":"percent"},{"stat":"armorPenetration","value":3,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0006-0001-0001-000000000004',
    'ataque-furtivo',
    'Ataque Furtivo',
    'O rogue sai das sombras para desferir um golpe preciso em um ponto vital do inimigo desprevenido.',
    'rogue', 'active', 0, 20, 2,
    '[{"stat":"damage","value":200,"type":"percent"},{"stat":"bleeding","value":2,"type":"flat"}]'
  );

-- ─── QUESTS ──────────────────────────────────────────────────
INSERT INTO quests (id, campaign_id, slug, name, description, objective, max_progress, experience_reward, rewards)
VALUES
  (
    'a1b2c3d4-0007-0001-0001-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'a-luz-da-torre',
    'A Luz da Torre',
    'A torre abandonada a leste de Valdris voltou a emitir uma luz vermelha perturbadora. '
    'O mago Eldrin acredita que um artefato corrompido no subsolo está alimentando criaturas malignas. '
    'Investigue a torre, encontre a passagem secreta e destrua ou sele o cristal na câmara profunda.',
    'Encontre e destrua o Cristal Corrompido na Câmara do Artefato.',
    3,
    500,
    '[{"type":"gold","amount":100},{"type":"item","itemId":"a1b2c3d4-0005-0001-0001-000000000001"},{"type":"experience","amount":500}]'
  ),
  (
    'a1b2c3d4-0007-0001-0001-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'suprimentos-perdidos',
    'Suprimentos Perdidos',
    'Uma caravana de suprimentos desapareceu na Floresta das Sombras há dois dias. '
    'Marta, a estalajadeira, está preocupada pois seus estoques de provisões estavam nessa caravana. '
    'Localize os suprimentos e descubra o que aconteceu com os carregadores.',
    'Encontre os suprimentos perdidos na Floresta das Sombras.',
    2,
    200,
    '[{"type":"gold","amount":40},{"type":"item","itemId":"a1b2c3d4-0005-0001-0001-000000000003"},{"type":"experience","amount":200}]'
  );
