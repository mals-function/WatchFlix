import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setTmdbApiKey, getTmdbApiKey } from '../services/tmdb';
import { setWatchmodeApiKey, getWatchmodeApiKey } from '../services/watchmode';
import { saveSupabaseConfig, getSupabaseConfig } from '../services/supabase';

export const useSettingsStore = defineStore('settings', () => {
  const tmdbKey = ref(getTmdbApiKey());
  const watchmodeKey = ref(getWatchmodeApiKey());
  const supabaseConfig = ref(getSupabaseConfig());
  const region = ref(localStorage.getItem('WATCHFLIX_REGION') || 'US');
  const autoplayTrailer = ref(localStorage.getItem('WATCHFLIX_AUTOPLAY') !== 'false');

  const updateTmdbKey = (key: string) => {
    tmdbKey.value = key;
    setTmdbApiKey(key);
  };

  const updateWatchmodeKey = (key: string) => {
    watchmodeKey.value = key;
    setWatchmodeApiKey(key);
  };

  const updateSupabase = (url: string, anonKey: string) => {
    saveSupabaseConfig(url, anonKey);
    supabaseConfig.value = getSupabaseConfig();
  };

  const setRegion = (newRegion: string) => {
    region.value = newRegion;
    localStorage.setItem('WATCHFLIX_REGION', newRegion);
  };

  const setAutoplay = (val: boolean) => {
    autoplayTrailer.value = val;
    localStorage.setItem('WATCHFLIX_AUTOPLAY', String(val));
  };

  return {
    tmdbKey,
    watchmodeKey,
    supabaseConfig,
    region,
    autoplayTrailer,
    updateTmdbKey,
    updateWatchmodeKey,
    updateSupabase,
    setRegion,
    setAutoplay,
  };
});
