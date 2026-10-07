import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { User } from '../../types';
import { supabase } from './client';

export interface AuthResult<T> {
  data: T | null;
  error: string | null;
}

export async function signUp(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult<User>> {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return { data: null, error: error?.message ?? 'Sign up failed' };
  }

  // Insert profile row
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    username,
    email,
  });

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  const user: User = {
    id: data.user.id,
    email: data.user.email ?? email,
    username,
  };

  return { data: user, error: null };
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult<User>> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { data: null, error: error?.message ?? 'Sign in failed' };
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  const user: User = {
    id: data.user.id,
    email: data.user.email ?? email,
    username: (profile as { username: string; avatar_url?: string }).username,
    avatarUrl: (profile as { username: string; avatar_url?: string }).avatar_url,
  };

  return { data: user, error: null };
}

export async function signOut(): Promise<AuthResult<void>> {
  const { error } = await supabase.auth.signOut();
  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function getSession(): Promise<AuthResult<Session>> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    return { data: null, error: error?.message ?? 'No active session' };
  }
  return { data: data.session, error: null };
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function getCurrentUser(): Promise<AuthResult<User>> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { data: null, error: error?.message ?? 'Not authenticated' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  const user: User = {
    id: data.user.id,
    email: data.user.email ?? '',
    username: (profile as { username: string; avatar_url?: string }).username,
    avatarUrl: (profile as { username: string; avatar_url?: string }).avatar_url,
  };

  return { data: user, error: null };
}
