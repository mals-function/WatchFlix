<template>
  <div class="w-full text-white pt-20 sm:pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-[1920px] mx-auto">
    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
        {{ title }}
      </h1>
      <p class="text-sm sm:text-base text-neutral-400 mt-1 font-medium">
        {{ subtitle }}
      </p>

      <!-- Filter Dropdowns Row -->
      <div class="mt-5 flex flex-wrap items-center gap-3">
        <!-- Genres Dropdown -->
        <div class="relative">
          <select 
            v-model="selectedGenre" 
            @change="handleFilterChange"
            class="appearance-none bg-[#1a1a1a] hover:bg-[#222222] text-neutral-200 text-xs sm:text-sm font-semibold pl-4 pr-10 py-2.5 rounded-lg border border-neutral-800 hover:border-neutral-700 focus:outline-none focus:border-red-600 transition cursor-pointer shadow-md"
          >
            <option :value="0">All Genres</option>
            <option v-for="g in genres" :key="g.id" :value="g.id">
              {{ g.name }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Sort Dropdown -->
        <div class="relative">
          <select 
            v-model="selectedSort" 
            @change="handleFilterChange"
            class="appearance-none bg-[#1a1a1a] hover:bg-[#222222] text-neutral-200 text-xs sm:text-sm font-semibold pl-4 pr-10 py-2.5 rounded-lg border border-neutral-800 hover:border-neutral-700 focus:outline-none focus:border-red-600 transition cursor-pointer shadow-md"
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="trending">Trending Now</option>
            <option value="release_date.desc">Recently Added</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Reset Button if filtered -->
        <button 
          v-if="selectedGenre !== 0 || selectedSort !== 'popularity.desc'"
          @click="resetFilters"
          class="text-xs text-neutral-400 hover:text-white px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 transition"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Loading Skeleton Grid -->
    <div 
      v-if="loading && items.length === 0" 
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5"
    >
      <div 
        v-for="n in 16" 
        :key="n" 
        class="animate-pulse space-y-2"
      >
        <div class="aspect-[2/3] w-full bg-neutral-800/60 rounded-xl"></div>
        <div class="h-4 w-3/4 bg-neutral-800 rounded"></div>
        <div class="h-3 w-1/2 bg-neutral-800/60 rounded"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="items.length === 0" 
      class="py-20 text-center text-neutral-400 space-y-3"
    >
      <p class="text-base font-semibold">No titles found for the selected filter.</p>
      <button 
        @click="resetFilters" 
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
      >
        Show All
      </button>
    </div>

    <!-- Catalog Multi-Column Responsive Grid (Matches StreamFlix) -->
    <div 
      v-else 
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5"
    >
      <div 
        v-for="item in items" 
        :key="item.id"
        @click="$emit('detail', item)"
        class="group cursor-pointer flex flex-col select-none transition-transform duration-200 hover:scale-105 active:scale-95 touch-manipulation"
      >
        <!-- Poster Container -->
        <div class="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/80 group-hover:border-neutral-600 transition shadow-lg">
          <img 
            :src="getPosterUrl(item.poster_path)" 
            :alt="item.title"
            loading="lazy"
            class="w-full h-full object-cover filter brightness-95 group-hover:brightness-105 transition"
            @error="onImageError"
          />

          <!-- Red Badge (TV or MOVIE) -->
          <span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black uppercase px-1.5 py-0.5 rounded shadow tracking-wider">
            {{ type === 'tv' ? 'TV' : 'MOVIE' }}
          </span>

          <!-- Quick Play Hover Overlay on Desktop -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              @click.stop="$emit('play', item)"
              aria-label="Play"
              class="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition active:scale-90"
            >
              <svg class="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Meta Info Below Poster -->
        <div class="mt-2.5 flex flex-col">
          <h3 
            class="text-xs sm:text-sm font-bold text-white truncate group-hover:text-red-400 transition" 
            :title="item.title"
          >
            {{ item.title }}
          </h3>
          <div class="flex items-center justify-between text-[11px] sm:text-xs text-neutral-400 mt-0.5">
            <span>{{ getYear(item.release_date || item.first_air_date) }}</span>
            <span v-if="item.vote_average && item.vote_average > 0" class="text-amber-400 font-bold flex items-center gap-0.5">
              ★ {{ item.vote_average.toFixed(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="items.length > 0 && hasMore" class="mt-12 text-center">
      <button 
        @click="loadMore"
        :disabled="loading"
        class="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold rounded-xl border border-neutral-800 hover:border-neutral-700 transition shadow-lg active:scale-95 disabled:opacity-50"
      >
        <span v-if="loading">Loading more...</span>
        <span v-else>Load More Titles</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { MediaItem } from '../types';
import { tmdbService, TMDB_IMAGE_BASE, tmdbFetch } from '../services/tmdb';

const props = defineProps<{
  type: 'movie' | 'tv';
  title: string;
  subtitle: string;
}>();

defineEmits<{
  (e: 'play', media: MediaItem): void;
  (e: 'detail', media: MediaItem): void;
}>();

const items = ref<MediaItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const hasMore = ref(true);

const selectedGenre = ref<number>(0);
const selectedSort = ref<string>('popularity.desc');

// Genre definitions matching TMDB
const tvGenres = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

const movieGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const genres = props.type === 'tv' ? tvGenres : movieGenres;

const getPosterUrl = (posterPath?: string | null) => {
  if (!posterPath) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
  return `${TMDB_IMAGE_BASE}/w500${posterPath}`;
};

const getYear = (dateStr?: string | null) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 4);
};

const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
};

const fetchTitles = async (page: number = 1, append: boolean = false) => {
  loading.value = true;
  try {
    let results: any[] = [];

    if (selectedSort.value === 'trending') {
      const data = await tmdbFetch(`/trending/${props.type}/week`, {
        page: String(page)
      });
      results = data?.results || [];
    } else {
      const params: Record<string, string> = {
        page: String(page),
        sort_by: selectedSort.value,
      };

      if (selectedGenre.value > 0) {
        params.with_genres = String(selectedGenre.value);
      }

      // Quality filter so only rated titles appear
      if (selectedSort.value === 'vote_average.desc') {
        params['vote_count.gte'] = '200';
      }

      const data = await tmdbFetch(`/discover/${props.type}`, params);
      results = data?.results || [];
    }

    const mapped = results.map(item => ({
      id: item.id,
      title: item.title || item.name || 'Untitled',
      name: item.name,
      media_type: props.type,
      overview: item.overview || '',
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path || item.poster_path,
      vote_average: Math.round((item.vote_average || 0) * 10) / 10,
      release_date: item.release_date || item.first_air_date,
      first_air_date: item.first_air_date,
      genre_ids: item.genre_ids || []
    }));

    if (append) {
      items.value = [...items.value, ...mapped];
    } else {
      items.value = mapped;
    }

    hasMore.value = results.length >= 15;
    currentPage.value = page;
  } catch (err) {
    console.warn('Error fetching catalog titles:', err);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchTitles(1, false);
};

const resetFilters = () => {
  selectedGenre.value = 0;
  selectedSort.value = 'popularity.desc';
  handleFilterChange();
};

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    fetchTitles(currentPage.value + 1, true);
  }
};

watch(() => props.type, () => {
  resetFilters();
});

onMounted(() => {
  fetchTitles(1, false);
});
</script>
