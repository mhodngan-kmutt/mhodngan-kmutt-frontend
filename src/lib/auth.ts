import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Sign in using Google OAuth.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });

  if (error) {
    console.error('❌ Error signing in with Google:', error.message);
    throw error;
  }

  return data;
}

/**
 * Verifies if the logged-in user uses @mail.kmutt.ac.th
 * If not, signs out and redirects to /${lang}/unauthorized
 */
export async function verifyKmuttEmail(user: User | null, lang: string) {
  if (!user) return true;

  if (user.email && !user.email.toLowerCase().endsWith('@mail.kmutt.ac.th')) {
    console.warn('🚫 Unauthorized email:', user.email);
    await supabase.auth.signOut();
    window.location.href = `/${lang}/unauthorized`;
    return false;
  }

  return true;
}


export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('❌ Error signing out:', error.message);
    throw error;
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('❌ Error getting session:', error.message);
    throw error;
  }
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('❌ Error getting user:', error.message);
    throw error;
  }
  return data.user;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
