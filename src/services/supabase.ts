import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / fallback keys or read from localStorage / .env
const getEnv = (key: string, fallback: string = '') => {
  return (import.meta as any).env?.[key] || localStorage.getItem(key) || fallback;
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const url = localStorage.getItem('WATCHFLIX_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL', '');
  const anonKey = localStorage.getItem('WATCHFLIX_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY', '');
  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

export const initSupabase = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    supabaseInstance = null;
    return null;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    supabaseInstance = null;
    return null;
  }
};

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    return initSupabase();
  }
  return supabaseInstance;
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('WATCHFLIX_SUPABASE_URL', url.trim());
  localStorage.setItem('WATCHFLIX_SUPABASE_ANON_KEY', anonKey.trim());
  return initSupabase();
};
