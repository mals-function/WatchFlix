<template>
  <div v-if="providers && providers.length > 0" class="mt-4">
    <div class="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
      Where to Watch
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <div 
        v-for="provider in providers" 
        :key="provider.provider_id"
        class="flex items-center gap-2 bg-neutral-900/90 border border-neutral-700/60 rounded-lg px-2.5 py-1.5 shadow-sm hover:border-red-600 transition"
      >
        <img 
          v-if="provider.logo_path"
          :src="getLogoUrl(provider.logo_path)" 
          :alt="provider.provider_name"
          class="w-5 h-5 rounded object-cover"
        />
        <span class="text-xs font-medium text-white">{{ provider.provider_name }}</span>
        <span 
          v-if="provider.type"
          class="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold"
          :class="{
            'bg-green-900/60 text-green-300': provider.type === 'free',
            'bg-red-950/80 text-red-300': provider.type === 'flatrate',
            'bg-blue-950/80 text-blue-300': provider.type === 'rent',
            'bg-purple-950/80 text-purple-300': provider.type === 'buy',
          }"
        >
          {{ provider.type === 'flatrate' ? 'Stream' : provider.type }}
        </span>
      </div>
    </div>
  </div>
  <div v-else class="mt-3 text-xs text-neutral-400 italic">
    No subscription providers detected in selected region.
  </div>
</template>

<script setup lang="ts">
import type { StreamingProvider } from '../types';
import { TMDB_IMAGE_BASE } from '../services/tmdb';

defineProps<{
  providers?: StreamingProvider[];
}>();

const getLogoUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/w92${path}`;
};
</script>
