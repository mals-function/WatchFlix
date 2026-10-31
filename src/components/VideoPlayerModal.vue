<template>
  <div 
    v-if="isOpen"
    ref="playerContainer"
    class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden"
  >
    <!-- Top Control Bar (Always visible over video/embed) -->
    <div class="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent p-3 sm:p-4 flex items-center justify-between pointer-events-auto">
      <div class="flex items-center gap-3">
        <!-- Close / Back Button -->
        <button 
          @click="closePlayer"
          aria-label="Back"
          class="text-white hover:text-red-500 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition shadow"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>

        <!-- Media & Episode Title -->
        <div>
          <h2 class="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
            {{ title }}
          </h2>
          <p v-if="episodeInfo" class="text-xs text-red-400 font-semibold truncate">
            {{ episodeInfo }}
          </p>
        </div>
      </div>

      <!-- Right Controls: Brave Shield Indicator, Server Switcher Dropdown, Next Episode, Fullscreen -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Brave Shield Status Indicator -->
        <div 
          class="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border bg-orange-950/70 border-orange-600/70 text-orange-300 shadow cursor-default select-none"
          title="Brave Shields Active: Suppresses popups and redirects natively without breaking playback"
        >
          <span class="text-xs">🦁</span>
          <span class="hidden sm:inline">Brave Shield</span>
          <span class="text-[9px] uppercase px-1 rounded bg-orange-900/80 text-orange-200">
            ON
          </span>
        </div>

        <!-- Server Switcher Dropdown -->
        <div class="relative">
          <select 
            v-model="selectedServerId" 
            @change="handleServerChange"
            class="bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg border border-red-600/70 outline-none shadow-lg cursor-pointer transition"
          >
            <option v-for="server in STREAMING_SERVERS" :key="server.id" :value="server.id">
              {{ server.name }} [{{ server.badge }}]
            </option>
            <option value="direct_hls">Native HLS Player</option>
            <option v-if="media?.trailer_url" value="trailer">Official Trailer</option>
          </select>
        </div>

        <!-- Next Episode Button (TV Shows) -->
        <button 
          v-if="hasNextEpisode"
          @click="$emit('next-episode')"
          class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg shadow transition active:scale-95"
          title="Play Next Episode"
        >
          <span>Next Ep</span>
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>

        <!-- Fullscreen Toggle -->
        <button 
          @click="toggleFullscreen"
          class="text-white hover:text-red-400 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition shadow"
          title="Toggle Fullscreen"
        >
          <svg v-if="isFullscreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9L4 4m0 0l4 0m-4 0l0 4m11-4l5 5m0-5l-4 0m4 0l0 4M9 15l-5 5m0 0l4 0m-4 0l0-4m11 4l5-5m0 5l-4 0m4 0l0-4"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 1. Stream Server Embed Frame (VidLink, VidSrc, MultiEmbed, AutoEmbed, etc.) -->
    <div 
      v-if="currentMode === 'embed'" 
      class="w-full h-full pt-12 relative flex items-center justify-center bg-black"
    >
      <iframe 
        :key="embedSrc"
        :src="embedSrc" 
        class="w-full h-full border-0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowfullscreen
        referrerpolicy="origin"
      ></iframe>

      <!-- Quick Server Selector Pills at bottom if server is slow -->
      <div class="absolute bottom-3 left-0 right-0 z-40 flex items-center justify-center gap-1.5 px-4 overflow-x-auto no-scrollbar pointer-events-auto">
        <span class="text-[10px] uppercase font-bold text-neutral-400 bg-black/70 px-2 py-1 rounded backdrop-blur mr-1">
          Switch Server:
        </span>
        <button 
          v-for="srv in STREAMING_SERVERS" 
          :key="srv.id"
          @click="selectedServerId = srv.id; handleServerChange()"
          class="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition shadow"
          :class="[
            selectedServerId === srv.id 
              ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-400' 
              : 'bg-black/75 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
          ]"
        >
          {{ srv.name.split(' ')[0] + ' ' + srv.name.split(' ')[1] }}
        </button>
      </div>
    </div>

    <!-- 2. Official YouTube Trailer View -->
    <div 
      v-else-if="currentMode === 'trailer'" 
      class="w-full h-full pt-14 flex items-center justify-center relative bg-black"
    >
      <iframe 
        :src="youtubeEmbedUrl" 
        class="w-full h-full border-0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
        allowfullscreen
      ></iframe>
    </div>

    <!-- 3. Native / Direct HLS Player (.m3u8 / MP4) -->
    <div 
      v-else 
      class="w-full h-full relative flex items-center justify-center bg-black"
      @mousemove="handleActivity"
      @touchstart="handleActivity"
    >
      <video
        ref="videoRef"
        class="w-full h-full object-contain cursor-pointer"
        playsinline
        webkit-playsinline
        @click="togglePlay"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @waiting="isBuffering = true"
        @playing="isBuffering = false; isPlaying = true"
        @pause="isPlaying = false"
        @ended="onVideoEnded"
      ></video>

      <!-- Buffering Spinner -->
      <div 
        v-if="isBuffering"
        class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
      >
        <div class="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Video Controls Overlay -->
      <div 
        class="absolute inset-0 flex flex-col justify-between pointer-events-none transition-opacity duration-300 z-40 bg-gradient-to-t from-black/80 via-transparent to-black/60 pt-16"
        :class="{ 'opacity-100 pointer-events-auto': showControls, 'opacity-0': !showControls }"
      >
        <div></div>

        <!-- Center Controls: Rewind, Play/Pause, Fast Forward -->
        <div class="flex items-center justify-center gap-8 sm:gap-14 pointer-events-auto">
          <button 
            @click="seekRelative(-10)"
            class="text-white hover:text-red-500 transition transform hover:scale-110 active:scale-95 flex flex-col items-center"
          >
            <svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/>
            </svg>
            <span class="text-[10px] mt-0.5 font-bold">-10s</span>
          </button>

          <button 
            @click="togglePlay"
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition transform hover:scale-105 active:scale-95 shadow-xl border border-white/30"
          >
            <svg v-if="isPlaying" class="w-8 h-8 sm:w-10 sm:h-10 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            <svg v-else class="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <button 
            @click="seekRelative(10)"
            class="text-white hover:text-red-500 transition transform hover:scale-110 active:scale-95 flex flex-col items-center"
          >
            <svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/>
            </svg>
            <span class="text-[10px] mt-0.5 font-bold">+10s</span>
          </button>
        </div>

        <!-- Bottom Bar: Scrub Slider, Timestamps, Speed -->
        <div class="p-4 sm:p-6 space-y-2 pointer-events-auto">
          <div class="relative flex items-center group cursor-pointer" @click="handleScrubClick">
            <div class="w-full h-1.5 group-hover:h-2.5 bg-white/20 rounded-full overflow-hidden transition-all relative">
              <div 
                class="h-full bg-red-600 rounded-full relative"
                :style="{ width: `${progressPercentage}%` }"
              ></div>
            </div>
            <div 
              class="absolute w-4 h-4 bg-red-600 rounded-full shadow-md transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              :style="{ left: `${progressPercentage}%` }"
            ></div>
          </div>

          <div class="flex items-center justify-between text-xs text-neutral-300">
            <div class="flex items-center gap-2 font-mono">
              <span>{{ formatTime(currentTime) }}</span>
              <span>/</span>
              <span>{{ formatTime(duration) }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button 
                @click="cycleSpeed"
                class="hover:text-white font-bold text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
              >
                {{ playbackRate }}x
              </button>
              <button @click="toggleMute" class="hover:text-white transition">
                <svg v-if="isMuted || volume === 0" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import Hls from 'hls.js';
import type { MediaItem } from '../types';
import { useHistoryStore } from '../stores/history';
import { STREAMING_SERVERS, getStreamUrlForServer } from '../services/streamingServers';

const props = defineProps<{
  isOpen: boolean;
  media: MediaItem | null;
  streamUrl?: string;
  streamType?: 'hls' | 'mp4' | 'youtube' | 'embed';
  episode?: { season: number; number: number; title: string };
  hasNextEpisode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'next-episode'): void;
}>();

const historyStore = useHistoryStore();

const playerContainer = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);

let hlsInstance: Hls | null = null;
let controlsTimeout: any = null;
let saveInterval: any = null;

const selectedServerId = ref(localStorage.getItem('WATCHFLIX_PREFERRED_SERVER') || 'vidlink');

const isPlaying = ref(false);
const isBuffering = ref(false);
const isMuted = ref(false);
const volume = ref(1);
const currentTime = ref(0);
const duration = ref(0);
const playbackRate = ref(1);
const isFullscreen = ref(false);
const showControls = ref(true);

const title = computed(() => {
  return props.media?.title || props.media?.name || 'WatchFlix Movie';
});

const episodeInfo = computed(() => {
  if (props.episode) {
    return `Season ${props.episode.season} Episode ${props.episode.number}: ${props.episode.title}`;
  }
  return '';
});

// Determine Player Mode: embed (multi-server), direct_hls, or trailer
const currentMode = computed<'embed' | 'direct_hls' | 'trailer'>(() => {
  if (selectedServerId.value === 'trailer') return 'trailer';
  if (selectedServerId.value === 'direct_hls') return 'direct_hls';
  return 'embed';
});

// Generated embed URL for the current movie or episode
const embedSrc = computed(() => {
  if (!props.media) return '';
  const type = props.media.media_type === 'tv' ? 'tv' : 'movie';
  const id = props.media.id;
  const season = props.episode?.season || 1;
  const episode = props.episode?.number || 1;
  return getStreamUrlForServer(selectedServerId.value, type, id, season, episode);
});

const youtubeEmbedUrl = computed(() => {
  let url = props.streamUrl || props.media?.trailer_url || '';
  let videoId = '';
  if (url.includes('v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
});

const progressPercentage = computed(() => {
  if (duration.value <= 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

const handleServerChange = () => {
  localStorage.setItem('WATCHFLIX_PREFERRED_SERVER', selectedServerId.value);
  if (currentMode.value === 'direct_hls') {
    setupHlsPlayer();
  }
  recordHistory();
};

const recordHistory = () => {
  if (props.media) {
    historyStore.updateProgress(
      props.media,
      currentTime.value > 0 ? currentTime.value : 10,
      duration.value > 0 ? duration.value : 7200,
      props.episode ? {
        season: props.episode.season,
        number: props.episode.number,
        title: props.episode.title
      } : undefined,
      embedSrc.value
    );
  }
};

const handleActivity = () => {
  showControls.value = true;
  clearTimeout(controlsTimeout);
  if (isPlaying.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false;
    }, 3500);
  }
};

const setupHlsPlayer = async () => {
  await nextTick();
  const video = videoRef.value;
  if (!video || currentMode.value !== 'direct_hls') return;

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  const targetUrl = props.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  if (targetUrl.includes('.m3u8') && Hls.isSupported()) {
    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
    hlsInstance.loadSource(targetUrl);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(console.warn);
    });
  } else {
    video.src = targetUrl;
    video.load();
    video.play().catch(console.warn);
  }
};

const togglePlay = () => {
  const video = videoRef.value;
  if (!video) return;
  if (video.paused) video.play();
  else video.pause();
  handleActivity();
};

const seekRelative = (seconds: number) => {
  const video = videoRef.value;
  if (!video) return;
  video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  handleActivity();
};

const handleScrubClick = (e: MouseEvent) => {
  const video = videoRef.value;
  if (!video || duration.value <= 0) return;
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  video.currentTime = pct * duration.value;
  handleActivity();
};

const onTimeUpdate = () => {
  if (videoRef.value) currentTime.value = videoRef.value.currentTime;
};

const onLoadedMetadata = () => {
  if (videoRef.value) duration.value = videoRef.value.duration;
};

const onVideoEnded = () => {
  isPlaying.value = false;
  if (props.hasNextEpisode) {
    emit('next-episode');
  }
};

const cycleSpeed = () => {
  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const nextIdx = (speeds.indexOf(playbackRate.value) + 1) % speeds.length;
  playbackRate.value = speeds[nextIdx];
  if (videoRef.value) videoRef.value.playbackRate = playbackRate.value;
};

const toggleMute = () => {
  if (!videoRef.value) return;
  videoRef.value.muted = !videoRef.value.muted;
  isMuted.value = videoRef.value.muted;
};

const toggleFullscreen = () => {
  if (!playerContainer.value) return;
  if (!document.fullscreenElement) {
    playerContainer.value.requestFullscreen?.().then(() => {
      isFullscreen.value = true;
    }).catch(console.warn);
  } else {
    document.exitFullscreen?.().then(() => {
      isFullscreen.value = false;
    }).catch(console.warn);
  }
};

const formatTime = (secs: number) => {
  if (!secs || isNaN(secs)) return '00:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const closePlayer = () => {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  clearInterval(saveInterval);
  clearTimeout(controlsTimeout);
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(console.warn);
  }
  emit('close');
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    recordHistory();
    if (currentMode.value === 'direct_hls') {
      setupHlsPlayer();
    }
  } else {
    closePlayer();
  }
});

watch(() => [props.streamUrl, props.episode], () => {
  if (props.isOpen) {
    recordHistory();
    if (currentMode.value === 'direct_hls') {
      setupHlsPlayer();
    }
  }
});

onUnmounted(() => {
  closePlayer();
});
</script>
