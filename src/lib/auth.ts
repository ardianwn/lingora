import type { AuthResponse, Session, User } from '@supabase/supabase-js';

import { supabase } from './supabase';

export type AuthResult = {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
};

export async function signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut(): Promise<{ error: Error | null }> {
  return supabase.auth.signOut();
}

export async function getCurrentSession(): Promise<{
  session: Session | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}
