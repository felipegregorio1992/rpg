import { z } from 'zod';
import type { AIResponse } from '../../types';
import type { CampaignContext } from '../../game/narrative/aiPromptBuilder';
import { buildSystemPrompt, buildActionMessage } from '../../game/narrative/aiPromptBuilder';
import { supabase } from '../supabase/client';

// ─── Zod schema ───────────────────────────────────────────────

const AIResponseSchema = z.object({
  narrative: z.string().min(1),
  suggestedActions: z.array(z.string()).optional(),
  skillCheck: z
    .object({
      type: z.literal('skill_check'),
      action: z.string(),
      attribute: z.enum([
        'strength',
        'dexterity',
        'constitution',
        'intelligence',
        'wisdom',
        'charisma',
      ]),
      difficulty: z.number().min(5).max(30),
      narrative: z.string(),
    })
    .nullable()
    .optional(),
  combatTrigger: z
    .object({
      type: z.literal('combat_start'),
      enemies: z.array(z.string()),
      narrative: z.string(),
    })
    .nullable()
    .optional(),
  reward: z
    .object({
      type: z.literal('give_reward'),
      item: z.string().optional(),
      gold: z.number().optional(),
      experience: z.number().optional(),
      narrative: z.string(),
    })
    .nullable()
    .optional(),
  memoryUpdate: z
    .object({
      type: z.literal('memory_update'),
      content: z.string(),
      importance: z.number().min(1).max(10),
    })
    .nullable()
    .optional(),
  npcInteraction: z
    .object({
      type: z.literal('npc_interaction'),
      npcId: z.string(),
      relationshipChange: z.number().min(-20).max(20),
      narrative: z.string(),
    })
    .nullable()
    .optional(),
});

export type ValidatedAIResponse = z.infer<typeof AIResponseSchema>;

// ─── Result type ──────────────────────────────────────────────

export interface AIServiceResult {
  data: AIResponse | null;
  error: string | null;
}

// ─── Internal invoke helper ───────────────────────────────────

async function invokeNarrator(
  systemPrompt: string,
  userMessage: string,
): Promise<AIServiceResult> {
  let response: { data: unknown; error: unknown };

  try {
    response = await supabase.functions.invoke('ai-narrator', {
      body: { systemPrompt, userMessage },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error calling AI';
    return { data: null, error: message };
  }

  if (response.error) {
    const errObj = response.error as { message?: string };
    return { data: null, error: errObj.message ?? 'Edge function error' };
  }

  // Validate response shape with Zod
  const parsed = AIResponseSchema.safeParse(response.data);

  if (!parsed.success) {
    // Attempt to recover: if data has a narrative string, wrap it
    const raw = response.data as Record<string, unknown> | null;
    if (raw && typeof raw.narrative === 'string' && raw.narrative.length > 0) {
      return {
        data: {
          narrative: raw.narrative,
          suggestedActions: Array.isArray(raw.suggestedActions)
            ? (raw.suggestedActions as string[])
            : [],
        },
        error: null,
      };
    }
    return {
      data: null,
      error: `Invalid AI response: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    };
  }

  return { data: parsed.data as AIResponse, error: null };
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Sends a player action to the AI narrator and returns structured narrative.
 * The systemResult parameter should contain pre-calculated game outcomes
 * (attack rolls, damage, HP, etc.) so the AI only narrates, never calculates.
 */
export async function narrateAction(
  campaignContext: CampaignContext,
  playerAction: string,
  systemResult?: string,
): Promise<AIServiceResult> {
  const systemPrompt = buildSystemPrompt(campaignContext);
  const userMessage = buildActionMessage(playerAction, systemResult);
  return invokeNarrator(systemPrompt, userMessage);
}

/**
 * Sends a completed combat result to the AI narrator for narrative generation.
 * All numbers (damage, HP, outcome) must already be calculated by the game engine.
 */
export async function narrateCombatResult(
  campaignContext: CampaignContext,
  combatResultText: string,
): Promise<AIServiceResult> {
  const systemPrompt = buildSystemPrompt(campaignContext);
  const userMessage = buildActionMessage('Resultado do combate', combatResultText);
  return invokeNarrator(systemPrompt, userMessage);
}
