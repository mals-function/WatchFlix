<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-lg bg-[#181818] rounded-xl border border-neutral-800 text-white p-6 shadow-2xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Stream Source Manager</h3>
            <p class="text-xs text-neutral-400">Configure direct authorized video playback</p>
          </div>
        </div>

        <button 
          @click="$emit('close')"
          aria-label="Close"
          class="text-neutral-400 hover:text-white p-1 rounded-full transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Stream Form -->
      <form @submit.prevent="handleSave" class="mt-4 space-y-4">
        <!-- Target Media Title & ID -->
        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            Media Title
          </label>
          <input 
            v-model="formTitle" 
            type="text" 
            required
            placeholder="e.g. Stranger Things or Dune"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-neutral-300 mb-1">
              TMDB / Media ID
            </label>
            <input 
              v-model="formMediaId" 
              type="text" 
              required
              placeholder="e.g. 111110"
              class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-300 mb-1">
              Media Type
            </label>
            <select 
              v-model="formMediaType" 
              class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            >
              <option value="movie">Movie</option>
              <option value="tv">TV Series</option>
              <option value="custom">Custom Video</option>
            </select>
          </div>
        </div>

        <!-- TV Season & Episode if Series -->
        <div v-if="formMediaType === 'tv'" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-neutral-300 mb-1">
              Season Number
            </label>
            <input 
              v-model.number="formSeason" 
              type="number" 
              min="1"
              placeholder="1"
              class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-neutral-300 mb-1">
              Episode Number
            </label>
            <input 
              v-model.number="formEpisode" 
              type="number" 
              min="1"
              placeholder="1"
              class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        <!-- Stream URL -->
        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            Direct Stream URL (.m3u8, .mp4, or embed)
          </label>
          <input 
            v-model="formStreamUrl" 
            type="url" 
            required
            placeholder="https://.../stream.m3u8"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 font-mono text-xs"
          />
          <div class="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Supports HLS .m3u8, direct MP4, or YouTube links.</span>
            <button 
              type="button" 
              @click="loadSampleM3u8"
              class="text-red-400 hover:text-red-300 underline font-semibold"
            >
              Insert Demo HLS
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-neutral-300 mb-1">
              Stream Type
            </label>
            <select 
              v-model="formStreamType" 
              class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            >
              <option value="hls">HLS (.m3u8)</option>
              <option value="mp4">Direct MP4</option>
              <option value="youtube">YouTube Trailer</option>
              <option value="embed">Embed Frame</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-300 mb-1">
              Quality Label
            </label>
            <select 
              v-model="formQuality" 
              class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            >
              <option value="4K UHD">4K UHD</option>
              <option value="1080p FHD">1080p FHD</option>
              <option value="720p HD">720p HD</option>
              <option value="Adaptive Auto">Adaptive Auto</option>
            </select>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex items-center justify-end gap-3">
          <button 
            type="button" 
            @click="$emit('close')"
            class="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button 
            type="submit" 
            class="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Save Stream</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { MediaItem } from '../types';
import { useCustomStreamsStore } from '../stores/customStreams';

const props = defineProps<{
  isOpen: boolean;
  prefillMedia?: MediaItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const customStreamsStore = useCustomStreamsStore();

const formTitle = ref('');
const formMediaId = ref('');
const formMediaType = ref<'movie' | 'tv' | 'custom'>('movie');
const formStreamUrl = ref('');
const formStreamType = ref<'hls' | 'mp4' | 'youtube' | 'embed'>('hls');
const formQuality = ref('1080p FHD');
const formSeason = ref<number | undefined>(undefined);
const formEpisode = ref<number | undefined>(undefined);

watch(() => props.prefillMedia, (m) => {
  if (m) {
    formTitle.value = m.title || m.name || '';
    formMediaId.value = String(m.id);
    formMediaType.value = m.media_type;
    formStreamUrl.value = m.custom_stream_url || '';
  }
}, { immediate: true });

const loadSampleM3u8 = () => {
  formStreamUrl.value = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  formStreamType.value = 'hls';
  formQuality.value = 'Adaptive Auto';
};

const handleSave = async () => {
  await customStreamsStore.addStream({
    media_id: formMediaId.value,
    media_type: formMediaType.value,
    title: formTitle.value,
    stream_url: formStreamUrl.value,
    stream_type: formStreamType.value,
    quality_label: formQuality.value,
    season_number: formMediaType.value === 'tv' ? formSeason.value : undefined,
    episode_number: formMediaType.value === 'tv' ? formEpisode.value : undefined,
  });

  emit('saved');
  emit('close');
};
</script>
