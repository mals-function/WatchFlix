<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none"
    @click.self="handleClose"
  >
    <!-- PIN Entry Screen if not unlocked -->
    <div 
      v-if="!settingsStore.isAdminUnlocked" 
      class="relative w-full max-w-sm bg-[#181818] rounded-2xl border border-neutral-800 text-white p-6 shadow-2xl text-center"
    >
      <button 
        @click="handleClose"
        aria-label="Close"
        class="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="w-12 h-12 rounded-full bg-red-600/20 text-red-500 mx-auto flex items-center justify-center mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </div>

      <h2 class="text-xl font-black text-white tracking-tight">Admin Gateway</h2>
      <p class="text-xs text-neutral-400 mt-1 mb-5">
        Enter the 4-digit master Admin PIN to access backend APIs & stream controls. (Default: 8888)
      </p>

      <form @submit.prevent="verifyPin" class="space-y-4">
        <div>
          <input 
            v-model="inputPin" 
            type="password" 
            maxlength="8" 
            placeholder="••••"
            class="w-36 mx-auto bg-neutral-900 border border-neutral-700 text-center text-xl tracking-[0.5em] font-mono text-white rounded-lg py-2 focus:outline-none focus:border-red-600"
            autofocus
          />
        </div>

        <div v-if="pinError" class="text-xs text-red-400 font-semibold">
          Incorrect PIN. Default is 8888.
        </div>

        <button 
          type="submit" 
          class="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg"
        >
          Unlock Admin Portal
        </button>
      </form>
    </div>

    <!-- Main Admin Dashboard when unlocked -->
    <div 
      v-else 
      class="relative w-full max-w-2xl bg-[#181818] rounded-2xl border border-neutral-800 text-white p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar"
    >
      <!-- Header Bar -->
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black">
            A
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-white tracking-wide">
              Master Admin Control Center
            </h2>
            <div class="flex items-center gap-2 text-[11px] text-green-400">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Authenticated & Secure</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="settingsStore.lockAdmin"
            class="text-xs text-neutral-400 hover:text-white bg-neutral-800 px-2.5 py-1.5 rounded transition"
            title="Lock Admin Portal"
          >
            Lock
          </button>
          <button 
            @click="handleClose"
            aria-label="Close"
            class="text-neutral-400 hover:text-white p-1 rounded-full transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Admin Tabs Navigation -->
      <div class="flex items-center gap-2 my-4 border-b border-neutral-800/80 pb-2">
        <button 
          v-for="tab in adminTabs" 
          :key="tab.id"
          @click="activeAdminTab = tab.id"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
          :class="[activeAdminTab === tab.id ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800']"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab 1: API Configuration -->
      <div v-if="activeAdminTab === 'apis'" class="space-y-4">
        <!-- TMDB API Key -->
        <div class="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-bold text-white flex items-center gap-1.5">
              <span>TMDB API Key (v3)</span>
              <span class="text-[10px] bg-green-950 text-green-300 px-1.5 py-0.2 rounded border border-green-800">Pre-Embedded</span>
            </label>
            <button 
              @click="testTmdb"
              class="text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              Test Connection
            </button>
          </div>
          <input 
            v-model="editTmdbKey" 
            type="text" 
            class="w-full bg-black/60 border border-neutral-700 rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-600"
          />
          <p class="text-[11px] text-neutral-400 mt-1">
            Powers movie & series catalog, posters, ratings, and JustWatch streaming availability.
          </p>
          <div v-if="tmdbStatus" class="mt-2 text-xs font-medium" :class="[tmdbStatus.success ? 'text-green-400' : 'text-red-400']">
            {{ tmdbStatus.message }}
          </div>
        </div>

        <!-- Watchmode API Key -->
        <div class="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Watchmode API Key</span>
              <span class="text-[10px] text-neutral-400 font-normal">Optional</span>
            </label>
            <a href="https://api.watchmode.com" target="_blank" class="text-[11px] text-red-400 hover:underline">Get Key</a>
          </div>
          <input 
            v-model="editWatchmodeKey" 
            type="text" 
            placeholder="Paste Watchmode API Key if available"
            class="w-full bg-black/60 border border-neutral-700 rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-600"
          />
          <p class="text-[11px] text-neutral-400 mt-1">
            Enables enhanced streaming availability and provider deep links.
          </p>
        </div>

        <!-- Supabase Cloud Credentials -->
        <div class="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Supabase Cloud Database & Auth</span>
              <span class="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-800">Embedded Defaults</span>
            </label>
            <a href="https://supabase.com" target="_blank" class="text-[11px] text-red-400 hover:underline">Supabase Portal</a>
          </div>

          <div class="space-y-2.5">
            <div>
              <span class="text-[11px] text-neutral-400 block mb-0.5">Project URL:</span>
              <input 
                v-model="editSupabaseUrl" 
                type="text" 
                placeholder="https://xyz.supabase.co"
                class="w-full bg-black/60 border border-neutral-700 rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <span class="text-[11px] text-neutral-400 block mb-0.5">Anon Public Key:</span>
              <input 
                v-model="editSupabaseAnonKey" 
                type="password" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                class="w-full bg-black/60 border border-neutral-700 rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-2">
            If left as embedded defaults, the app seamlessly runs using lightning-fast local SQLite/LocalStorage per profile.
          </p>
        </div>

        <!-- Save Button for API Keys -->
        <div class="flex items-center justify-between pt-2">
          <span v-if="saveAlert" class="text-xs text-green-400 font-bold">
            ✓ Settings successfully saved!
          </span>
          <span v-else></span>

          <button 
            @click="saveApiSettings"
            class="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition"
          >
            Save API Configuration
          </button>
        </div>
      </div>

      <!-- Tab 2: Custom Streams Manager -->
      <div v-else-if="activeAdminTab === 'streams'" class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-neutral-300">
            Active Video Streams ({{ customStreamsStore.streams.length }})
          </span>
          <button 
            @click="$emit('open-add-stream')"
            class="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-md shadow transition"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Add Custom Stream</span>
          </button>
        </div>

        <!-- List of configured custom streams -->
        <div class="space-y-2.5">
          <div 
            v-for="stream in customStreamsStore.streams" 
            :key="stream.id"
            class="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between"
          >
            <div class="min-w-0 flex-1 pr-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white truncate">{{ stream.title }}</span>
                <span class="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded uppercase font-bold">
                  {{ stream.stream_type }}
                </span>
                <span class="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                  {{ stream.quality_label }}
                </span>
              </div>
              <p class="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                {{ stream.stream_url }}
              </p>
            </div>

            <button 
              @click="customStreamsStore.removeStream(stream.id)"
              class="text-neutral-500 hover:text-red-400 p-1.5 transition"
              title="Delete stream"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 3: Security & Master PIN -->
      <div v-else-if="activeAdminTab === 'security'" class="space-y-4">
        <div class="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
          <h3 class="text-xs font-bold text-white mb-2">Change Master Admin PIN</h3>
          <p class="text-xs text-neutral-400 mb-3">
            Change the 4-digit master PIN required to open this Admin Control Center.
          </p>

          <div class="flex items-center gap-3">
            <input 
              v-model="newPin" 
              type="password" 
              maxlength="8" 
              placeholder="New PIN (min 4 digits)"
              class="bg-black/60 border border-neutral-700 rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-600 w-44"
            />
            <button 
              @click="handleChangePin"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow transition"
            >
              Update PIN
            </button>
          </div>
          <div v-if="pinUpdateMessage" class="mt-2 text-xs" :class="[pinUpdateSuccess ? 'text-green-400' : 'text-red-400']">
            {{ pinUpdateMessage }}
          </div>
        </div>

        <div class="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-white">Reset Embedded Defaults</div>
            <div class="text-[11px] text-neutral-400">Restore default TMDB key and initial configurations</div>
          </div>
          <button 
            @click="resetDefaults"
            class="text-xs bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-300 border border-neutral-700 px-3 py-1.5 rounded transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useCustomStreamsStore } from '../stores/customStreams';
import { EMBEDDED_CONFIG } from '../config/appConfig';
import { tmdbService } from '../services/tmdb';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'open-add-stream'): void;
}>();

const settingsStore = useSettingsStore();
const customStreamsStore = useCustomStreamsStore();

const inputPin = ref('');
const pinError = ref(false);

const activeAdminTab = ref<'apis' | 'streams' | 'security'>('apis');
const adminTabs: { id: 'apis' | 'streams' | 'security'; name: string }[] = [
  { id: 'apis', name: 'APIs & Cloud Database' },
  { id: 'streams', name: 'Stream Sources' },
  { id: 'security', name: 'Admin Security' },
];

const editTmdbKey = ref(settingsStore.tmdbKey);
const editWatchmodeKey = ref(settingsStore.watchmodeKey);
const editSupabaseUrl = ref(settingsStore.supabaseConfig.url);
const editSupabaseAnonKey = ref(settingsStore.supabaseConfig.anonKey);
const saveAlert = ref(false);
const tmdbStatus = ref<{ success: boolean; message: string } | null>(null);

const newPin = ref('');
const pinUpdateMessage = ref('');
const pinUpdateSuccess = ref(false);

const verifyPin = () => {
  if (settingsStore.unlockAdmin(inputPin.value)) {
    pinError.value = false;
    inputPin.value = '';
  } else {
    pinError.value = true;
  }
};

const handleClose = () => {
  inputPin.value = '';
  pinError.value = false;
  emit('close');
};

const saveApiSettings = () => {
  settingsStore.updateTmdbKey(editTmdbKey.value);
  settingsStore.updateWatchmodeKey(editWatchmodeKey.value);
  settingsStore.updateSupabase(editSupabaseUrl.value, editSupabaseAnonKey.value);
  
  saveAlert.value = true;
  setTimeout(() => {
    saveAlert.value = false;
  }, 2500);
};

const testTmdb = async () => {
  tmdbStatus.value = { success: true, message: 'Testing TMDB connection...' };
  const items = await tmdbService.getTrending('movie', 'day');
  if (items && items.length > 0) {
    tmdbStatus.value = { success: true, message: `✓ TMDB API connection verified! (${items.length} titles fetched)` };
  } else {
    tmdbStatus.value = { success: false, message: '✕ Failed to fetch from TMDB with this key.' };
  }
};

const handleChangePin = () => {
  if (newPin.value.length < 4) {
    pinUpdateSuccess.value = false;
    pinUpdateMessage.value = 'PIN must be at least 4 digits.';
    return;
  }
  settingsStore.updateAdminPin(newPin.value);
  pinUpdateSuccess.value = true;
  pinUpdateMessage.value = '✓ Master Admin PIN updated successfully!';
  newPin.value = '';
  setTimeout(() => {
    pinUpdateMessage.value = '';
  }, 3000);
};

const resetDefaults = () => {
  if (confirm('Reset API keys to embedded defaults?')) {
    editTmdbKey.value = EMBEDDED_CONFIG.TMDB_API_KEY;
    editWatchmodeKey.value = EMBEDDED_CONFIG.WATCHMODE_API_KEY;
    editSupabaseUrl.value = EMBEDDED_CONFIG.SUPABASE_URL;
    editSupabaseAnonKey.value = EMBEDDED_CONFIG.SUPABASE_ANON_KEY;
    saveApiSettings();
  }
};
</script>
