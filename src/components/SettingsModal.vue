<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-lg bg-[#181818] rounded-xl border border-neutral-800 text-white p-6 shadow-2xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">App & API Settings</h3>
            <p class="text-xs text-neutral-400">Configure catalog, streaming & Supabase cloud</p>
          </div>
        </div>

        <button 
          @click="$emit('close')"
          aria-label="Close"
          class="text-neutral-400 hover:text-white p-1 rounded-full transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Settings Form -->
      <div class="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <!-- TMDB API Key -->
        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
            <span>TMDB API Key (v3 auth)</span>
            <span class="text-[10px] text-green-400 font-normal">Active (Pre-configured)</span>
          </label>
          <input 
            v-model="tmdbKey" 
            type="text" 
            placeholder="TMDB 32-character API key"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
          />
          <p class="text-[11px] text-neutral-500 mt-1">
            Powers movies, series catalog, posters, and JustWatch streaming data.
          </p>
        </div>

        <!-- Watchmode API Key -->
        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
            <span>Watchmode API Key (Optional)</span>
            <a href="https://api.watchmode.com" target="_blank" class="text-[10px] text-red-400 hover:underline">Get Key</a>
          </label>
          <input 
            v-model="watchmodeKey" 
            type="text" 
            placeholder="Watchmode API key"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
          />
          <p class="text-[11px] text-neutral-500 mt-1">
            Enables enhanced streaming availability and direct platform deep links.
          </p>
        </div>

        <!-- Supabase Project Configuration -->
        <div class="pt-2 border-t border-neutral-800">
          <h4 class="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">
            Supabase Cloud Database & Auth
          </h4>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-neutral-300 mb-1">
                Supabase Project URL
              </label>
              <input 
                v-model="supabaseUrl" 
                type="text" 
                placeholder="https://xyzcompany.supabase.co"
                class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-neutral-300 mb-1">
                Supabase Anon Public Key
              </label>
              <input 
                v-model="supabaseAnonKey" 
                type="password" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
          <p class="text-[11px] text-neutral-500 mt-1.5">
            Synchronizes watchlists, favorites, and watch history across all devices. Leave empty to use offline local storage.
          </p>
        </div>

        <!-- Streaming Region -->
        <div class="pt-2 border-t border-neutral-800">
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            Streaming Availability Region
          </label>
          <select 
            v-model="selectedRegion" 
            class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
          >
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="CA">Canada (CA)</option>
            <option value="AU">Australia (AU)</option>
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="JP">Japan (JP)</option>
            <option value="IN">India (IN)</option>
          </select>
        </div>

        <!-- Success notification -->
        <div v-if="savedAlert" class="p-2 rounded bg-green-950 border border-green-700 text-xs text-green-300">
          Settings saved successfully!
        </div>

        <!-- Actions -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
          <button 
            type="button" 
            @click="$emit('close')"
            class="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button 
            type="button" 
            @click="saveSettings"
            class="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '../stores/settings';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const settingsStore = useSettingsStore();

const tmdbKey = ref(settingsStore.tmdbKey);
const watchmodeKey = ref(settingsStore.watchmodeKey);
const supabaseUrl = ref(settingsStore.supabaseConfig.url);
const supabaseAnonKey = ref(settingsStore.supabaseConfig.anonKey);
const selectedRegion = ref(settingsStore.region);
const savedAlert = ref(false);

const saveSettings = () => {
  settingsStore.updateTmdbKey(tmdbKey.value);
  settingsStore.updateWatchmodeKey(watchmodeKey.value);
  settingsStore.updateSupabase(supabaseUrl.value, supabaseAnonKey.value);
  settingsStore.setRegion(selectedRegion.value);
  
  savedAlert.value = true;
  setTimeout(() => {
    savedAlert.value = false;
    emit('close');
  }, 800);
};
</script>
