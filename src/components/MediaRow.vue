<template>
  <section v-if="items && items.length > 0" class="my-6 px-4 md:px-8">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
        <span>{{ title }}</span>
        <span v-if="badge" class="text-[11px] bg-red-600/90 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {{ badge }}
        </span>
      </h2>

      <!-- Navigation Arrows for Desktop -->
      <div class="hidden sm:flex items-center gap-1">
        <button 
          @click="scrollRow('left')"
          aria-label="Scroll left"
          class="w-7 h-7 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition"
        >
          ‹
        </button>
        <button 
          @click="scrollRow('right')"
          aria-label="Scroll right"
          class="w-7 h-7 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition"
        >
          ›
        </button>
      </div>
    </div>

    <!-- Row Container with horizontal snap scroll -->
    <div 
      ref="rowContainer" 
      class="flex items-start gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1.5 snap-x snap-mandatory"
    >
      <MediaCard
        v-for="(item, idx) in items"
        :key="item.id"
        :media="item"
        :rank="showRank ? idx + 1 : undefined"
        :progress="getProgress(item)"
        :episode-info="getEpisodeInfo(item)"
        @select="$emit('select', item)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MediaItem, WatchHistoryItem } from '../types';
import MediaCard from './MediaCard.vue';

const props = defineProps<{
  title: string;
  items: MediaItem[];
  badge?: string;
  showRank?: boolean;
  historyMap?: Record<string, WatchHistoryItem>;
}>();

defineEmits<{
  (e: 'select', media: MediaItem): void;
}>();

const rowContainer = ref<HTMLElement | null>(null);

const scrollRow = (direction: 'left' | 'right') => {
  if (!rowContainer.value) return;
  const scrollAmount = rowContainer.value.clientWidth * 0.75;
  rowContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  });
};

const getProgress = (item: MediaItem): number | undefined => {
  if (!props.historyMap) return undefined;
  const historyItem = props.historyMap[String(item.id)];
  return historyItem?.percentage;
};

const getEpisodeInfo = (item: MediaItem): string | undefined => {
  if (!props.historyMap) return undefined;
  const historyItem = props.historyMap[String(item.id)];
  if (!historyItem || !historyItem.season_number) return undefined;
  return `S${historyItem.season_number}:E${historyItem.episode_number}`;
};
</script>
