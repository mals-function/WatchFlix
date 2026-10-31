<template>
  <div class="w-full pt-20 pb-10 px-4 md:px-8 text-white max-w-2xl mx-auto select-none">
    <!-- Active Account & Profile Card -->
    <div class="bg-[#181818] border border-neutral-800 rounded-2xl p-6 shadow-xl mb-6">
      <div class="flex items-center gap-4">
        <div class="relative">
          <img 
            :src="userStore.user?.avatar_url || profilesStore.activeProfile.avatar" 
            :alt="userStore.user?.username || profilesStore.activeProfile.name" 
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 shadow-md"
            :class="[userStore.isAdmin ? 'border-red-600 ring-2 ring-red-600/40' : 'border-neutral-600']"
          />
          <span 
            v-if="userStore.isAdmin"
            class="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shadow"
          >
            Admin
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold text-white truncate capitalize">
              {{ userStore.user?.username }}
            </h1>
            <span 
              class="text-[10px] font-black px-2 py-0.5 rounded uppercase"
              :class="[
                userStore.isAdmin 
                  ? 'bg-red-950 text-red-300 border border-red-800' 
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
              ]"
            >
              {{ userStore.isAdmin ? 'Administrator' : 'Standard Member' }}
            </span>
          </div>
          <p class="text-xs text-neutral-400 mt-0.5">
            {{ userStore.user?.email }}
          </p>
          <div class="mt-2 text-[11px] font-medium" :class="[userStore.isAdmin ? 'text-red-400' : 'text-neutral-400']">
            {{ userStore.isAdmin ? '✓ Full Streaming & API Management' : '✓ Streaming & Watchlist Access' }}
          </div>
        </div>
      </div>

      <!-- Quick Stats for Current Profile -->
      <div class="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-neutral-800/80 text-center">
        <div class="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
          <div class="text-2xl font-black text-white">{{ watchlistStore.watchlist.length }}</div>
          <div class="text-xs text-neutral-400 font-medium mt-0.5">In My List</div>
        </div>
        <div class="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
          <div class="text-2xl font-black text-white">{{ historyStore.history.length }}</div>
          <div class="text-xs text-neutral-400 font-medium mt-0.5">Watched Titles</div>
        </div>
      </div>
    </div>

    <!-- Management Actions -->
    <div class="space-y-3 mb-8">
      <!-- 1. ADMIN ONLY: Configure APIs & Streams -->
      <div v-if="userStore.isAdmin" class="mb-4">
        <div class="text-xs font-bold uppercase tracking-wider text-red-500 mb-2 px-1">
          Admin Management
        </div>

        <button 
          @click="$emit('open-admin-portal')"
          class="w-full flex items-center justify-between p-4 bg-red-950/30 hover:bg-red-950/50 border border-red-700/60 rounded-xl transition text-left active:scale-[0.99] shadow-lg"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-red-600/30 text-red-400 flex items-center justify-center font-bold text-lg">
              ⚙️
            </div>
            <div>
              <div class="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Configure APIs & Cloud Keys</span>
                <span class="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-black">Admin</span>
              </div>
              <div class="text-xs text-neutral-400">Update TMDB token, Watchmode key, Supabase & streams</div>
            </div>
          </div>
          <span class="text-red-400 text-lg">›</span>
        </button>
      </div>

      <!-- 2. Profile Switcher (5 Profiles) -->
      <button 
        @click="$emit('switch-profile')"
        class="w-full flex items-center justify-between p-4 bg-[#181818] hover:bg-neutral-800/80 border border-neutral-800 rounded-xl transition text-left active:scale-[0.99]"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-neutral-800 text-neutral-200 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-white">Switch Profile</div>
            <div class="text-xs text-neutral-400">Choose between the 5 profiles</div>
          </div>
        </div>
        <span class="text-neutral-500 text-lg">›</span>
      </button>

      <!-- 3. Customize Profiles -->
      <button 
        @click="$emit('manage-profiles')"
        class="w-full flex items-center justify-between p-4 bg-[#181818] hover:bg-neutral-800/80 border border-neutral-800 rounded-xl transition text-left active:scale-[0.99]"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-neutral-800 text-neutral-200 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-white">Customize Profiles</div>
            <div class="text-xs text-neutral-400">Edit profile names, avatar icons, and Kids modes</div>
          </div>
        </div>
        <span class="text-neutral-500 text-lg">›</span>
      </button>

      <!-- 4. Streaming Region Preference -->
      <div class="p-4 bg-[#181818] border border-neutral-800 rounded-xl flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-white">Streaming Availability Region</div>
          <div class="text-[11px] text-neutral-400">Provider catalog region</div>
        </div>
        <select 
          v-model="selectedRegion" 
          @change="updateRegion"
          class="bg-neutral-900 border border-neutral-700 text-white text-xs rounded px-2.5 py-1 outline-none focus:border-red-600"
        >
          <option value="US">United States (US)</option>
          <option value="GB">United Kingdom (GB)</option>
          <option value="CA">Canada (CA)</option>
          <option value="AU">Australia (AU)</option>
          <option value="DE">Germany (DE)</option>
          <option value="FR">France (FR)</option>
          <option value="JP">Japan (JP)</option>
        </select>
      </div>

      <!-- 5. Switch Account Button -->
      <button 
        @click="$emit('switch-account')"
        class="w-full flex items-center justify-between p-4 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 rounded-xl transition text-left active:scale-[0.99] mt-6"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-neutral-800 text-red-500 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-white">Switch Account</div>
            <div class="text-xs text-neutral-400">Sign in with your 5MWatchStream credentials</div>
          </div>
        </div>
        <span class="text-neutral-300 text-xs font-semibold px-2.5 py-1 bg-neutral-800 rounded-lg border border-neutral-700">
          Sign In
        </span>
      </button>

      <!-- 6. Sign Out Button -->
      <button 
        v-if="userStore.isAuthenticated"
        @click="handleSignOut"
        class="w-full flex items-center justify-between p-4 bg-neutral-900/60 hover:bg-red-950/30 border border-neutral-800 hover:border-red-900/50 rounded-xl transition text-left active:scale-[0.99] mt-3"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-950/50 text-red-400 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-white">Sign Out</div>
            <div class="text-xs text-neutral-400">Log out of active session</div>
          </div>
        </div>
        <span class="text-red-400 text-xs font-semibold px-2.5 py-1 bg-red-950/60 rounded-lg border border-red-900/40">
          Sign Out
        </span>
      </button>
    </div>

    <div class="text-center text-xs text-neutral-400 space-y-1 pt-6 pb-6">
      <p class="font-bold text-neutral-300">5MWatchStream (Powerded by TMDB)</p>
      <p class="text-neutral-500 font-medium">Created by: MBA</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/user';
import { useProfilesStore } from '../stores/profiles';
import { useWatchlistStore } from '../stores/watchlist';
import { useHistoryStore } from '../stores/history';
import { useSettingsStore } from '../stores/settings';

const emit = defineEmits<{
  (e: 'switch-profile'): void;
  (e: 'manage-profiles'): void;
  (e: 'edit-current-profile'): void;
  (e: 'open-admin-portal'): void;
  (e: 'switch-account'): void;
}>();

const userStore = useUserStore();
const profilesStore = useProfilesStore();
const watchlistStore = useWatchlistStore();
const historyStore = useHistoryStore();
const settingsStore = useSettingsStore();

const selectedRegion = ref(settingsStore.region);

const updateRegion = () => {
  settingsStore.setRegion(selectedRegion.value);
};

const handleSignOut = () => {
  userStore.logout();
  emit('switch-account');
};
</script>
