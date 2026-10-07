// ============================================================
// RPG Digital — TypeScript Types
// ============================================================

// ─── Character ───────────────────────────────────────────────

export interface CharacterAttributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterModifiers {
  attack: number;
  defense: number;
  initiative: number;
  criticalChance: number;
}

export type CharacterClass = 'warrior' | 'mage' | 'archer' | 'rogue' | 'cleric' | 'paladin';
export type CharacterRace = 'human' | 'elf' | 'dwarf' | 'halfling' | 'orc' | 'half-elf';

export interface Character {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  race: CharacterRace;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  currentHp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
  currentEnergy: number;
  maxEnergy: number;
  gold: number;
  attributes: CharacterAttributes;
  modifiers: CharacterModifiers;
  background: string;
  personality: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Items & Inventory ───────────────────────────────────────

export type ItemType = 'weapon' | 'armor' | 'potion' | 'accessory' | 'quest_item' | 'material';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemEffect {
  stat: string;
  value: number;
  type: 'flat' | 'percent';
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  weight: number;
  effects: ItemEffect[];
  imageUrl?: string;
}

export type EquipmentSlot =
  | 'weapon'
  | 'shield'
  | 'head'
  | 'body'
  | 'legs'
  | 'boots'
  | 'accessory1'
  | 'accessory2';

export interface InventoryItem {
  id: string;
  item: Item;
  quantity: number;
  equipped: boolean;
  slot?: EquipmentSlot;
}

// ─── Quests ──────────────────────────────────────────────────

export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';

export interface QuestReward {
  type: 'item' | 'gold' | 'experience';
  itemId?: string;
  amount?: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  objective: string;
  progress: number;
  maxProgress: number;
  rewards: QuestReward[];
  experienceReward: number;
  status: QuestStatus;
}

// ─── NPCs ────────────────────────────────────────────────────

export type NPCRelationship = 'hostile' | 'distrustful' | 'neutral' | 'friendly' | 'ally';

export interface NPC {
  id: string;
  name: string;
  description: string;
  personality: string;
  locationId: string;
  relationship: NPCRelationship;
  relationshipValue: number;
  isAlive: boolean;
  dialogues: string[];
  quests: string[];
}

// ─── Locations ───────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'city' | 'village' | 'forest' | 'mountain' | 'cave' | 'dungeon' | 'tower' | 'river';
  isDiscovered: boolean;
  imageUrl?: string;
  npcs: string[];
  enemies: string[];
  connectedLocations: string[];
}

// ─── Enemies & Combat ────────────────────────────────────────

export interface LootEntry {
  itemId: string;
  dropChance: number;
}

export type StatusEffectType =
  | 'burning'
  | 'poisoned'
  | 'stunned'
  | 'frozen'
  | 'bleeding'
  | 'strengthened'
  | 'weakened';

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  value: number;
}

export interface Enemy {
  id: string;
  templateId: string;
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  skills: string[];
  experienceReward: number;
  goldReward: number;
  lootTable: LootEntry[];
  weaknesses: string[];
  statusEffects: StatusEffect[];
}

export interface CombatLogEntry {
  turn: number;
  actor: 'player' | 'enemy';
  action: string;
  result: string;
  damage?: number;
  timestamp: string;
}

export interface CombatState {
  id: string;
  isActive: boolean;
  turn: number;
  isPlayerTurn: boolean;
  enemies: Enemy[];
  playerEffects: StatusEffect[];
  log: CombatLogEntry[];
}

// ─── Decisions & Memory ──────────────────────────────────────

export interface Decision {
  id: string;
  campaignId: string;
  sceneId: string;
  description: string;
  consequence: string;
  timestamp: string;
}

export interface Memory {
  id: string;
  campaignId: string;
  type: 'permanent' | 'recent' | 'summary';
  content: string;
  importance: number;
  timestamp: string;
}

// ─── Dice ────────────────────────────────────────────────────

export interface DiceRoll {
  dice: string;
  results: number[];
  modifier: number;
  total: number;
  expression: string;
  isCriticalSuccess: boolean;
  isCriticalFail: boolean;
}

export interface AttributeTestResult {
  roll: number;
  modifier: number;
  total: number;
  difficulty: number;
  outcome: 'critical_success' | 'success' | 'failure' | 'critical_failure';
}

// ─── Scenes & Narrative ──────────────────────────────────────

export interface Scene {
  id: string;
  campaignId: string;
  locationId: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export type NarrativeMessageType =
  | 'narrator'
  | 'player'
  | 'system'
  | 'dice_roll'
  | 'combat'
  | 'npc_dialogue';

export interface NarrativeMessage {
  id: string;
  type: NarrativeMessageType;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Game State ──────────────────────────────────────────────

export interface GameState {
  campaignId: string | null;
  characterId: string | null;
  currentLocationId: string | null;
  currentSceneId: string | null;
  character: Character | null;
  inventory: InventoryItem[];
  quests: Quest[];
  npcs: NPC[];
  activeEnemies: Enemy[];
  decisions: Decision[];
  memories: Memory[];
  narrativeHistory: NarrativeMessage[];
  activeCombat: CombatState | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
}

// ─── AI Response Contract ────────────────────────────────────

export interface AISkillCheck {
  type: 'skill_check';
  action: string;
  // Widened to accept both generic CharacterAttributes keys and F&G FGAttributes keys.
  // The AI narrator may return F&G attribute names (forca, agilidade, etc.) for F&G sessions.
  attribute: keyof CharacterAttributes | string;
  difficulty: number;
  narrative: string;
}

export interface AICombatTrigger {
  type: 'combat_start';
  enemies: string[];
  narrative: string;
}

export interface AIWorldEvent {
  type: 'world_event';
  eventId: string;
  narrative: string;
}

export interface AIReward {
  type: 'give_reward';
  item?: string;
  gold?: number;
  experience?: number;
  narrative: string;
}

export interface AIMemoryUpdate {
  type: 'memory_update';
  content: string;
  importance: number;
}

export interface AINPCInteraction {
  type: 'npc_interaction';
  npcId: string;
  relationshipChange: number;
  narrative: string;
}

export interface AIResponse {
  narrative: string;
  suggestedActions?: string[];
  skillCheck?: AISkillCheck;
  combatTrigger?: AICombatTrigger;
  worldEvent?: AIWorldEvent;
  reward?: AIReward;
  memoryUpdate?: AIMemoryUpdate;
  npcInteraction?: AINPCInteraction;
}

// ─── Auth / Users ────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

// ─── Campaigns ───────────────────────────────────────────────

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface CampaignPlayer {
  id: string;
  campaignId: string;
  characterId: string;
  userId: string;
  startedAt: string;
  lastPlayedAt: string;
  isCompleted: boolean;
}
