<template>
  <div class="w-full pb-10 text-white">
    <!-- Hero Featured Banner -->
    <HeroBanner 
      :media="currentHero" 
      :in-watchlist="isHeroInWatchlist"
      @play="openPlayer"
      @detail="openDetail"
      @toggle-watchlist="toggleWatchlist"
    />

    <!-- StreamFlix Style Category Filter Chips -->
    <div class="relative z-30 px-4 md:px-8 -mt-6 sm:-mt-10 mb-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button 
        v-for="chip in categoryChips" 
        :key="chip.id"
        @click="handleSelectCategory(chip.id)"
        class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border backdrop-blur-md shadow-md active:scale-95 cursor-pointer touch-manipulation select-none"
        :class="[
          activeCategory === chip.id 
            ? 'bg-red-600 border-red-600 text-white shadow-red-900/40' 
            : 'bg-black/70 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
        ]"
      >
        {{ chip.label }}
      </button>
    </div>

    <div class="relative z-20 space-y-2">
      <!-- 1. Continue Watching Row (if user has active history) -->
      <MediaRow 
        v-if="continueWatchingList.length > 0"
        title="Continue Watching"
        badge="Resume"
        :items="continueWatchingList"
        :history-map="historyMap"
        @select="openMediaFromHistory"
      />

      <!-- ==================== MOVIES VIEW ==================== -->
      <template v-if="activeCategory === 'movies'">
        <MediaRow 
          title="Trending Movies"
          :items="trendingMovies"
          :show-rank="true"
          @select="openDetail"
        />
        <MediaRow 
          title="Critically Acclaimed Movies"
          :items="topRatedMovies"
          @select="openDetail"
        />
        <MediaRow 
          title="Action & Adventure Blockbusters"
          :items="actionMovies"
          @select="openDetail"
        />
        <MediaRow 
          title="Sci-Fi & Cyberpunk Hits"
          :items="scifiMovies"
          @select="openDetail"
        />
        <MediaRow 
          title="Comedy & Drama Favorites"
          :items="comedyMovies"
          @select="openDetail"
        />
        <MediaRow 
          title="Horror & Thrillers"
          :items="horrorMovies"
          @select="openDetail"
        />
      </template>

      <!-- ==================== TV SHOWS / SERIES VIEW ==================== -->
      <template v-else-if="activeCategory === 'series'">
        <MediaRow 
          title="Trending TV Series"
          :items="trendingSeries"
          :show-rank="true"
          @select="openDetail"
        />
        <MediaRow 
          title="Netflix Originals"
          badge="N Series"
          :items="netflixOriginals"
          @select="openDetail"
        />
        <MediaRow 
          title="Binge-Worthy TV Hits"
          :items="popularSeries"
          @select="openDetail"
        />
        <MediaRow 
          title="Action & Sci-Fi Series"
          :items="actionShows"
          @select="openDetail"
        />
        <MediaRow 
          title="Animation & Anime Series"
          :items="animeShows"
          @select="openDetail"
        />
        <MediaRow 
          title="Crime & Mystery Dramas"
          :items="crimeShows"
          @select="openDetail"
        />
      </template>

      <!-- ==================== ALL (DEFAULT HOME) VIEW ==================== -->
      <template v-else-if="activeCategory === 'all'">
        <MediaRow 
          title="Trending Now"
          :items="trendingItems"
          :show-rank="true"
          @select="openDetail"
        />
        <MediaRow 
          title="Netflix Originals"
          badge="N Series"
          :items="netflixOriginals"
          @select="openDetail"
        />
        <MediaRow 
          title="Critically Acclaimed Movies"
          :items="topRatedMovies"
          @select="openDetail"
        />
        <MediaRow 
          title="Binge-Worthy TV Series"
          :items="popularSeries"
          @select="openDetail"
        />
        <MediaRow 
          title="Action & Sci-Fi Blockbusters"
          :items="actionMovies"
          @select="openDetail"
        />
        <MediaRow 
          title="Animation & Anime"
          :items="animeShows"
          @select="openDetail"
        />
      </template>

      <!-- ==================== ACTION VIEW ==================== -->
      <template v-else-if="activeCategory === 'action'">
        <MediaRow 
          title="Action Movies"
          :items="actionMovies"
          @select="openDetail"
        />
        <MediaRow 
          title="Action & Sci-Fi Shows"
          :items="actionShows"
          @select="openDetail"
        />
        <MediaRow 
          title="Sci-Fi & Cyberpunk Hits"
          :items="scifiMovies"
          @select="openDetail"
        />
      </template>

      <!-- ==================== ANIME VIEW ==================== -->
      <template v-else-if="activeCategory === 'anime'">
        <MediaRow 
          title="Animation & Anime Series"
          :items="animeShows"
          @select="openDetail"
        />
      </template>

      <!-- ==================== TOP RATED VIEW ==================== -->
      <template v-else-if="activeCategory === 'top'">
        <MediaRow 
          title="Top Rated Movies"
          :items="topRatedMovies"
          :show-rank="true"
          @select="openDetail"
        />
        <MediaRow 
          title="Top Rated TV Hits"
          :items="popularSeries"
          @select="openDetail"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { MediaItem, WatchHistoryItem } from '../types';
import { tmdbService, MOCK_ITEMS } from '../services/tmdb';
import { useWatchlistStore } from '../stores/watchlist';
import { useHistoryStore } from '../stores/history';
import HeroBanner from '../components/HeroBanner.vue';
import MediaRow from '../components/MediaRow.vue';

const props = withDefaults(defineProps<{
  tab?: string;
}>(), {
  tab: 'home'
});

const emit = defineEmits<{
  (e: 'play', media: MediaItem, episode?: any): void;
  (e: 'detail', media: MediaItem): void;
  (e: 'update:tab', tab: string): void;
}>();

const watchlistStore = useWatchlistStore();
const historyStore = useHistoryStore();

const activeCategory = ref('all');
const categoryChips = [
  { id: 'all', label: 'All' },
  { id: 'movies', label: 'Movies' },
  { id: 'series', label: 'TV Shows' },
  { id: 'action', label: 'Action' },
  { id: 'anime', label: 'Anime & Kids' },
  { id: 'top', label: 'Top Rated' },
];

// Catalog states
const heroItem = ref<MediaItem | null>(MOCK_ITEMS[0] || null);
const trendingItems = ref<MediaItem[]>([...MOCK_ITEMS]);
const trendingMovies = ref<MediaItem[]>([]);
const trendingSeries = ref<MediaItem[]>([]);
const netflixOriginals = ref<MediaItem[]>([]);
const topRatedMovies = ref<MediaItem[]>([]);
const popularSeries = ref<MediaItem[]>([]);
const actionMovies = ref<MediaItem[]>([]);
const scifiMovies = ref<MediaItem[]>([]);
const comedyMovies = ref<MediaItem[]>([]);
const horrorMovies = ref<MediaItem[]>([]);
const animeShows = ref<MediaItem[]>([]);
const actionShows = ref<MediaItem[]>([]);
const crimeShows = ref<MediaItem[]>([]);

// Sync navbar tab with category chips
watch(() => props.tab, (newTab) => {
  if (newTab === 'movies') {
    activeCategory.value = 'movies';
  } else if (newTab === 'series') {
    activeCategory.value = 'series';
  } else if (newTab === 'home') {
    activeCategory.value = 'all';
  }
}, { immediate: true });

const handleSelectCategory = (categoryId: string) => {
  activeCategory.value = categoryId;
  if (categoryId === 'movies') {
    emit('update:tab', 'movies');
  } else if (categoryId === 'series') {
    emit('update:tab', 'series');
  } else if (categoryId === 'all') {
    emit('update:tab', 'home');
  }
};

// Dynamic Hero Banner based on active category
const currentHero = computed<MediaItem | null>(() => {
  if (activeCategory.value === 'movies') {
    return trendingMovies.value[0] || topRatedMovies.value[0] || heroItem.value;
  }
  if (activeCategory.value === 'series') {
    return netflixOriginals.value[0] || trendingSeries.value[0] || heroItem.value;
  }
  return heroItem.value;
});

const isHeroInWatchlist = computed(() => {
  return currentHero.value ? watchlistStore.isInWatchlist(currentHero.value.id) : false;
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
    const [
      trending, 
      tMovies, 
      tSeries, 
      originals, 
      topMovies, 
      popSeries, 
      actionM, 
      scifiM, 
      comedyM, 
      horrorM, 
      animeS, 
      actionS, 
      crimeS
    ] = await Promise.all([
      tmdbService.getTrending('all', 'week'),
      tmdbService.getTrending('movie', 'week'),
      tmdbService.getTrending('tv', 'week'),
      tmdbService.getNetflixOriginals(),
      tmdbService.getTopRatedMovies(),
      tmdbService.getPopularSeries(),
      tmdbService.discover('movie', { genreId: 28 }),
      tmdbService.discover('movie', { genreId: 878 }),
      tmdbService.discover('movie', { genreId: 35 }),
      tmdbService.discover('movie', { genreId: 27 }),
      tmdbService.discover('tv', { genreId: 16 }),
      tmdbService.discover('tv', { genreId: 10759 }),
      tmdbService.discover('tv', { genreId: 80 }),
    ]);

    trendingItems.value = trending;
    trendingMovies.value = tMovies;
    trendingSeries.value = tSeries;
    netflixOriginals.value = originals;
    topRatedMovies.value = topMovies;
    popularSeries.value = popSeries;
    actionMovies.value = actionM;
    scifiMovies.value = scifiM;
    comedyMovies.value = comedyM;
    horrorMovies.value = horrorM;
    animeShows.value = animeS;
    actionShows.value = actionS;
    crimeShows.value = crimeS;

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
