-- ============================================================
-- Migration 002 — Row Level Security Policies
-- RPG Digital
-- ============================================================

-- ─── Enable RLS ──────────────────────────────────────────────
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

-- ─── Catalog tables: read for authenticated users ─────────────
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

-- ─── Profiles ────────────────────────────────────────────────
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ─── Characters ──────────────────────────────────────────────
CREATE POLICY "Users can manage own characters"
  ON characters FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Character attributes ────────────────────────────────────
CREATE POLICY "Users can manage own character attributes"
  ON character_attributes FOR ALL TO authenticated
  USING (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ))
  WITH CHECK (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ));

-- ─── Character inventory ─────────────────────────────────────
CREATE POLICY "Users can manage own inventory"
  ON character_inventory FOR ALL TO authenticated
  USING (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ))
  WITH CHECK (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ));

-- ─── Character skills ────────────────────────────────────────
CREATE POLICY "Users can manage own character skills"
  ON character_skills FOR ALL TO authenticated
  USING (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ))
  WITH CHECK (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ));

-- ─── Character quests ────────────────────────────────────────
CREATE POLICY "Users can manage own character quests"
  ON character_quests FOR ALL TO authenticated
  USING (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ))
  WITH CHECK (character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  ));

-- ─── Campaign players ────────────────────────────────────────
CREATE POLICY "Users can manage own campaign instances"
  ON campaign_players FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Campaign state ──────────────────────────────────────────
CREATE POLICY "Users can manage own campaign state"
  ON campaign_state FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- ─── Campaign events ─────────────────────────────────────────
CREATE POLICY "Users can manage own campaign events"
  ON campaign_events FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- ─── Campaign memories ───────────────────────────────────────
CREATE POLICY "Users can manage own campaign memories"
  ON campaign_memories FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- ─── Campaign decisions ──────────────────────────────────────
CREATE POLICY "Users can manage own campaign decisions"
  ON campaign_decisions FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- ─── NPC relationships ───────────────────────────────────────
CREATE POLICY "Users can manage own npc relationships"
  ON npc_relationships FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- ─── Combat sessions ─────────────────────────────────────────
CREATE POLICY "Users can manage own combat sessions"
  ON combat_sessions FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));

-- ─── Combat turns ────────────────────────────────────────────
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

-- ─── Dice rolls ──────────────────────────────────────────────
CREATE POLICY "Users can manage own dice rolls"
  ON dice_rolls FOR ALL TO authenticated
  USING (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ))
  WITH CHECK (campaign_player_id IN (
    SELECT id FROM campaign_players WHERE user_id = auth.uid()
  ));
