import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setTmdbApiKey, getTmdbApiKey } from '../services/tmdb';
import { setWatchmodeApiKey, getWatchmodeApiKey } from '../services/watchmode';
import { saveAdminSupabaseConfig, getSupabaseConfig } from '../services/supabase';
import { EMBEDDED_CONFIG } from '../config/appConfig';

export const useSettingsStore = defineStore('settings', () => {
  const tmdbKey = ref(getTmdbApiKey());
  const watchmodeKey = ref(getWatchmodeApiKey());
  const supabaseConfig = ref(getSupabaseConfig());
  const region = ref(localStorage.getItem('WATCHFLIX_REGION') || EMBEDDED_CONFIG.DEFAULT_REGION);
  const autoplayTrailer = ref(localStorage.getItem('WATCHFLIX_AUTOPLAY') !== 'false');

  // Admin access state
  const isAdminUnlocked = ref(false);
  const adminPin = ref(localStorage.getItem('WATCHFLIX_ADMIN_PIN') || EMBEDDED_CONFIG.ADMIN_PIN);

  const unlockAdmin = (enteredPin: string): boolean => {
    if (enteredPin.trim() === adminPin.value.trim()) {
      isAdminUnlocked.value = true;
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    isAdminUnlocked.value = false;
  };

  const updateAdminPin = (newPin: string) => {
    if (newPin.trim().length >= 4) {
      adminPin.value = newPin.trim();
      localStorage.setItem('WATCHFLIX_ADMIN_PIN', newPin.trim());
      return true;
    }
    return false;
  };

  const updateTmdbKey = (key: string) => {
    tmdbKey.value = key;
    setTmdbApiKey(key);
  };

  const updateWatchmodeKey = (key: string) => {
    watchmodeKey.value = key;
    setWatchmodeApiKey(key);
  };

  const updateSupabase = (url: string, anonKey: string) => {
    saveAdminSupabaseConfig(url, anonKey);
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
    isAdminUnlocked,
    adminPin,
    unlockAdmin,
    lockAdmin,
    updateAdminPin,
    updateTmdbKey,
    updateWatchmodeKey,
    updateSupabase,
    setRegion,
    setAutoplay,
  };
});
