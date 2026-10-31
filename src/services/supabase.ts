import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EMBEDDED_CONFIG } from '../config/appConfig';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const url = localStorage.getItem('WATCHFLIX_ADMIN_SUPABASE_URL') || (import.meta as any).env?.VITE_SUPABASE_URL || EMBEDDED_CONFIG.SUPABASE_URL;
  const anonKey = localStorage.getItem('WATCHFLIX_ADMIN_SUPABASE_ANON_KEY') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || EMBEDDED_CONFIG.SUPABASE_ANON_KEY;
  return { 
    url, 
    anonKey, 
    isConfigured: Boolean(url && anonKey && !anonKey.includes('mock_key')) 
  };
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
    console.warn('Supabase initialization fallback:', error);
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

export const saveAdminSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('WATCHFLIX_ADMIN_SUPABASE_URL', url.trim());
  localStorage.setItem('WATCHFLIX_ADMIN_SUPABASE_ANON_KEY', anonKey.trim());
  return initSupabase();
};
