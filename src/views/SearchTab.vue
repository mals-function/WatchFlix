<template>
  <div class="w-full pt-20 pb-12 px-4 md:px-8 text-white">
    <!-- Search Bar -->
    <div class="max-w-2xl mx-auto mb-6">
      <div class="relative flex items-center">
        <svg class="absolute left-4 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search movies, TV shows, genres..."
          class="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-full py-3.5 pl-12 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition shadow-inner"
          @input="handleSearch"
        />
        <button 
          v-if="searchQuery" 
          @click="clearSearch"
          class="absolute right-3 p-1 text-neutral-400 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Quick Category Chips -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 mt-1">
        <button 
          v-for="filter in filters" 
          :key="filter.label"
          @click="applyFilter(filter)"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border"
          :class="[
            activeFilter === filter.label 
              ? 'bg-red-600 border-red-600 text-white shadow-md' 
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-neutral-400">
          {{ resultHeading }}
        </h2>
        <span v-if="results.length > 0" class="text-xs text-neutral-500">
          {{ results.length }} titles found
        </span>
      </div>

      <!-- Results Grid -->
      <div v-if="results.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <MediaCard 
          v-for="item in results" 
          :key="item.id" 
          :media="item"
          @select="$emit('detail', item)"
        />
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="py-16 text-center text-neutral-400 animate-pulse text-sm">
        Searching TMDB and streaming providers...
      </div>

      <!-- Empty State -->
      <div v-else class="py-20 text-center text-neutral-500">
        <svg class="w-12 h-12 mx-auto mb-3 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
        </svg>
        <p class="text-sm font-medium">No results found for "{{ searchQuery }}"</p>
        <p class="text-xs text-neutral-600 mt-1">Try searching for popular movies like Inception, Breaking Bad, or anime like Arcane.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { MediaItem } from '../types';
import { tmdbService } from '../services/tmdb';
import MediaCard from '../components/MediaCard.vue';

defineEmits<{
  (e: 'detail', media: MediaItem): void;
}>();

const searchQuery = ref('');
const results = ref<MediaItem[]>([]);
const loading = ref(false);
const activeFilter = ref('Trending');

let debounceTimer: any = null;

interface FilterOption {
  label: string;
  type?: 'movie' | 'tv';
  genreId?: number;
  providerId?: number;
}

const filters: FilterOption[] = [
  { label: 'Trending' },
  { label: 'Netflix Hits', providerId: 8 },
  { label: 'Action', genreId: 28, type: 'movie' },
  { label: 'Sci-Fi', genreId: 878, type: 'movie' },
  { label: 'Animation', genreId: 16, type: 'tv' },
  { label: 'Comedy', genreId: 35, type: 'movie' },
  { label: 'Disney+ Gems', providerId: 337 },
  { label: 'Prime Video', providerId: 9 },
];

const resultHeading = computed(() => {
  if (searchQuery.value) return `Results for "${searchQuery.value}"`;
  return activeFilter.value;
});

onMounted(() => {
  applyFilter(filters[0]);
});

const handleSearch = () => {
  clearTimeout(debounceTimer);
  if (!searchQuery.value.trim()) {
    applyFilter(filters.find(f => f.label === activeFilter.value) || filters[0]);
    return;
  }

  activeFilter.value = '';
  debounceTimer = setTimeout(async () => {
    loading.value = true;
    results.value = await tmdbService.searchMulti(searchQuery.value);
    loading.value = false;
  }, 350);
};

const clearSearch = () => {
  searchQuery.value = '';
  applyFilter(filters[0]);
};

const applyFilter = async (filter: FilterOption) => {
  activeFilter.value = filter.label;
  searchQuery.value = '';
  loading.value = true;

  try {
    if (filter.label === 'Trending') {
      results.value = await tmdbService.getTrending('all', 'week');
    } else if (filter.providerId) {
      results.value = await tmdbService.discover('movie', { providerId: filter.providerId });
    } else if (filter.genreId) {
      results.value = await tmdbService.discover(filter.type || 'movie', { genreId: filter.genreId });
    }
  } catch (err) {
    console.warn('Search filter error:', err);
  } finally {
    loading.value = false;
  }
};
</script>
