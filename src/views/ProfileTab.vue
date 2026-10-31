<template>
  <div class="min-h-screen bg-[#141414] pt-20 pb-24 px-4 md:px-8 text-white max-w-2xl mx-auto">
    <!-- Profile Card -->
    <div class="bg-[#181818] border border-neutral-800 rounded-2xl p-6 shadow-xl mb-6">
      <div class="flex items-center gap-4">
        <img 
          :src="userAvatar" 
          alt="Avatar" 
          class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-red-600 shadow-md"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-bold text-white truncate">
              {{ userName }}
            </h1>
            <span 
              v-if="userStore.isGuest" 
              class="text-[10px] bg-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded border border-neutral-700 uppercase"
            >
              Guest Mode
            </span>
            <span 
              v-else 
              class="text-[10px] bg-green-950 text-green-300 font-bold px-2 py-0.5 rounded border border-green-700 uppercase"
            >
              Cloud Synced
            </span>
          </div>
          <p class="text-xs text-neutral-400 mt-0.5 truncate">
            {{ userEmail }}
          </p>
          <div class="mt-2.5 flex items-center gap-2">
            <span class="text-xs bg-red-600/20 text-red-400 border border-red-600/40 font-semibold px-2 py-0.5 rounded">
              WatchFlix Ultra Pass
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-neutral-800/80 text-center">
        <div class="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
          <div class="text-xl font-black text-white">{{ watchlistStore.watchlist.length }}</div>
          <div class="text-[11px] text-neutral-400 font-medium mt-0.5">My List</div>
        </div>
        <div class="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
          <div class="text-xl font-black text-white">{{ historyStore.history.length }}</div>
          <div class="text-[11px] text-neutral-400 font-medium mt-0.5">Watched</div>
        </div>
        <div class="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
          <div class="text-xl font-black text-white">{{ customStreamsStore.streams.length }}</div>
          <div class="text-[11px] text-neutral-400 font-medium mt-0.5">Custom Streams</div>
        </div>
      </div>
    </div>

    <!-- Management Action Menu -->
    <div class="space-y-3">
      <!-- Admin Stream Manager -->
      <button 
        @click="$emit('open-admin')"
        class="w-full flex items-center justify-between p-4 bg-[#181818] hover:bg-neutral-800/80 border border-neutral-800 rounded-xl transition text-left"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-white">Stream Source Manager</div>
            <div class="text-xs text-neutral-400">Add or manage authorized HLS (.m3u8) / MP4 streams</div>
          </div>
        </div>
        <span class="text-neutral-500 text-lg">›</span>
      </button>

      <!-- App & API Settings -->
      <button 
        @click="$emit('open-settings')"
        class="w-full flex items-center justify-between p-4 bg-[#181818] hover:bg-neutral-800/80 border border-neutral-800 rounded-xl transition text-left"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-white">API Keys & Cloud Database</div>
            <div class="text-xs text-neutral-400">Configure TMDB, Watchmode, and Supabase keys</div>
          </div>
        </div>
        <span class="text-neutral-500 text-lg">›</span>
      </button>

      <!-- Supabase Auth / Account Connection -->
      <button 
        v-if="userStore.isGuest"
        @click="$emit('open-auth')"
        class="w-full flex items-center justify-between p-4 bg-[#181818] hover:bg-neutral-800/80 border border-neutral-800 rounded-xl transition text-left"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-950/80 text-green-400 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-white">Sign In with Supabase</div>
            <div class="text-xs text-neutral-400">Sync your watchlist across devices</div>
          </div>
        </div>
        <span class="text-neutral-500 text-lg">›</span>
      </button>

      <!-- Sign Out / Switch User -->
      <button 
        v-else
        @click="userStore.signOut"
        class="w-full p-3.5 bg-neutral-900 hover:bg-red-950/60 text-red-400 border border-neutral-800 hover:border-red-800/60 rounded-xl font-bold text-xs transition"
      >
        Sign Out from Cloud Account
      </button>
    </div>

    <!-- App Info Footer -->
    <div class="mt-12 text-center text-xs text-neutral-500 space-y-1">
      <p class="font-semibold text-neutral-400">WatchFlix v1.0.0 (Capacitor + Ionic Vue)</p>
      <p>Data provided by TMDB, Watchmode, and TVmaze.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '../stores/user';
import { useWatchlistStore } from '../stores/watchlist';
import { useHistoryStore } from '../stores/history';
import { useCustomStreamsStore } from '../stores/customStreams';

defineEmits<{
  (e: 'open-admin'): void;
  (e: 'open-settings'): void;
  (e: 'open-auth'): void;
}>();

const userStore = useUserStore();
const watchlistStore = useWatchlistStore();
const historyStore = useHistoryStore();
const customStreamsStore = useCustomStreamsStore();

const userName = computed(() => userStore.user?.username || 'WatchFlix Member');
const userEmail = computed(() => userStore.user?.email || 'guest@watchflix.local');
const userAvatar = computed(() => userStore.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80');
</script>
