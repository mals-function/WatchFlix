<template>
  <div class="mt-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base sm:text-lg font-bold text-white tracking-wide">
        Episodes
      </h3>

      <!-- Season Selector Dropdown -->
      <div v-if="seasons.length > 1" class="relative">
        <select 
          v-model="selectedSeason" 
          class="bg-neutral-800 text-white text-xs font-semibold px-3 py-1.5 rounded border border-neutral-700 outline-none focus:border-red-600"
        >
          <option v-for="s in seasons" :key="s" :value="s">
            Season {{ s }}
          </option>
        </select>
      </div>
    </div>

    <!-- Episodes List -->
    <div v-if="filteredEpisodes.length > 0" class="space-y-3">
      <div 
        v-for="ep in filteredEpisodes" 
        :key="ep.id"
        class="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 transition cursor-pointer"
        @click="$emit('play-episode', ep)"
      >
        <!-- Episode Thumbnail & Play Indicator -->
        <div class="relative w-full sm:w-36 h-24 flex-none rounded overflow-hidden bg-neutral-800">
          <img 
            v-if="ep.image?.medium || ep.image?.original"
            :src="ep.image.medium || ep.image.original" 
            :alt="ep.name" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-950">
            <span class="text-xs font-bold">Ep {{ ep.number }}</span>
          </div>

          <div class="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition">
            <div class="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow">
              <svg class="w-4 h-4 ml-0.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Episode Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white group-hover:text-red-400 transition truncate">
              {{ ep.number }}. {{ ep.name }}
            </h4>
            <span v-if="ep.runtime" class="text-xs text-neutral-400 font-medium">
              {{ ep.runtime }}m
            </span>
          </div>
          <p class="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {{ ep.summary }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="py-8 text-center text-xs text-neutral-400 animate-pulse">
      Loading episode list from TVmaze...
    </div>

    <!-- Empty State Fallback -->
    <div v-else class="py-6 text-center text-xs text-neutral-400 italic">
      No specific episodes found. Click Play above to watch standard stream.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Episode } from '../types';

const props = defineProps<{
  episodes: Episode[];
  loading?: boolean;
}>();

defineEmits<{
  (e: 'play-episode', episode: Episode): void;
}>();

const selectedSeason = ref(1);

const seasons = computed(() => {
  const set = new Set<number>();
  for (const ep of props.episodes) {
    if (ep.season) set.add(ep.season);
  }
  const arr = Array.from(set).sort((a, b) => a - b);
  return arr.length > 0 ? arr : [1];
});

watch(seasons, (newSeasons) => {
  if (newSeasons.length > 0 && !newSeasons.includes(selectedSeason.value)) {
    selectedSeason.value = newSeasons[0];
  }
}, { immediate: true });

const filteredEpisodes = computed(() => {
  return props.episodes.filter(ep => ep.season === selectedSeason.value);
});
</script>
