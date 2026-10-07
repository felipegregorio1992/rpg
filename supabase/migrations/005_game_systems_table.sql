-- ============================================================
-- Migration 005 — Game Systems Schema Additions
-- Adds game_system tracking columns to existing tables
-- ============================================================

-- ─── campaign_players: add game_system column ────────────────

ALTER TABLE campaign_players
  ADD COLUMN IF NOT EXISTS game_system TEXT DEFAULT 'generic';

-- ─── characters: add game_system and fg_character_data columns

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS game_system TEXT DEFAULT 'generic';

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS fg_character_data JSONB;
