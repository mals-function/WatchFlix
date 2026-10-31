<template>
  <div class="min-h-screen bg-[#141414] pt-20 pb-28 px-4 md:px-8 text-white max-w-2xl mx-auto select-none">
    <!-- Active Profile Card -->
    <div class="bg-[#181818] border border-neutral-800 rounded-2xl p-6 shadow-xl mb-6">
      <div class="flex items-center gap-4">
        <div class="relative">
          <img 
            :src="profilesStore.activeProfile.avatar" 
            :alt="profilesStore.activeProfile.name" 
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-red-600 shadow-md"
          />
          <button 
            @click="$emit('edit-current-profile')"
            class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center hover:bg-neutral-800 transition"
            title="Edit avatar"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold text-white truncate">
              {{ profilesStore.activeProfile.name }}
            </h1>
            <span 
              v-if="profilesStore.activeProfile.isKids"
              class="text-[10px] bg-amber-500 text-black font-black px-2 py-0.5 rounded uppercase"
            >
              Kids
            </span>
          </div>
          <p class="text-xs text-neutral-400 mt-1">
            Personal Account (Active Profile)
          </p>
        </div>
      </div>

      <!-- Quick Metrics for Active Profile -->
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

    <!-- Profile Management Actions -->
    <div class="space-y-3 mb-8">
      <!-- Switch Profile (Who's watching?) -->
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
            <div class="text-xs text-neutral-400">Choose between the 5 personal profiles</div>
          </div>
        </div>
        <span class="text-neutral-500 text-lg">›</span>
      </button>

      <!-- Manage 5 Profiles (Edit Names & Avatars) -->
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
            <div class="text-xs text-neutral-400">Edit profile names, avatars, and Kids modes</div>
          </div>
        </div>
        <span class="text-neutral-500 text-lg">›</span>
      </button>

      <!-- App Preferences (Region / Autoplay) -->
      <div class="p-4 bg-[#181818] border border-neutral-800 rounded-xl space-y-3">
        <div class="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
          Streaming Preferences
        </div>

        <div class="flex items-center justify-between">
          <span class="text-xs text-neutral-300">Streaming Availability Region</span>
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

        <div class="flex items-center justify-between pt-2 border-t border-neutral-800">
          <span class="text-xs text-neutral-300">Autoplay Trailers</span>
          <button 
            type="button" 
            @click="toggleAutoplay"
            class="w-10 h-5 flex items-center rounded-full p-0.5 transition"
            :class="[autoplay ? 'bg-red-600' : 'bg-neutral-700']"
          >
            <div 
              class="bg-white w-4 h-4 rounded-full shadow-md transform transition"
              :class="{ 'translate-x-5': autoplay }"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Separate Admin Gateway Lock Button at bottom -->
    <div class="pt-4 border-t border-neutral-800/80 text-center">
      <button 
        @click="$emit('open-admin-portal')"
        class="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-red-400 py-2 px-4 rounded-full border border-neutral-800 hover:border-red-900 bg-neutral-900/60 transition"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <span>Master Admin Control (PIN Protected)</span>
      </button>

      <p class="text-[11px] text-neutral-600 mt-2">
        WatchFlix Cross-Platform v1.0.0
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProfilesStore } from '../stores/profiles';
import { useWatchlistStore } from '../stores/watchlist';
import { useHistoryStore } from '../stores/history';
import { useSettingsStore } from '../stores/settings';

defineEmits<{
  (e: 'switch-profile'): void;
  (e: 'manage-profiles'): void;
  (e: 'edit-current-profile'): void;
  (e: 'open-admin-portal'): void;
}>();

const profilesStore = useProfilesStore();
const watchlistStore = useWatchlistStore();
const historyStore = useHistoryStore();
const settingsStore = useSettingsStore();

const selectedRegion = ref(settingsStore.region);
const autoplay = ref(settingsStore.autoplayTrailer);

const updateRegion = () => {
  settingsStore.setRegion(selectedRegion.value);
};

const toggleAutoplay = () => {
  autoplay.value = !autoplay.value;
  settingsStore.setAutoplay(autoplay.value);
};
</script>
