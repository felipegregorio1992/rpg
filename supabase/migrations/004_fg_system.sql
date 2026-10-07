-- ============================================================
-- Migration 004 — Fábulas & Goblins System Seed Data
-- Campaign: A Névoa do Blecaute
-- ============================================================

-- Hardcoded UUIDs for cross-reference
-- Campaign      : 'b2c3d4e5-0001-0001-0001-000000000001'
-- Locations
--   Thornwall   : 'b2c3d4e5-0002-0001-0001-000000000001'
--   Ruínas       : 'b2c3d4e5-0002-0001-0001-000000000002'
--   Floresta    : 'b2c3d4e5-0002-0001-0001-000000000003'
-- Enemies
--   Criatura    : 'b2c3d4e5-0004-0001-0001-000000000001'
--   Guarda      : 'b2c3d4e5-0004-0001-0001-000000000002'
--   Sombras     : 'b2c3d4e5-0004-0001-0001-000000000003'

-- ─── CAMPAIGN ────────────────────────────────────────────────

INSERT INTO campaigns (id, slug, title, description, is_active)
VALUES (
  'b2c3d4e5-0001-0001-0001-000000000001',
  'nevoa-do-blecaute',
  'A Névoa do Blecaute',
  'A névoa roxa do Blecaute cobre Thornwall como uma mortalha viva. '
  'Criaturas corrompidas emergem a cada amanhecer, e os guardas são cada vez menos. '
  'Um portador de Grimo é a última esperança desta vila fronteiriça.',
  TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- ─── LOCATIONS ───────────────────────────────────────────────

INSERT INTO locations (id, slug, name, description, type, map_x, map_y, connected_locations)
VALUES
  (
    'b2c3d4e5-0002-0001-0001-000000000001',
    'vila-de-thornwall',
    'Vila de Thornwall',
    'Uma pequena vila fronteiriça das Terras Místicas cercada por névoa roxa. '
    'Runas protetoras estão entalhadas em todas as portas. '
    'Os moradores caminham em pares mesmo durante o dia, olhando para as sombras.',
    'village',
    10, 10,
    ARRAY[
      'b2c3d4e5-0002-0001-0001-000000000002',
      'b2c3d4e5-0002-0001-0001-000000000003'
    ]
  ),
  (
    'b2c3d4e5-0002-0001-0001-000000000002',
    'ruinas-do-blecaute',
    'Ruínas do Blecaute',
    'Estruturas de pedra antiga corroídas pela névoa mágica do Blecaute. '
    'Cristais violetas brotam das rachaduras, pulsando com energia caótica. '
    'Qualquer magia lançada aqui sem um Grimo produz efeitos imprevisíveis.',
    'dungeon',
    20, 5,
    ARRAY[
      'b2c3d4e5-0002-0001-0001-000000000001',
      'b2c3d4e5-0002-0001-0001-000000000003'
    ]
  ),
  (
    'b2c3d4e5-0002-0001-0001-000000000003',
    'floresta-de-cogumelos',
    'Floresta de Cogumelos',
    'Uma densa floresta onde cogumelos bioluminescentes crescem em tamanhos impossíveis. '
    'A névoa do Blecaute é mais fina aqui, mas as criaturas são mais antigas e imprevisíveis. '
    'Diz-se que os Luminins antigos plantaram os primeiros cogumelos como balizas de luz.',
    'forest',
    5, 15,
    ARRAY[
      'b2c3d4e5-0002-0001-0001-000000000001',
      'b2c3d4e5-0002-0001-0001-000000000002'
    ]
  )
ON CONFLICT (slug) DO NOTHING;

-- ─── ENEMIES ─────────────────────────────────────────────────

INSERT INTO enemies (id, slug, name, level, max_hp, attack, defense, speed, experience_reward, gold_reward)
VALUES
  (
    'b2c3d4e5-0004-0001-0001-000000000001',
    'criatura-do-blecaute',
    'Criatura do Blecaute',
    1, 10, 6, 2, 8, 25, 5
  ),
  (
    'b2c3d4e5-0004-0001-0001-000000000002',
    'guarda-corrompido',
    'Guarda Corrompido',
    2, 18, 8, 4, 10, 50, 10
  ),
  (
    'b2c3d4e5-0004-0001-0001-000000000003',
    'criatura-das-sombras',
    'Criatura das Sombras',
    3, 25, 12, 5, 12, 100, 20
  )
ON CONFLICT (slug) DO NOTHING;
