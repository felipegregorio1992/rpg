import type {
  Character,
  CharacterAttributes,
  CharacterClass,
  CharacterRace,
} from '../../types';
import { supabase } from './client';

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface CreateCharacterData {
  name: string;
  class: CharacterClass;
  race: CharacterRace;
  background: string;
  personality: string;
  description: string;
  attributes: CharacterAttributes;
}

// ─── Row shapes returned from Supabase ────────────────────────

interface CharacterRow {
  id: string;
  user_id: string;
  name: string;
  class: CharacterClass;
  race: CharacterRace;
  level: number;
  experience: number;
  experience_to_next_level: number;
  current_hp: number;
  max_hp: number;
  current_mana: number;
  max_mana: number;
  current_energy: number;
  max_energy: number;
  gold: number;
  background: string;
  personality: string;
  description: string;
  created_at: string;
  updated_at: string;
  character_attributes: AttributeRow[];
}

interface AttributeRow {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  attack: number;
  defense: number;
  initiative: number;
  critical_chance: number;
}

function rowToCharacter(row: CharacterRow): Character {
  const attrs = row.character_attributes?.[0] ?? {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    attack: 0,
    defense: 0,
    initiative: 0,
    critical_chance: 5,
  };

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    class: row.class,
    race: row.race,
    level: row.level,
    experience: row.experience,
    experienceToNextLevel: row.experience_to_next_level,
    currentHp: row.current_hp,
    maxHp: row.max_hp,
    currentMana: row.current_mana,
    maxMana: row.max_mana,
    currentEnergy: row.current_energy,
    maxEnergy: row.max_energy,
    gold: row.gold,
    background: row.background,
    personality: row.personality,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attributes: {
      strength: attrs.strength,
      dexterity: attrs.dexterity,
      constitution: attrs.constitution,
      intelligence: attrs.intelligence,
      wisdom: attrs.wisdom,
      charisma: attrs.charisma,
    },
    modifiers: {
      attack: attrs.attack,
      defense: attrs.defense,
      initiative: attrs.initiative,
      criticalChance: attrs.critical_chance,
    },
  };
}

function computeMaxHp(constitution: number, level: number): number {
  const conMod = Math.floor((constitution - 10) / 2);
  return 10 + conMod * level + (level - 1) * 6;
}

function computeMaxMana(intelligence: number, level: number): number {
  const intMod = Math.floor((intelligence - 10) / 2);
  return 10 + intMod * level + (level - 1) * 4;
}

function xpForNextLevel(level: number): number {
  return level * 300;
}

// ─── Service functions ────────────────────────────────────────

export async function createCharacter(
  userId: string,
  characterData: CreateCharacterData,
): Promise<ServiceResult<Character>> {
  const { attributes } = characterData;
  const maxHp = computeMaxHp(attributes.constitution, 1);
  const maxMana = computeMaxMana(attributes.intelligence, 1);
  const strMod = Math.floor((attributes.strength - 10) / 2);
  const dexMod = Math.floor((attributes.dexterity - 10) / 2);

  const { data: charRow, error: charError } = await supabase
    .from('characters')
    .insert({
      user_id: userId,
      name: characterData.name,
      class: characterData.class,
      race: characterData.race,
      level: 1,
      experience: 0,
      experience_to_next_level: xpForNextLevel(1),
      current_hp: maxHp,
      max_hp: maxHp,
      current_mana: maxMana,
      max_mana: maxMana,
      current_energy: 100,
      max_energy: 100,
      gold: 50,
      background: characterData.background,
      personality: characterData.personality,
      description: characterData.description,
    })
    .select('id')
    .single();

  if (charError || !charRow) {
    return { data: null, error: charError?.message ?? 'Failed to create character' };
  }

  const characterId = (charRow as { id: string }).id;

  const { error: attrError } = await supabase.from('character_attributes').insert({
    character_id: characterId,
    strength: attributes.strength,
    dexterity: attributes.dexterity,
    constitution: attributes.constitution,
    intelligence: attributes.intelligence,
    wisdom: attributes.wisdom,
    charisma: attributes.charisma,
    attack: strMod,
    defense: dexMod,
    initiative: dexMod,
    critical_chance: 5,
  });

  if (attrError) {
    return { data: null, error: attrError.message };
  }

  return getCharacter(characterId);
}

export async function getCharacters(userId: string): Promise<ServiceResult<Character[]>> {
  const { data, error } = await supabase
    .from('characters')
    .select('*, character_attributes(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };

  const characters = (data as CharacterRow[]).map(rowToCharacter);
  return { data: characters, error: null };
}

export async function getCharacter(
  characterId: string,
): Promise<ServiceResult<Character>> {
  const { data, error } = await supabase
    .from('characters')
    .select('*, character_attributes(*)')
    .eq('id', characterId)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? 'Character not found' };
  }

  return { data: rowToCharacter(data as CharacterRow), error: null };
}

export async function updateCharacter(
  characterId: string,
  updates: Partial<Omit<Character, 'id' | 'userId' | 'createdAt' | 'attributes' | 'modifiers'>>,
): Promise<ServiceResult<Character>> {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.level !== undefined) dbUpdates.level = updates.level;
  if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
  if (updates.experienceToNextLevel !== undefined)
    dbUpdates.experience_to_next_level = updates.experienceToNextLevel;
  if (updates.currentHp !== undefined) dbUpdates.current_hp = updates.currentHp;
  if (updates.maxHp !== undefined) dbUpdates.max_hp = updates.maxHp;
  if (updates.currentMana !== undefined) dbUpdates.current_mana = updates.currentMana;
  if (updates.maxMana !== undefined) dbUpdates.max_mana = updates.maxMana;
  if (updates.currentEnergy !== undefined) dbUpdates.current_energy = updates.currentEnergy;
  if (updates.maxEnergy !== undefined) dbUpdates.max_energy = updates.maxEnergy;
  if (updates.gold !== undefined) dbUpdates.gold = updates.gold;
  if (updates.background !== undefined) dbUpdates.background = updates.background;
  if (updates.personality !== undefined) dbUpdates.personality = updates.personality;
  if (updates.description !== undefined) dbUpdates.description = updates.description;

  const { error } = await supabase
    .from('characters')
    .update(dbUpdates)
    .eq('id', characterId);

  if (error) return { data: null, error: error.message };

  return getCharacter(characterId);
}

export async function updateHp(
  characterId: string,
  newHp: number,
): Promise<ServiceResult<void>> {
  const { error } = await supabase
    .from('characters')
    .update({ current_hp: newHp })
    .eq('id', characterId);

  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function updateMana(
  characterId: string,
  newMana: number,
): Promise<ServiceResult<void>> {
  const { error } = await supabase
    .from('characters')
    .update({ current_mana: newMana })
    .eq('id', characterId);

  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function updateExperience(
  characterId: string,
  experience: number,
): Promise<ServiceResult<Character>> {
  // First fetch current character to check level-up
  const { data: current, error: fetchError } = await getCharacter(characterId);
  if (fetchError || !current) {
    return { data: null, error: fetchError ?? 'Character not found' };
  }

  const newExperience = current.experience + experience;
  let newLevel = current.level;
  let xpToNext = current.experienceToNextLevel;
  let remaining = newExperience;

  while (remaining >= xpToNext) {
    remaining -= xpToNext;
    newLevel += 1;
    xpToNext = xpForNextLevel(newLevel);
  }

  const newMaxHp = computeMaxHp(current.attributes.constitution, newLevel);
  const newMaxMana = computeMaxMana(current.attributes.intelligence, newLevel);

  const { error } = await supabase
    .from('characters')
    .update({
      experience: remaining,
      experience_to_next_level: xpToNext,
      level: newLevel,
      max_hp: newMaxHp,
      max_mana: newMaxMana,
    })
    .eq('id', characterId);

  if (error) return { data: null, error: error.message };

  return getCharacter(characterId);
}

export async function updateGold(
  characterId: string,
  gold: number,
): Promise<ServiceResult<void>> {
  const { error } = await supabase
    .from('characters')
    .update({ gold })
    .eq('id', characterId);

  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}
