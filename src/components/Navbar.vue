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
          WATCHFLIX
        </span>
      </div>

      <!-- Desktop Navigation Menu -->
      <nav class="hidden md:flex items-center gap-4 text-xs lg:text-sm font-medium text-neutral-300">
        <button 
          @click="$emit('nav', 'home')"
          class="hover:text-white transition"
          :class="{ 'text-white font-bold': activeTab === 'home' }"
        >
          Home
        </button>
        <button 
          @click="$emit('nav', 'series')"
          class="hover:text-white transition"
          :class="{ 'text-white font-bold': activeTab === 'series' }"
        >
          TV Shows
        </button>
        <button 
          @click="$emit('nav', 'movies')"
          class="hover:text-white transition"
          :class="{ 'text-white font-bold': activeTab === 'movies' }"
        >
          Movies
        </button>
        <button 
          @click="$emit('nav', 'watchlist')"
          class="hover:text-white transition"
          :class="{ 'text-white font-bold': activeTab === 'watchlist' }"
        >
          My List
        </button>
      </nav>
    </div>

    <!-- Right: Search, Admin & Profile Avatar -->
    <div class="flex items-center gap-3">
      <!-- Search Button -->
      <button 
        @click="$emit('open-search')"
        aria-label="Search"
        class="text-neutral-300 hover:text-white p-2 rounded-full hover:bg-neutral-800/60 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </button>

      <!-- Admin Stream Manager Shortcut -->
      <button 
        v-if="isAdmin"
        @click="$emit('open-admin')"
        title="Admin Streams Manager"
        class="hidden sm:flex items-center gap-1 text-xs bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 px-2.5 py-1 rounded-md font-semibold transition"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Add Stream</span>
      </button>

      <!-- Settings Button -->
      <button 
        @click="$emit('open-settings')"
        aria-label="Settings"
        class="text-neutral-300 hover:text-white p-2 rounded-full hover:bg-neutral-800/60 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>

      <!-- Profile Avatar Button -->
      <button 
        @click="$emit('open-profile')"
        class="flex items-center gap-2 p-0.5 rounded focus:outline-none"
      >
        <img 
          :src="userAvatar" 
          alt="User Profile" 
          class="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover border border-neutral-700 hover:border-red-600 transition"
        />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  activeTab?: string;
  isAdmin?: boolean;
  userAvatar?: string;
}>();

defineEmits<{
  (e: 'nav', tab: string): void;
  (e: 'open-search'): void;
  (e: 'open-settings'): void;
  (e: 'open-profile'): void;
  (e: 'open-admin'): void;
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
