<template>
  <header 
    class="fixed top-0 left-0 right-0 z-40 transition-colors duration-300 px-4 md:px-8 py-3 flex items-center justify-between"
    :class="[isScrolled ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg border-b border-neutral-900' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent']"
  >
    <!-- Left: Brand Logo & Navigation -->
    <div class="flex items-center gap-6">
      <div 
        @click="$emit('nav', 'home')"
        class="cursor-pointer flex items-center gap-1.5 select-none"
      >
        <span class="text-2xl sm:text-3xl font-black text-red-600 tracking-tighter filter drop-shadow">
          STREAMFLIX
        </span>
      </div>

      <!-- Desktop Navigation Menu -->
      <nav class="hidden md:flex items-center gap-5 text-xs lg:text-sm font-semibold text-neutral-400">
        <button 
          @click="$emit('nav', 'home')"
          class="hover:text-white transition py-1"
          :class="{ 'text-white font-bold': activeTab === 'home' }"
        >
          Home
        </button>
        <button 
          @click="$emit('nav', 'movies')"
          class="hover:text-white transition py-1"
          :class="{ 'text-white font-bold': activeTab === 'movies' }"
        >
          Movies
        </button>
        <button 
          @click="$emit('nav', 'series')"
          class="hover:text-white transition py-1"
          :class="{ 'text-white font-bold': activeTab === 'series' }"
        >
          TV Series
        </button>
        <button 
          @click="$emit('nav', 'watchlist')"
          class="hover:text-white transition py-1"
          :class="{ 'text-white font-bold': activeTab === 'watchlist' }"
        >
          My List
        </button>
      </nav>
    </div>

    <!-- Right: Search & Profile Avatar -->
    <div class="flex items-center gap-3">
      <!-- Search Input for Desktop (Matches StreamFlix) -->
      <div 
        @click="$emit('open-search')" 
        class="hidden sm:flex items-center gap-2 bg-[#1c1c1c] hover:bg-[#252525] border border-neutral-800 rounded-lg px-3.5 py-1.5 cursor-pointer text-xs text-neutral-400 w-48 md:w-60 transition shadow-inner"
      >
        <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span class="select-none">Search titles...</span>
      </div>

      <!-- Mobile Search Icon -->
      <button 
        @click="$emit('open-search')"
        aria-label="Search"
        class="sm:hidden text-neutral-300 hover:text-white p-2 rounded-full hover:bg-neutral-800/60 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </button>

      <!-- Admin Quick Button -->
      <button 
        v-if="isAdmin"
        @click="$emit('open-admin-portal')"
        class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-300 bg-red-950/80 hover:bg-red-900 border border-red-700/80 px-2.5 py-1 rounded-md transition shadow"
        title="Admin Control Center"
      >
        <span>⚙️ Admin</span>
      </button>

      <!-- StreamFlix SF Profile Avatar Badge (Matches Screenshot) -->
      <div 
        @click="$emit('open-profile-switcher')"
        class="w-8 h-8 rounded-md bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center cursor-pointer shadow transition active:scale-95 select-none"
        title="Switch Profile"
      >
        SF
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  activeTab?: string;
  userAvatar?: string;
  profileName?: string;
  isAdmin?: boolean;
}>();

defineEmits<{
  (e: 'nav', tab: string): void;
  (e: 'open-search'): void;
  (e: 'open-profile-switcher'): void;
  (e: 'open-admin-portal'): void;
}>();

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
