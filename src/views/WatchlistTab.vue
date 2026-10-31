<template>
  <div class="min-h-screen bg-[#141414] pt-20 pb-24 px-4 md:px-8 text-white">
    <!-- Header with Tabs: My List vs Watch History -->
    <div class="flex items-center justify-between mb-6 pb-3 border-b border-neutral-800">
      <div class="flex items-center gap-6">
        <button 
          @click="activeSubTab = 'watchlist'"
          class="text-lg sm:text-xl font-bold tracking-tight pb-1 relative transition"
          :class="[activeSubTab === 'watchlist' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300']"
        >
          <span>My List</span>
          <span 
            v-if="watchlistStore.watchlist.length > 0" 
            class="ml-2 text-xs bg-red-600/80 px-2 py-0.5 rounded-full font-bold text-white"
          >
            {{ watchlistStore.watchlist.length }}
          </span>
          <div v-if="activeSubTab === 'watchlist'" class="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-red-600"></div>
        </button>

        <button 
          @click="activeSubTab = 'history'"
          class="text-lg sm:text-xl font-bold tracking-tight pb-1 relative transition"
          :class="[activeSubTab === 'history' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300']"
        >
          <span>Watch History</span>
          <span 
            v-if="historyStore.history.length > 0" 
            class="ml-2 text-xs bg-neutral-800 px-2 py-0.5 rounded-full font-bold text-neutral-300"
          >
            {{ historyStore.history.length }}
          </span>
          <div v-if="activeSubTab === 'history'" class="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-red-600"></div>
        </button>
      </div>

      <!-- Clear History Button -->
      <button 
        v-if="activeSubTab === 'history' && historyStore.history.length > 0"
        @click="confirmClearHistory"
        class="text-xs text-neutral-400 hover:text-red-400 font-semibold transition"
      >
        Clear History
      </button>
    </div>

    <!-- 1. Watchlist Grid -->
    <div v-if="activeSubTab === 'watchlist'">
      <div v-if="watchlistStore.watchlist.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <div 
          v-for="item in watchlistStore.watchlist" 
          :key="item.id"
          class="relative group"
        >
          <MediaCard 
            :media="item"
            @select="$emit('detail', item)"
          />
          <button 
            @click.stop="watchlistStore.removeFromWatchlist(item.id)"
            class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow z-20"
            title="Remove from My List"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="py-24 text-center text-neutral-500">
        <svg class="w-14 h-14 mx-auto mb-3 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
        <p class="text-base font-semibold text-neutral-300">Your Watchlist is Empty</p>
        <p class="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Explore movies and series on Home or Search, and tap the + icon to add them to your personal list.
        </p>
      </div>
    </div>

    <!-- 2. Watch History Grid -->
    <div v-else>
      <div v-if="historyStore.history.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <MediaCard 
          v-for="item in historyList" 
          :key="item.id" 
          :media="item"
          :progress="getHistoryProgress(item)"
          :episode-info="getEpisodeInfo(item)"
          @select="resumeHistoryItem(item)"
        />
      </div>

      <div v-else class="py-24 text-center text-neutral-500">
        <svg class="w-14 h-14 mx-auto mb-3 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-base font-semibold text-neutral-300">No Watch History Yet</p>
        <p class="text-xs text-neutral-500 mt-1">
          When you watch videos, movies or series in the player, your progress will be remembered here automatically.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MediaItem } from '../types';
import { useWatchlistStore } from '../stores/watchlist';
import { useHistoryStore } from '../stores/history';
import MediaCard from '../components/MediaCard.vue';

const emit = defineEmits<{
  (e: 'play', media: MediaItem, episode?: any): void;
  (e: 'detail', media: MediaItem): void;
}>();

const watchlistStore = useWatchlistStore();
const historyStore = useHistoryStore();

const activeSubTab = ref<'watchlist' | 'history'>('watchlist');

const historyList = computed<MediaItem[]>(() => {
  return historyStore.history.map(h => ({
    id: h.media_id,
    title: h.title,
    media_type: h.media_type,
    overview: '',
    poster_path: h.poster_path,
    backdrop_path: h.backdrop_path,
    vote_average: 0,
    custom_stream_url: h.stream_url
  }));
});

const getHistoryProgress = (media: MediaItem): number | undefined => {
  const item = historyStore.history.find(h => String(h.media_id) === String(media.id));
  return item?.percentage;
};

const getEpisodeInfo = (media: MediaItem): string | undefined => {
  const item = historyStore.history.find(h => String(h.media_id) === String(media.id));
  if (item && item.season_number) {
    return `S${item.season_number}:E${item.episode_number}`;
  }
  return undefined;
};

const resumeHistoryItem = (media: MediaItem) => {
  const item = historyStore.history.find(h => String(h.media_id) === String(media.id));
  if (item && item.season_number && item.episode_number) {
    emit('play', media, {
      season: item.season_number,
      number: item.episode_number,
      title: item.episode_title || `Episode ${item.episode_number}`
    });
  } else {
    emit('play', media);
  }
};

const confirmClearHistory = () => {
  if (confirm('Are you sure you want to clear your watch history?')) {
    historyStore.clearHistory();
  }
};
</script>
