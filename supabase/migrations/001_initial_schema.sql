-- ============================================================
-- Migration 001 — Initial Schema
-- RPG Digital
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username   TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHARACTERS ──────────────────────────────────────────────
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

-- ─── CHARACTER_ATTRIBUTES ────────────────────────────────────
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

-- ─── ITEMS (global catalog) ──────────────────────────────────
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

-- ─── CHARACTER_INVENTORY ─────────────────────────────────────
CREATE TABLE character_inventory (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id   UUID        REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  item_id        UUID        REFERENCES items(id) NOT NULL,
  quantity       INTEGER     DEFAULT 1,
  equipped       BOOLEAN     DEFAULT FALSE,
  equipment_slot TEXT        CHECK (equipment_slot IN ('weapon','shield','head','body','legs','boots','accessory1','accessory2')),
  acquired_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SKILLS catalog ──────────────────────────────────────────
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

-- ─── CHARACTER_SKILLS ────────────────────────────────────────
CREATE TABLE character_skills (
  id          UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id UUID   REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  skill_id    UUID    REFERENCES skills(id) NOT NULL,
  level       INTEGER DEFAULT 1,
  is_equipped BOOLEAN DEFAULT TRUE,
  UNIQUE(character_id, skill_id)
);

-- ─── LOCATIONS catalog ───────────────────────────────────────
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

-- ─── NPCS catalog ────────────────────────────────────────────
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

-- ─── ENEMIES templates ───────────────────────────────────────
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

-- ─── CAMPAIGNS ───────────────────────────────────────────────
CREATE TABLE campaigns (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        TEXT        UNIQUE NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CAMPAIGN_PLAYERS ────────────────────────────────────────
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

-- ─── CAMPAIGN_STATE ──────────────────────────────────────────
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

-- ─── CAMPAIGN_EVENTS ─────────────────────────────────────────
CREATE TABLE campaign_events (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  type               TEXT        NOT NULL,
  description        TEXT        NOT NULL,
  metadata           JSONB       DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CAMPAIGN_MEMORIES ───────────────────────────────────────
CREATE TABLE campaign_memories (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  type               TEXT        CHECK (type IN ('permanent','recent','summary')) NOT NULL,
  content            TEXT        NOT NULL,
  importance         INTEGER     DEFAULT 5,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CAMPAIGN_DECISIONS ──────────────────────────────────────
CREATE TABLE campaign_decisions (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  scene_id           TEXT,
  description        TEXT        NOT NULL,
  consequence        TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QUESTS catalog ──────────────────────────────────────────
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

-- ─── CHARACTER_QUESTS ────────────────────────────────────────
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

-- ─── NPC_RELATIONSHIPS ───────────────────────────────────────
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

-- ─── COMBAT_SESSIONS ─────────────────────────────────────────
CREATE TABLE combat_sessions (
  id                 UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_player_id UUID        REFERENCES campaign_players(id) ON DELETE CASCADE NOT NULL,
  enemies_data       JSONB       NOT NULL,
  status             TEXT        DEFAULT 'active' CHECK (status IN ('active','victory','defeat','fled')),
  started_at         TIMESTAMPTZ DEFAULT NOW(),
  ended_at           TIMESTAMPTZ
);

-- ─── COMBAT_TURNS ────────────────────────────────────────────
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

-- ─── DICE_ROLLS ──────────────────────────────────────────────
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
