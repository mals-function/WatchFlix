<template>
  <div class="min-h-screen bg-[#141414] pb-24 text-white">
    <!-- Hero Featured Banner -->
    <HeroBanner 
      :media="heroItem" 
      :in-watchlist="isHeroInWatchlist"
      @play="openPlayer"
      @detail="openDetail"
      @toggle-watchlist="toggleWatchlist"
    />

    <div class="relative z-20 -mt-10 sm:-mt-16 space-y-2">
      <!-- 1. Continue Watching Row (if user has active history) -->
      <MediaRow 
        v-if="continueWatchingList.length > 0"
        title="Continue Watching"
        badge="Resume"
        :items="continueWatchingList"
        :history-map="historyMap"
        @select="openMediaFromHistory"
      />

      <!-- 2. Trending Now Row -->
      <MediaRow 
        title="Trending Now"
        :items="trendingItems"
        :show-rank="true"
        @select="openDetail"
      />

      <!-- 3. Netflix Originals Row -->
      <MediaRow 
        title="Netflix Originals"
        badge="N Series"
        :items="netflixOriginals"
        @select="openDetail"
      />

      <!-- 4. Top Rated Movies -->
      <MediaRow 
        title="Critically Acclaimed Movies"
        :items="topRatedMovies"
        @select="openDetail"
      />

      <!-- 5. Popular TV Series -->
      <MediaRow 
        title="Binge-Worthy TV Series"
        :items="popularSeries"
        @select="openDetail"
      />

      <!-- 6. Action & Sci-Fi Blockbusters -->
      <MediaRow 
        title="Action & Sci-Fi"
        :items="actionMovies"
        @select="openDetail"
      />

      <!-- 7. Anime & Animation -->
      <MediaRow 
        title="Animation & Anime"
        :items="animeShows"
        @select="openDetail"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { MediaItem, WatchHistoryItem } from '../types';
import { tmdbService } from '../services/tmdb';
import { useWatchlistStore } from '../stores/watchlist';
import { useHistoryStore } from '../stores/history';
import HeroBanner from '../components/HeroBanner.vue';
import MediaRow from '../components/MediaRow.vue';

const emit = defineEmits<{
  (e: 'play', media: MediaItem, episode?: any): void;
  (e: 'detail', media: MediaItem): void;
}>();

const watchlistStore = useWatchlistStore();
const historyStore = useHistoryStore();

const heroItem = ref<MediaItem | null>(null);
const trendingItems = ref<MediaItem[]>([]);
const netflixOriginals = ref<MediaItem[]>([]);
const topRatedMovies = ref<MediaItem[]>([]);
const popularSeries = ref<MediaItem[]>([]);
const actionMovies = ref<MediaItem[]>([]);
const animeShows = ref<MediaItem[]>([]);

const isHeroInWatchlist = computed(() => {
  return heroItem.value ? watchlistStore.isInWatchlist(heroItem.value.id) : false;
});

const continueWatchingList = computed<MediaItem[]>(() => {
  return historyStore.history
    .filter(h => !h.completed && h.percentage < 95)
    .map(h => ({
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

const historyMap = computed<Record<string, WatchHistoryItem>>(() => {
  const map: Record<string, WatchHistoryItem> = {};
  for (const h of historyStore.history) {
    map[h.media_id] = h;
  }
  return map;
});

onMounted(async () => {
  await loadCatalogData();
});

const loadCatalogData = async () => {
  try {
    const [trending, originals, topMovies, popSeries, action, anime] = await Promise.all([
      tmdbService.getTrending('all', 'week'),
      tmdbService.getNetflixOriginals(),
      tmdbService.getTopRatedMovies(),
      tmdbService.getPopularSeries(),
      tmdbService.discover('movie', { genreId: 28 }),
      tmdbService.discover('tv', { genreId: 16 }),
    ]);

    trendingItems.value = trending;
    netflixOriginals.value = originals;
    topRatedMovies.value = topMovies;
    popularSeries.value = popSeries;
    actionMovies.value = action;
    animeShows.value = anime;

    if (originals.length > 0) {
      heroItem.value = originals[0];
    } else if (trending.length > 0) {
      heroItem.value = trending[0];
    }
  } catch (err) {
    console.warn('Error loading catalog data:', err);
  }
};

const openPlayer = (media: MediaItem) => {
  emit('play', media);
};

const openDetail = (media: MediaItem) => {
  emit('detail', media);
};

const openMediaFromHistory = (media: MediaItem) => {
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

const toggleWatchlist = (media: MediaItem) => {
  watchlistStore.toggleWatchlist(media);
};
</script>
