<template>
  <div v-if="media" class="relative w-full h-[65vh] sm:h-[75vh] max-h-[750px] overflow-hidden select-none">
    <!-- Backdrop Image -->
    <div class="absolute inset-0">
      <img 
        :src="backdropUrl" 
        :alt="title" 
        class="w-full h-full object-cover object-top filter brightness-90 transform scale-105 transition duration-1000"
      />
      <!-- Netflix signature gradients -->
      <div class="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent w-full md:w-2/3"></div>
      <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#141414] to-transparent"></div>
    </div>

    <!-- Hero Content -->
    <div class="absolute bottom-10 left-0 right-0 px-4 md:px-8 max-w-3xl z-10">
      <!-- Netflix Series / Film badge -->
      <div class="flex items-center gap-2 mb-2">
        <span class="text-red-600 font-black tracking-widest text-sm flex items-center gap-1">
          <span class="text-xl">N</span>
          <span class="tracking-[0.2em] uppercase text-xs font-bold text-neutral-300">
            {{ media.media_type === 'tv' ? 'SERIES' : 'FILM' }}
          </span>
        </span>
        <span v-if="media.vote_average" class="bg-black/60 backdrop-blur-sm text-green-400 text-xs font-bold px-2 py-0.5 rounded border border-neutral-700/60">
          {{ Math.round(media.vote_average * 10) }}% Match
        </span>
        <span class="text-xs text-neutral-400 font-medium">{{ releaseYear }}</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md line-clamp-2">
        {{ title }}
      </h1>

      <!-- Overview -->
      <p class="mt-3 text-sm md:text-base text-neutral-300 line-clamp-3 max-w-xl drop-shadow font-normal leading-relaxed">
        {{ media.overview }}
      </p>

      <!-- Action Buttons -->
      <div class="mt-5 flex items-center gap-3">
        <!-- Play Button -->
        <button 
          @click="$emit('play', media)"
          class="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-bold px-6 py-2.5 rounded-md shadow-lg transition active:scale-95"
        >
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span class="text-sm md:text-base">Play</span>
        </button>

        <!-- More Info Button -->
        <button 
          @click="$emit('detail', media)"
          class="flex items-center gap-2 bg-neutral-700/80 hover:bg-neutral-700 text-white font-semibold px-5 py-2.5 rounded-md backdrop-blur shadow-md transition active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4m0-4h.01"/>
          </svg>
          <span class="text-sm md:text-base">More Info</span>
        </button>

        <!-- Watchlist Button -->
        <button 
          @click="$emit('toggle-watchlist', media)"
          class="w-10 h-10 rounded-full border border-neutral-500/80 bg-neutral-900/60 hover:bg-neutral-800 text-white flex items-center justify-center transition active:scale-95"
          :title="inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'"
        >
          <svg v-if="inWatchlist" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Loading Skeleton Banner if media is pending -->
  <div v-else class="relative w-full h-[65vh] sm:h-[75vh] max-h-[750px] overflow-hidden bg-neutral-900 animate-pulse flex items-end p-6 md:p-10">
    <div class="space-y-4 max-w-xl w-full">
      <div class="h-5 w-28 bg-neutral-800 rounded"></div>
      <div class="h-10 md:h-14 w-3/4 bg-neutral-800 rounded"></div>
      <div class="h-4 w-full bg-neutral-800 rounded"></div>
      <div class="h-4 w-4/5 bg-neutral-800 rounded"></div>
      <div class="flex gap-3 pt-3">
        <div class="h-11 w-28 bg-neutral-800 rounded-md"></div>
        <div class="h-11 w-32 bg-neutral-800 rounded-md"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MediaItem } from '../types';
import { TMDB_IMAGE_BASE } from '../services/tmdb';

const props = defineProps<{
  media: MediaItem | null;
  inWatchlist?: boolean;
}>();

defineEmits<{
  (e: 'play', media: MediaItem): void;
  (e: 'detail', media: MediaItem): void;
  (e: 'toggle-watchlist', media: MediaItem): void;
}>();

const title = computed(() => {
  return props.media?.title || props.media?.name || '';
});

const releaseYear = computed(() => {
  const d = props.media?.release_date || props.media?.first_air_date;
  return d ? d.substring(0, 4) : '';
});

const backdropUrl = computed(() => {
  const path = props.media?.backdrop_path || props.media?.poster_path;
  if (!path) return 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1600&auto=format&fit=crop&q=80';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/original${path}`;
});
</script>
