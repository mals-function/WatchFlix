<template>
  <div 
    v-if="isOpen && media" 
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-4xl bg-[#181818] rounded-none sm:rounded-xl overflow-hidden shadow-2xl border border-neutral-800 text-white my-auto max-h-[95vh] overflow-y-auto no-scrollbar">
      <!-- Close Button -->
      <button 
        @click="$emit('close')"
        aria-label="Close"
        class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Hero Header Backdrop -->
      <div class="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
        <img 
          :src="backdropUrl" 
          :alt="title" 
          class="w-full h-full object-cover filter brightness-90"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent"></div>

        <!-- Hero Actions on Backdrop -->
        <div class="absolute bottom-6 left-6 right-6">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
            {{ title }}
          </h2>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <!-- Play Button -->
            <button 
              @click="$emit('play', media)"
              class="flex items-center gap-2.5 bg-white hover:bg-neutral-100 text-black font-extrabold px-6 py-2.5 rounded-full shadow-[0_8px_25px_-5px_rgba(255,255,255,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
            >
              <div class="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 fill-black ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span class="text-sm font-bold tracking-wide">Play Now</span>
            </button>

            <!-- Trailer Button -->
            <button 
              v-if="media.trailer_url"
              @click="$emit('play-trailer', media)"
              class="flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold px-5 py-2.5 rounded-full border border-white/15 hover:border-white/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              <span class="text-xs sm:text-sm">Trailer</span>
            </button>

            <!-- Watchlist Button -->
            <button 
              @click="$emit('toggle-watchlist', media)"
              class="w-11 h-11 rounded-full border border-white/15 hover:border-white/35 bg-neutral-900/80 hover:bg-neutral-800 text-white flex items-center justify-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-lg cursor-pointer"
              :title="inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'"
            >
              <svg v-if="inWatchlist" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-5 h-5 text-neutral-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <!-- Admin Stream Override Shortcut -->
            <button 
              v-if="isAdmin"
              @click="$emit('admin-edit-stream', media)"
              class="flex items-center gap-1.5 text-xs bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 px-4 py-2.5 rounded-full font-bold transition shadow active:scale-95"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>Set Custom Stream</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Body Details -->
      <div class="p-6">
        <!-- Metadata bar: Rating, Year, Type, Quality -->
        <div class="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-300">
          <span v-if="media.vote_average" class="text-green-400 font-bold">
            {{ Math.round(media.vote_average * 10) }}% Match
          </span>
          <span>{{ releaseYear }}</span>
          <span class="border border-neutral-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-neutral-400">
            {{ media.media_type === 'tv' ? 'Series' : 'HD' }}
          </span>
          <span v-if="media.runtime" class="text-neutral-400">
            {{ media.runtime }} min
          </span>
          <span v-if="media.number_of_seasons" class="text-neutral-400">
            {{ media.number_of_seasons }} Season{{ media.number_of_seasons > 1 ? 's' : '' }}
          </span>
          <span v-if="hasCustomStream" class="text-xs bg-red-600/30 text-red-300 border border-red-600/50 px-2 py-0.5 rounded font-bold">
            Custom HLS Active
          </span>
        </div>

        <!-- Overview -->
        <p class="mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
          {{ media.overview }}
        </p>

        <!-- Streaming Providers Availability -->
        <StreamingProvidersBadge :providers="media.providers" />

        <!-- TV Episodes (TVmaze integration) -->
        <EpisodesList 
          v-if="media.media_type === 'tv'" 
          :episodes="episodes" 
          :loading="episodesLoading"
          @play-episode="$emit('play-episode', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MediaItem, Episode } from '../types';
import { TMDB_IMAGE_BASE } from '../services/tmdb';
import StreamingProvidersBadge from './StreamingProvidersBadge.vue';
import EpisodesList from './EpisodesList.vue';

const props = defineProps<{
  isOpen: boolean;
  media: MediaItem | null;
  inWatchlist?: boolean;
  isAdmin?: boolean;
  episodes: Episode[];
  episodesLoading?: boolean;
  hasCustomStream?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'play', media: MediaItem): void;
  (e: 'play-trailer', media: MediaItem): void;
  (e: 'toggle-watchlist', media: MediaItem): void;
  (e: 'play-episode', episode: Episode): void;
  (e: 'admin-edit-stream', media: MediaItem): void;
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
  return `${TMDB_IMAGE_BASE}/w1280${path}`;
});
</script>
