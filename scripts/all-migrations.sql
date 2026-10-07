-- ============================================================
-- Migration 001 â€” Initial Schema
-- RPG Digital
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- â”€â”€â”€ PROFILES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username   TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CHARACTERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE characters (
  id                       UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                  UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name                     TEXT        NOT NULL,
  class                    TEXT        NOT NULL CHECK (class IN ('warrior','mage','archer','rogue','cleric','paladin')),
  race                     TEXT        NOT NULL,
  level                    INTEGER     DEFAULT 1,
  experience               INTEGER     DEFAULT 0,
  experience_to_next_level INTEGER     DEFAULT 300,
  current_hp               INTEGER     NOT NULL,
  max_hp                   INTEGER     NOT NULL,
  current_mana             INTEGER     DEFAULT 0,
  max_mana                 INTEGER     DEFAULT 0,
  current_energy           INTEGER     DEFAULT 100,
  max_energy               INTEGER     DEFAULT 100,
  gold                     INTEGER     DEFAULT 50,
  background               TEXT,
  personality              TEXT,
  description              TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CHARACTER_ATTRIBUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE character_attributes (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id    UUID        REFERENCES characters(id) ON DELETE CASCADE NOT NULL UNIQUE,
  strength        INTEGER     DEFAULT 10,
  dexterity       INTEGER     DEFAULT 10,
  constitution    INTEGER     DEFAULT 10,
  intelligence    INTEGER     DEFAULT 10,
  wisdom          INTEGER     DEFAULT 10,
  charisma        INTEGER     DEFAULT 10,
  attack          INTEGER     DEFAULT 0,
  defense         INTEGER     DEFAULT 0,
  initiative      INTEGER     DEFAULT 0,
  critical_chance INTEGER     DEFAULT 5,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ ITEMS (global catalog) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE items (
  id          UUID           DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        TEXT           UNIQUE NOT NULL,
  name        TEXT           NOT NULL,
  description TEXT,
  type        TEXT           NOT NULL CHECK (type IN ('weapon','armor','potion','accessory','quest_item','material')),
  rarity      TEXT           DEFAULT 'common' CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
  value       INTEGER        DEFAULT 0,
  weight      NUMERIC(8,2)   DEFAULT 0,
  effects     JSONB          DEFAULT '[]',
  image_url   TEXT,
  created_at  TIMESTAMPTZ    DEFAULT NOW()
);

-- â”€â”€â”€ CHARACTER_INVENTORY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE character_inventory (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id   UUID        REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  item_id        UUID        REFERENCES items(id) NOT NULL,
  quantity       INTEGER     DEFAULT 1,
  equipped       BOOLEAN     DEFAULT FALSE,
  equipment_slot TEXT        CHECK (equipment_slot IN ('weapon','shield','head','body','legs','boots','accessory1','accessory2')),
  acquired_at    TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ SKILLS catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE skills (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        TEXT        UNIQUE NOT NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  class       TEXT,
  type        TEXT        CHECK (type IN ('active','passive','ultimate')),
  mana_cost   INTEGER     DEFAULT 0,
  energy_cost INTEGER     DEFAULT 0,
  cooldown    INTEGER     DEFAULT 0,
  effects     JSONB       DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CHARACTER_SKILLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE character_skills (
  id          UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id UUID   REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  skill_id    UUID    REFERENCES skills(id) NOT NULL,
  level       INTEGER DEFAULT 1,
  is_equipped BOOLEAN DEFAULT TRUE,
  UNIQUE(character_id, skill_id)
);

-- â”€â”€â”€ LOCATIONS catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE locations (
  id                   UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug                 TEXT        UNIQUE NOT NULL,
  name                 TEXT        NOT NULL,
  description          TEXT,
  type                 TEXT        CHECK (type IN ('city','village','forest','mountain','cave','dungeon','tower','river')),
  image_url            TEXT,
  map_x                INTEGER,
  map_y                INTEGER,
  connected_locations  TEXT[]      DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ NPCS catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE npcs (
  id                        UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug                      TEXT        UNIQUE NOT NULL,
  name                      TEXT        NOT NULL,
  description               TEXT,
  personality               TEXT,
  location_id               UUID        REFERENCES locations(id),
  default_relationship      TEXT        DEFAULT 'neutral',
  default_relationship_value INTEGER    DEFAULT 0,
  image_url                 TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ ENEMIES templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE enemies (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug               TEXT        UNIQUE NOT NULL,
  name               TEXT        NOT NULL,
  level              INTEGER     DEFAULT 1,
  max_hp             INTEGER     NOT NULL,
  attack             INTEGER     NOT NULL,
  defense            INTEGER     NOT NULL,
  speed              INTEGER     DEFAULT 10,
  skills             JSONB       DEFAULT '[]',
  experience_reward  INTEGER     DEFAULT 0,
  gold_reward        INTEGER     DEFAULT 0,
  loot_table         JSONB       DEFAULT '[]',
  weaknesses         TEXT[]      DEFAULT '{}',
  image_url          TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CAMPAIGNS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE campaigns (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        TEXT        UNIQUE NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CAMPAIGN_PLAYERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE campaign_players (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id    UUID        REFERENCES campaigns(id) NOT NULL,
  character_id   UUID        REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at     TIMESTAMPTZ DEFAULT NOW(),
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  is_completed   BOOLEAN     DEFAULT FALSE,
  UNIQUE(campaign_id, character_id)
);

-- â”€â”€â”€ CAMPAIGN_STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE campaign_state (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id  UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_location_id UUID        REFERENCES locations(id),
  current_scene_id    TEXT,
  world_state         JSONB       DEFAULT '{}',
  npc_states          JSONB       DEFAULT '{}',
  enemy_states        JSONB       DEFAULT '{}',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CAMPAIGN_EVENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE campaign_events (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  type               TEXT        NOT NULL,
  description        TEXT        NOT NULL,
  metadata           JSONB       DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CAMPAIGN_MEMORIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE campaign_memories (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  type               TEXT        CHECK (type IN ('permanent','recent','summary')) NOT NULL,
  content            TEXT        NOT NULL,
  importance         INTEGER     DEFAULT 5,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CAMPAIGN_DECISIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE campaign_decisions (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  scene_id           TEXT,
  description        TEXT        NOT NULL,
  consequence        TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ QUESTS catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE quests (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id        UUID        REFERENCES campaigns(id),
  slug               TEXT        UNIQUE NOT NULL,
  name               TEXT        NOT NULL,
  description        TEXT,
  objective          TEXT,
  max_progress       INTEGER     DEFAULT 1,
  experience_reward  INTEGER     DEFAULT 0,
  rewards            JSONB       DEFAULT '[]',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ CHARACTER_QUESTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE character_quests (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id UUID        REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  quest_id     UUID        REFERENCES quests(id) NOT NULL,
  status       TEXT        DEFAULT 'active' CHECK (status IN ('available','active','completed','failed')),
  progress     INTEGER     DEFAULT 0,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(character_id, quest_id)
);

-- â”€â”€â”€ NPC_RELATIONSHIPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE npc_relationships (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  npc_id             UUID        REFERENCES npcs(id) NOT NULL,
  relationship       TEXT        DEFAULT 'neutral',
  relationship_value INTEGER     DEFAULT 0,
  is_alive           BOOLEAN     DEFAULT TRUE,
  notes              TEXT,
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_player_id, npc_id)
);

-- â”€â”€â”€ COMBAT_SESSIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE combat_sessions (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  enemies_data       JSONB       NOT NULL,
  status             TEXT        DEFAULT 'active' CHECK (status IN ('active','victory','defeat','fled')),
  started_at         TIMESTAMPTZ DEFAULT NOW(),
  ended_at           TIMESTAMPTZ
);

-- â”€â”€â”€ COMBAT_TURNS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE combat_turns (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  combat_session_id UUID        REFERENCES combat_sessions(id) ON DELETE CASCADE NOT NULL,
  turn_number       INTEGER     NOT NULL,
  actor             TEXT        NOT NULL,
  action            TEXT        NOT NULL,
  dice_roll         JSONB,
  result            TEXT        NOT NULL,
  damage            INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- â”€â”€â”€ DICE_ROLLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE dice_rolls (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE,
  expression         TEXT        NOT NULL,
  results            JSONB       NOT NULL,
  modifier           INTEGER     DEFAULT 0,
  total              INTEGER     NOT NULL,
  context            TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- Migration 002 â€” Row Level Security Policies
-- RPG Digital
-- ============================================================

-- â”€â”€â”€ Enable RLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters         ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_skills    ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_quests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_players    ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_state      ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_memories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_decisions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE npc_relationships   ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_turns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE dice_rolls          ENABLE ROW LEVEL SECURITY;
ALTER TABLE items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills              ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE enemies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests              ENABLE ROW LEVEL SECURITY;

-- â”€â”€â”€ Catalog tables: read for authenticated users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Authenticated users can read items"
  ON items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read skills"
  ON skills FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read locations"
  ON locations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read npcs"
  ON npcs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read enemies"
  ON enemies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read campaigns"
  ON campaigns FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read quests"
  ON quests FOR SELECT TO authenticated USING (true);

-- â”€â”€â”€ Profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- â”€â”€â”€ Characters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own characters"
  ON characters FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- â”€â”€â”€ Character attributes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own character attributes"
  ON character_attributes FOR ALL TO authenticated
  USING (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ))
  WITH CHECK (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Character inventory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own inventory"
  ON character_inventory FOR ALL TO authenticated
  USING (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ))
  WITH CHECK (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Character skills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own character skills"
  ON character_skills FOR ALL TO authenticated
  USING (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ))
  WITH CHECK (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Character quests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own character quests"
  ON character_quests FOR ALL TO authenticated
  USING (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ))
  WITH CHECK (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Campaign players â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own campaign instances"
  ON campaign_players FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- â”€â”€â”€ Campaign state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own campaign state"
  ON campaign_state FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Campaign events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own campaign events"
  ON campaign_events FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Campaign memories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own campaign memories"
  ON campaign_memories FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Campaign decisions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own campaign decisions"
  ON campaign_decisions FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ NPC relationships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own npc relationships"
  ON npc_relationships FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Combat sessions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own combat sessions"
  ON combat_sessions FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- â”€â”€â”€ Combat turns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own combat turns"
  ON combat_turns FOR ALL TO authenticated
  USING (combat_session_id IN (
    SELECT cs.id
    FROM   combat_sessions cs
    JOIN   campaign_players cp ON cs.campaign_player_id = cp.id
    WHERE  cp.user_id = auth.uid()
  ))
  WITH CHECK (combat_session_id IN (
    SELECT cs.id
    FROM   combat_sessions cs
    JOIN   campaign_players cp ON cs.campaign_player_id = cp.id
    WHERE  cp.user_id = auth.uid()
  ));

-- â”€â”€â”€ Dice rolls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE POLICY "Users can manage own dice rolls"
  ON dice_rolls FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));


-- ============================================================
-- Migration 003 â€” Seed Data
-- Campaign: As Cinzas de Valdris
-- ============================================================

-- â”€â”€â”€ Hardcoded UUIDs for cross-reference â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Campaign
-- campaign            : 'a1b2c3d4-0001-0001-0001-000000000001'
--
-- Locations
-- Vila de Valdris     : 'a1b2c3d4-0002-0001-0001-000000000001'
-- Torre Abandonada    : 'a1b2c3d4-0002-0001-0001-000000000002'
-- Floresta das Sombras: 'a1b2c3d4-0002-0001-0001-000000000003'
-- Passagem Secreta    : 'a1b2c3d4-0002-0001-0001-000000000004'
-- CÃ¢mara do Artefato  : 'a1b2c3d4-0002-0001-0001-000000000005'
--
-- NPCs
-- Eldrin              : 'a1b2c3d4-0003-0001-0001-000000000001'
-- Marta               : 'a1b2c3d4-0003-0001-0001-000000000002'
-- Gregor              : 'a1b2c3d4-0003-0001-0001-000000000003'
-- CapitÃ£o Aldric      : 'a1b2c3d4-0003-0001-0001-000000000004'
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
-- PoÃ§Ã£o de Cura       : 'a1b2c3d4-0005-0001-0001-000000000003'
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

-- â”€â”€â”€ CAMPAIGN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO campaigns (id, slug, title, description, is_active)
VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'as-cinzas-de-valdris',
  'As Cinzas de Valdris',
  'Uma antiga torre abandonada voltou a emitir uma luz vermelha sobre a vila de Valdris. '
  'Rumores de criaturas nas estradas e desaparecimentos misteriosos perturbam a paz local. '
  'O que se esconde nas ruÃ­nas? Apenas um aventureiro corajoso serÃ¡ capaz de descobrir a verdade.',
  TRUE
);

-- â”€â”€â”€ LOCATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO locations (id, slug, name, description, type, map_x, map_y, connected_locations)
VALUES
  (
    'a1b2c3d4-0002-0001-0001-000000000001',
    'vila-de-valdris',
    'Vila de Valdris',
    'Uma pequena vila de pescadores e agricultores cercada por muros de madeira. '
    'Seus habitantes vivem com medo desde que a torre voltou a iluminar. '
    'A praÃ§a central abriga uma estalagem, uma ferraria e o posto dos guardas.',
    'village',
    10, 10,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000002', 'a1b2c3d4-0002-0001-0001-000000000003']
  ),
  (
    'a1b2c3d4-0002-0001-0001-000000000002',
    'torre-abandonada',
    'Torre Abandonada',
    'Uma torre de pedra escura que se ergue sombria no alto da colina a leste da vila. '
    'Janelas entaipadas deixam escapar um brilho vermelho pulsante Ã  noite. '
    'A vegetaÃ§Ã£o ao redor murcha e os animais evitam o local.',
    'tower',
    20, 5,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000001', 'a1b2c3d4-0002-0001-0001-000000000004']
  ),
  (
    'a1b2c3d4-0002-0001-0001-000000000003',
    'floresta-das-sombras',
    'Floresta das Sombras',
    'Uma densa floresta a oeste de Valdris cujas copas bloqueiam quase toda a luz do sol. '
    'Trilhas antigas cruzam a floresta, mas muitos que as seguiram nÃ£o voltaram para contar. '
    'Criaturas hostis habitam a escuridÃ£o entre as Ã¡rvores.',
    'forest',
    2, 15,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000001', 'a1b2c3d4-0002-0001-0001-000000000004']
  ),
  (
    'a1b2c3d4-0002-0001-0001-000000000004',
    'passagem-secreta',
    'Passagem Secreta',
    'Uma rede de tÃºneis subterrÃ¢neos que liga a base da torre Ã  floresta e Ã s catacumbas abaixo da vila. '
    'Paredes de pedra cobertas de musgo e inscriÃ§Ãµes apagadas guardam segredos de sÃ©culos. '
    'O ar Ãºmido carrega um cheiro de enxofre.',
    'cave',
    12, 8,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000002', 'a1b2c3d4-0002-0001-0001-000000000003', 'a1b2c3d4-0002-0001-0001-000000000005']
  ),
  (
    'a1b2c3d4-0002-0001-0001-000000000005',
    'camara-do-artefato',
    'CÃ¢mara do Artefato',
    'Uma cÃ¢mara subterrÃ¢nea circular com teto abobadado coberto de runas brilhantes. '
    'No centro repousa um pedestal de obsidiana sobre o qual um cristal vermelho pulsa lentamente. '
    'O artefato parece alimentar a magia corrompida que assola a regiÃ£o.',
    'dungeon',
    14, 12,
    ARRAY['a1b2c3d4-0002-0001-0001-000000000004']
  );

-- â”€â”€â”€ NPCS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO npcs (id, slug, name, description, personality, location_id, default_relationship, default_relationship_value)
VALUES
  (
    'a1b2c3d4-0003-0001-0001-000000000001',
    'eldrin-o-mago',
    'Eldrin',
    'Um mago idoso de robes azuis desgastados e olhos cor de Ã¢mbar que brilham com conhecimento arcano. '
    'Chegou a Valdris hÃ¡ trÃªs semanas apÃ³s sentir a magia da torre despertar. '
    'Possui uma coleÃ§Ã£o de tomos raros e parece saber mais do que revela.',
    'Misterioso e cauteloso. Fala em riddles quando nÃ£o confia em alguÃ©m. '
    'Generoso com quem demonstra inteligÃªncia e lealdade.',
    'a1b2c3d4-0002-0001-0001-000000000001',
    'neutral',
    0
  ),
  (
    'a1b2c3d4-0003-0001-0001-000000000002',
    'marta-a-estalajadeira',
    'Marta',
    'Uma mulher robusta de meia-idade que administra a Estalagem do Javali com mÃ£o de ferro. '
    'Conhece cada morador e visitante da vila. '
    'Serve a melhor cerveja de Valdris e nunca nega abrigo a quem paga.',
    'Direta e prÃ¡tica. NÃ£o tolera confusÃ£o em seu estabelecimento. '
    'Leal Ã  vila e disposta a ajudar quem mostra boa-fÃ©.',
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
    'Seu trabalho com metal Ã© o melhor da regiÃ£o.',
    'Direto e pouco dado a conversa. Respeita forÃ§a e honestidade. '
    'Desconfia de magos mas aprecia guerreiros competentes.',
    'a1b2c3d4-0002-0001-0001-000000000001',
    'neutral',
    0
  ),
  (
    'a1b2c3d4-0003-0001-0001-000000000004',
    'capitao-aldric',
    'CapitÃ£o Aldric',
    'O capitÃ£o dos guardas de Valdris, um homem de quarenta anos com postura militar impecÃ¡vel. '
    'Usa armadura com o brasÃ£o da vila e carrega uma espada longa hereditÃ¡ria. '
    'ResponsÃ¡vel pela seguranÃ§a dos cidadÃ£os mas com recursos limitados.',
    'Leal Ã  vila e Ã s suas responsabilidades. Segue as regras Ã  risca. '
    'Desconfiado de estranhos mas justo com quem prova seu valor.',
    'a1b2c3d4-0002-0001-0001-000000000001',
    'neutral',
    5
  );

-- â”€â”€â”€ ENEMIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ ITEMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    'Um escudo redondo feito de carvalho reforÃ§ado com aros de ferro. Oferece proteÃ§Ã£o bÃ¡sica.',
    'armor', 'common', 30, 4.0,
    '[{"stat":"defense","value":5,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0005-0001-0001-000000000003',
    'pocao-de-cura',
    'PoÃ§Ã£o de Cura',
    'Um frasco de vidro com lÃ­quido rosado que restaura vitalidade ao ser consumido.',
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
    'Um arco leve feito de madeira de teixo, Ã¡gil e preciso em curtas e mÃ©dias distÃ¢ncias.',
    'weapon', 'common', 45, 1.5,
    '[{"stat":"attack","value":7,"type":"flat"},{"stat":"dexterity","value":1,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0005-0001-0001-000000000006',
    'adaga',
    'Adaga',
    'Uma lÃ¢mina curta e afiada, ideal para ataques rÃ¡pidos e combate furtivo.',
    'weapon', 'common', 20, 0.5,
    '[{"stat":"attack","value":4,"type":"flat"},{"stat":"initiative","value":2,"type":"flat"}]'
  );

-- â”€â”€â”€ SKILLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO skills (id, slug, name, description, class, type, mana_cost, energy_cost, cooldown, effects)
VALUES
  (
    'a1b2c3d4-0006-0001-0001-000000000001',
    'golpe-poderoso',
    'Golpe Poderoso',
    'O guerreiro concentra toda sua forÃ§a em um Ãºnico golpe devastador, causando dano amplificado ao alvo.',
    'warrior', 'active', 0, 30, 2,
    '[{"stat":"damage","value":150,"type":"percent"},{"stat":"stagger","value":1,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0006-0001-0001-000000000002',
    'bola-de-fogo',
    'Bola de Fogo',
    'O mago conjura uma esfera de fogo incandescente que explode ao atingir o alvo, causando dano mÃ¡gico.',
    'mage', 'active', 20, 0, 1,
    '[{"stat":"magicDamage","value":18,"type":"flat"},{"stat":"burning","value":3,"type":"flat"}]'
  ),
  (
    'a1b2c3d4-0006-0001-0001-000000000003',
    'flecha-certeira',
    'Flecha Certeira',
    'O arqueiro mira com precisÃ£o cirÃºrgica, disparando uma flecha que ignora parte da defesa do inimigo.',
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

-- â”€â”€â”€ QUESTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO quests (id, campaign_id, slug, name, description, objective, max_progress, experience_reward, rewards)
VALUES
  (
    'a1b2c3d4-0007-0001-0001-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'a-luz-da-torre',
    'A Luz da Torre',
    'A torre abandonada a leste de Valdris voltou a emitir uma luz vermelha perturbadora. '
    'O mago Eldrin acredita que um artefato corrompido no subsolo estÃ¡ alimentando criaturas malignas. '
    'Investigue a torre, encontre a passagem secreta e destrua ou sele o cristal na cÃ¢mara profunda.',
    'Encontre e destrua o Cristal Corrompido na CÃ¢mara do Artefato.',
    3,
    500,
    '[{"type":"gold","amount":100},{"type":"item","itemId":"a1b2c3d4-0005-0001-0001-000000000001"},{"type":"experience","amount":500}]'
  ),
  (
    'a1b2c3d4-0007-0001-0001-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'suprimentos-perdidos',
    'Suprimentos Perdidos',
    'Uma caravana de suprimentos desapareceu na Floresta das Sombras hÃ¡ dois dias. '
    'Marta, a estalajadeira, estÃ¡ preocupada pois seus estoques de provisÃµes estavam nessa caravana. '
    'Localize os suprimentos e descubra o que aconteceu com os carregadores.',
    'Encontre os suprimentos perdidos na Floresta das Sombras.',
    2,
    200,
    '[{"type":"gold","amount":40},{"type":"item","itemId":"a1b2c3d4-0005-0001-0001-000000000003"},{"type":"experience","amount":200}]'
  );

