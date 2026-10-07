import type { Campaign, CampaignPlayer, Memory } from '../../types';
import { supabase } from './client';

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

// ─── Row shapes ───────────────────────────────────────────────

interface CampaignRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url?: string;
  is_active: boolean;
}

interface CampaignPlayerRow {
  id: string;
  campaign_id: string;
  character_id: string;
  user_id: string;
  started_at: string;
  last_played_at: string;
  is_completed: boolean;
}

interface CampaignStateRow {
  campaign_player_id: string;
  current_location_id: string | null;
  current_scene_id: string | null;
  world_state: Record<string, unknown>;
  npc_states: Record<string, unknown>;
  enemy_states: Record<string, unknown>;
  updated_at: string;
}

interface MemoryRow {
  id: string;
  campaign_player_id: string;
  type: 'permanent' | 'recent' | 'summary';
  content: string;
  importance: number;
  created_at: string;
}

// ─── Converters ───────────────────────────────────────────────

function rowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    isActive: row.is_active,
  };
}

function rowToCampaignPlayer(row: CampaignPlayerRow): CampaignPlayer {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    characterId: row.character_id,
    userId: row.user_id,
    startedAt: row.started_at,
    lastPlayedAt: row.last_played_at,
    isCompleted: row.is_completed,
  };
}

function rowToMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    campaignId: row.campaign_player_id, // used as scoping key
    type: row.type,
    content: row.content,
    importance: row.importance,
    timestamp: row.created_at,
  };
}

// ─── Service functions ────────────────────────────────────────

export async function getCampaigns(): Promise<ServiceResult<Campaign[]>> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: (data as CampaignRow[]).map(rowToCampaign), error: null };
}

export async function startCampaign(
  campaignId: string,
  characterId: string,
  userId: string,
): Promise<ServiceResult<CampaignPlayer>> {
  // Check if already started
  const { data: existing } = await supabase
    .from('campaign_players')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('character_id', characterId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { data: rowToCampaignPlayer(existing as CampaignPlayerRow), error: null };
  }

  const { data: playerRow, error: playerError } = await supabase
    .from('campaign_players')
    .insert({
      campaign_id: campaignId,
      character_id: characterId,
      user_id: userId,
      started_at: new Date().toISOString(),
      last_played_at: new Date().toISOString(),
      is_completed: false,
    })
    .select('*')
    .single();

  if (playerError || !playerRow) {
    return { data: null, error: playerError?.message ?? 'Failed to start campaign' };
  }

  const campaignPlayerId = (playerRow as CampaignPlayerRow).id;

  // Create initial campaign_state row
  const { error: stateError } = await supabase.from('campaign_state').insert({
    campaign_player_id: campaignPlayerId,
    current_location_id: null,
    current_scene_id: null,
    world_state: {},
    npc_states: {},
    enemy_states: {},
  });

  if (stateError) {
    return { data: null, error: stateError.message };
  }

  return { data: rowToCampaignPlayer(playerRow as CampaignPlayerRow), error: null };
}

export async function getCampaignPlayer(
  campaignPlayerId: string,
): Promise<ServiceResult<CampaignPlayer & { state: CampaignStateRow | null }>> {
  const { data: playerRow, error: playerError } = await supabase
    .from('campaign_players')
    .select('*')
    .eq('id', campaignPlayerId)
    .single();

  if (playerError || !playerRow) {
    return { data: null, error: playerError?.message ?? 'Campaign player not found' };
  }

  const { data: stateRow } = await supabase
    .from('campaign_state')
    .select('*')
    .eq('campaign_player_id', campaignPlayerId)
    .maybeSingle();

  return {
    data: {
      ...rowToCampaignPlayer(playerRow as CampaignPlayerRow),
      state: (stateRow as CampaignStateRow | null) ?? null,
    },
    error: null,
  };
}

export async function saveCampaignState(
  campaignPlayerId: string,
  state: {
    currentLocationId?: string | null;
    currentSceneId?: string | null;
    stateData?: Record<string, unknown>;
  },
): Promise<ServiceResult<void>> {
  const upsertPayload: Record<string, unknown> = {
    campaign_player_id: campaignPlayerId,
    updated_at: new Date().toISOString(),
  };

  if (state.currentLocationId !== undefined)
    upsertPayload.current_location_id = state.currentLocationId;
  if (state.currentSceneId !== undefined)
    upsertPayload.current_scene_id = state.currentSceneId;
  if (state.stateData !== undefined) {
    upsertPayload.world_state = state.stateData;
  }

  const { error } = await supabase
    .from('campaign_state')
    .upsert(upsertPayload, { onConflict: 'campaign_player_id' });

  if (error) return { data: null, error: error.message };

  // Update last_played_at on campaign_players
  await supabase
    .from('campaign_players')
    .update({ last_played_at: new Date().toISOString() })
    .eq('id', campaignPlayerId);

  return { data: undefined, error: null };
}

export async function addEvent(
  campaignPlayerId: string,
  type: string,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<ServiceResult<void>> {
  const { error } = await supabase.from('campaign_events').insert({
    campaign_player_id: campaignPlayerId,
    type,
    description,
    metadata: metadata ?? {},
    // created_at é gerado automaticamente pelo banco
  });

  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function addMemory(
  campaignPlayerId: string,
  type: 'permanent' | 'recent' | 'summary',
  content: string,
  importance: number,
): Promise<ServiceResult<Memory>> {
  const { data, error } = await supabase
    .from('campaign_memories')
    .insert({
      campaign_player_id: campaignPlayerId,
      type,
      content,
      importance,
    })
    .select('*')
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? 'Failed to add memory' };
  }

  return { data: rowToMemory(data as MemoryRow), error: null };
}

export async function getMemories(
  campaignPlayerId: string,
  limit = 50,
): Promise<ServiceResult<Memory[]>> {
  const { data, error } = await supabase
    .from('campaign_memories')
    .select('*')
    .eq('campaign_player_id', campaignPlayerId)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error: error.message };
  return { data: (data as MemoryRow[]).map(rowToMemory), error: null };
}

export async function addDecision(
  campaignPlayerId: string,
  sceneId: string,
  description: string,
  consequence: string,
): Promise<ServiceResult<void>> {
  const { error } = await supabase.from('campaign_decisions').insert({
    campaign_player_id: campaignPlayerId,
    scene_id: sceneId,
    description,
    consequence,
    // created_at é gerado automaticamente pelo banco
  });

  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}
