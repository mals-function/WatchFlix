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

    <!-- Right: Search & Profile Avatar -->
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

      <!-- Active Profile Button (Click switches profile or navigates to Profile) -->
      <button 
        @click="$emit('open-profile-switcher')"
        class="flex items-center gap-2 p-0.5 rounded focus:outline-none group"
        title="Switch Profile"
      >
        <img 
          :src="userAvatar" 
          alt="Active Profile" 
          class="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover border border-neutral-700 group-hover:border-red-600 transition"
        />
        <span class="hidden sm:inline text-xs font-semibold text-neutral-300 group-hover:text-white max-w-[80px] truncate">
          {{ profileName }}
        </span>
        <svg class="w-3.5 h-3.5 text-neutral-400 group-hover:text-white hidden sm:block transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  activeTab?: string;
  userAvatar?: string;
  profileName?: string;
}>();

defineEmits<{
  (e: 'nav', tab: string): void;
  (e: 'open-search'): void;
  (e: 'open-profile-switcher'): void;
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
