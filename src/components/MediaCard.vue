<template>
  <div 
    class="group relative flex-none cursor-pointer transition-transform duration-200 ease-out hover:scale-105 active:scale-95 select-none snap-start touch-manipulation"
    :class="[isWide ? 'w-52 sm:w-64' : 'w-28 sm:w-36 md:w-44']"
    @click="$emit('select', media)"
  >
    <div class="relative overflow-hidden rounded-md bg-neutral-900 shadow-lg aspect-[2/3] border border-neutral-800/80 group-hover:border-red-600/60 transition-colors">
      <!-- Media Poster -->
      <img 
        v-if="posterUrl"
        :src="posterUrl" 
        :alt="title" 
        loading="lazy"
        class="h-full w-full object-cover transition-opacity duration-300"
        @error="handleImgError"
      />
      <div v-else class="h-full w-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-neutral-900 to-neutral-800">
        <span class="text-red-600 text-2xl font-black mb-1">W</span>
        <span class="text-xs text-neutral-400 font-medium line-clamp-2">{{ title }}</span>
      </div>

      <!-- Top 10 Badge or Rating Badge -->
      <div class="absolute top-2 left-2 flex items-center gap-1">
        <span 
          v-if="rank" 
          class="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow uppercase tracking-wider"
        >
          TOP {{ rank }}
        </span>
        <span 
          v-else-if="media.vote_average && media.vote_average > 0"
          class="bg-black/70 backdrop-blur-md text-amber-400 text-[11px] font-bold px-1.5 py-0.5 rounded border border-neutral-700/50 flex items-center gap-0.5"
        >
          ★ {{ media.vote_average.toFixed(1) }}
        </span>
      </div>

      <!-- Media Type Tag -->
      <div class="absolute top-2 right-2">
        <span class="bg-neutral-950/80 backdrop-blur-sm text-neutral-300 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-neutral-700/40">
          {{ media.media_type === 'tv' ? 'SERIES' : 'MOVIE' }}
        </span>
      </div>

      <!-- Continue Watching Progress Bar -->
      <div v-if="progress !== undefined && progress > 0" class="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
        <div 
          class="h-full bg-red-600 transition-all duration-300"
          :style="{ width: `${Math.min(100, progress)}%` }"
        ></div>
      </div>

      <!-- Hover Play Overlay -->
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div class="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
          <svg class="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Title and Subtitle -->
    <div class="mt-2 px-0.5">
      <h3 class="text-xs sm:text-sm font-semibold text-neutral-200 truncate group-hover:text-white">
        {{ title }}
      </h3>
      <div class="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
        <span>{{ year }}</span>
        <span v-if="episodeInfo" class="text-red-400 font-medium truncate">{{ episodeInfo }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MediaItem } from '../types';
import { TMDB_IMAGE_BASE } from '../services/tmdb';

const props = defineProps<{
  media: MediaItem;
  rank?: number;
  progress?: number;
  episodeInfo?: string;
  isWide?: boolean;
}>();

defineEmits<{
  (e: 'select', media: MediaItem): void;
}>();

const imgError = ref(false);

const title = computed(() => {
  return props.media.title || props.media.name || 'Untitled';
});

const year = computed(() => {
  const d = props.media.release_date || props.media.first_air_date;
  return d ? d.substring(0, 4) : '';
});

const posterUrl = computed(() => {
  if (imgError.value) return null;
  const path = props.media.poster_path;
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/w342${path}`;
});

const handleImgError = () => {
  imgError.value = true;
};
</script>
