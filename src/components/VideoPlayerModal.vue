<template>
  <div 
    v-if="isOpen"
    ref="playerContainer"
    class="fixed inset-0 z-50 bg-[#0a0a0c] flex flex-col select-none overflow-hidden"
    :class="{ 'fullscreen-mode': isFullscreen || isLandscape }"
    @mousemove="handleActivity"
    @touchstart="handleActivity"
  >
    <!-- Top Control Bar (Auto-hides in landscape/fullscreen) -->
    <div 
      class="z-50 bg-gradient-to-b from-black/95 via-black/80 to-transparent px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between transition-all duration-300 pointer-events-auto"
      :class="[
        (isLandscape || isFullscreen) && !showControls 
          ? '-translate-y-full opacity-0 pointer-events-none' 
          : 'translate-y-0 opacity-100',
        'safe-top'
      ]"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Close / Back Button -->
        <button 
          @click="closePlayer"
          aria-label="Back"
          class="text-white hover:text-red-500 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition shadow shrink-0 active:scale-90"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>

        <!-- Media & Episode Title -->
        <div class="min-w-0">
          <h2 class="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide truncate">
            {{ title }}
          </h2>
          <p v-if="episodeInfo" class="text-[11px] text-red-400 font-semibold truncate">
            {{ episodeInfo }}
          </p>
        </div>
      </div>

      <!-- Right Controls: uBlock Shield, Aspect Ratio, Server Selector, Fullscreen -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- uBlock & Brave Shield Indicator -->
        <div 
          class="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md border bg-emerald-950/60 border-emerald-600/60 text-emerald-300 shadow select-none"
          title="uBlock Origin & Brave Shields Active: Popups & ad trackers blocked natively at OS network layer"
        >
          <span>🛡️</span>
          <span class="hidden md:inline">uBlock Shield</span>
          <span class="text-[9px] uppercase px-1 rounded bg-emerald-900/80 text-emerald-200">
            ACTIVE
          </span>
        </div>

        <!-- Aspect Ratio Toggle (Infinix Zero 5G 20.5:9 Fit) -->
        <button 
          @click="cycleAspectRatio"
          class="flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-700 hover:border-red-500 text-neutral-200 hover:text-white transition shadow"
          :title="`Current Aspect: ${aspectRatioMode.toUpperCase()} (Click to toggle for wide screens)`"
        >
          <svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 18h16M4 6v12M20 6v12"/>
          </svg>
          <span>{{ aspectRatioMode.toUpperCase() }}</span>
        </button>

        <!-- Fullscreen Cinema Toggle -->
        <button 
          @click="toggleFullscreen"
          class="text-white hover:text-red-400 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition shadow active:scale-90"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Cinema Fullscreen'"
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

    <!-- MAIN VIEWPORT CONTAINER -->
    <div class="flex-1 w-full flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden relative">
      <!-- 1. Stream Server Embed Frame (VidLink, Embed.su, VidSrc, AutoEmbed) -->
      <div 
        v-if="currentMode === 'embed'"
        class="w-full flex items-center justify-center relative transition-all duration-300"
        :class="[
          isLandscape || isFullscreen 
            ? 'h-full w-full' 
            : aspectContainerClass
        ]"
      >
        <iframe 
          :key="embedSrc"
          :src="embedSrc" 
          class="w-full h-full border-0 transition-transform duration-300" 
          :class="iframeAspectClass"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowfullscreen
          referrerpolicy="origin"
        ></iframe>

        <!-- Quick floating server switcher when in landscape/fullscreen -->
        <div 
          v-if="(isLandscape || isFullscreen) && showControls" 
          class="absolute bottom-3 left-0 right-0 z-40 flex items-center justify-center gap-1.5 px-4 overflow-x-auto no-scrollbar pointer-events-auto transition-opacity duration-300 animate-fadeIn"
        >
          <button 
            v-for="srv in STREAMING_SERVERS" 
            :key="srv.id"
            @click="selectedServerId = srv.id; handleServerChange()"
            class="text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition shadow"
            :class="[
              selectedServerId === srv.id 
                ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-400' 
                : 'bg-black/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
            ]"
          >
            {{ srv.name.split(' ')[0] + ' ' + (srv.name.split(' ')[1] || '') }}
          </button>
        </div>
      </div>

      <!-- 2. Official YouTube Trailer View -->
      <div 
        v-else-if="currentMode === 'trailer'" 
        class="w-full flex items-center justify-center relative"
        :class="[isLandscape || isFullscreen ? 'h-full w-full' : 'w-full aspect-video max-w-4xl']"
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
        class="w-full relative flex items-center justify-center bg-black"
        :class="[isLandscape || isFullscreen ? 'h-full w-full' : 'w-full aspect-video max-w-4xl']"
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

          <!-- Center Controls -->
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

          <!-- Bottom Scrub Bar -->
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

      <!-- PORTRAIT MODE COMPREHENSIVE CONTROLS PANEL (Below video on mobile) -->
      <div 
        v-if="!isLandscape && !isFullscreen" 
        class="w-full flex-1 max-w-2xl px-4 py-4 space-y-4 text-white overflow-y-auto"
      >
        <!-- Cinema Rotation Quick Callout -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-950/60 via-neutral-900 to-neutral-900 border border-red-900/40 shadow-lg">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">📱</span>
            <div>
              <div class="text-xs font-bold text-white">Full Screen Cinema Mode</div>
              <div class="text-[10px] text-neutral-400">Optimized for Infinix Zero 5G & modern displays</div>
            </div>
          </div>
          <button 
            @click="toggleFullscreen"
            class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs transition active:scale-95 flex items-center gap-1 shadow-md cursor-pointer"
          >
            <span>Cinema</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
          </button>
        </div>

        <!-- Server Selector Matrix -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-neutral-300">
            <span>Fast Streaming Servers</span>
            <span class="text-[10px] text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              uBlock Protection Active
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="srv in STREAMING_SERVERS" 
              :key="srv.id"
              @click="selectedServerId = srv.id; handleServerChange()"
              class="p-2.5 rounded-xl border text-left transition transform active:scale-95 flex flex-col justify-between"
              :class="[
                selectedServerId === srv.id 
                  ? 'bg-red-950/60 border-red-600 ring-2 ring-red-600/40 text-white' 
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 text-neutral-300'
              ]"
            >
              <div class="flex items-center justify-between w-full mb-1">
                <span class="text-xs font-bold truncate">{{ srv.name }}</span>
                <span 
                  class="text-[9px] font-black px-1.5 py-0.2 rounded uppercase"
                  :class="[selectedServerId === srv.id ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400']"
                >
                  {{ srv.badge }}
                </span>
              </div>
              <div class="text-[10px] text-neutral-400">
                {{ selectedServerId === srv.id ? '● Currently Playing' : 'Tap to switch server' }}
              </div>
            </button>
          </div>
        </div>

        <!-- Next Episode if TV Series -->
        <div v-if="hasNextEpisode" class="pt-2">
          <button 
            @click="$emit('next-episode')"
            class="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow"
          >
            <span>Play Next Episode</span>
            <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
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

// Default server: Server 1 (Embed.su HD) or preferred
const selectedServerId = ref(localStorage.getItem('WATCHFLIX_PREFERRED_SERVER') || 'embed_su');

const isPlaying = ref(false);
const isBuffering = ref(false);
const isMuted = ref(false);
const volume = ref(1);
const currentTime = ref(0);
const duration = ref(0);
const playbackRate = ref(1);
const isFullscreen = ref(false);
const showControls = ref(true);

// Aspect ratio modes: '16:9' standard, '21:9' cinema (matches Infinix Zero 5G 20.5:9), 'fill' full bleed
const aspectRatioMode = ref<'16:9' | '21:9' | 'fill'>('16:9');
const isLandscape = ref(window.innerWidth > window.innerHeight);

const handleResize = () => {
  isLandscape.value = window.innerWidth > window.innerHeight;
};

const cycleAspectRatio = () => {
  if (aspectRatioMode.value === '16:9') {
    aspectRatioMode.value = '21:9';
  } else if (aspectRatioMode.value === '21:9') {
    aspectRatioMode.value = 'fill';
  } else {
    aspectRatioMode.value = '16:9';
  }
};

const aspectContainerClass = computed(() => {
  if (aspectRatioMode.value === '21:9') {
    return 'w-full aspect-[21/9] max-h-[70vh] bg-black shadow-2xl';
  }
  if (aspectRatioMode.value === 'fill') {
    return 'w-full h-[55vh] bg-black shadow-2xl';
  }
  return 'w-full aspect-video max-h-[60vh] bg-black shadow-2xl';
});

const iframeAspectClass = computed(() => {
  if (aspectRatioMode.value === 'fill') {
    return 'object-cover scale-[1.02]';
  }
  return 'object-contain';
});

const title = computed(() => {
  return props.media?.title || props.media?.name || '5MWatchStream';
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
  controlsTimeout = setTimeout(() => {
    if (isLandscape.value || isFullscreen.value) {
      showControls.value = false;
    }
  }, 3500);
};

const setupHlsPlayer = async () => {
  await nextTick();
  const video = videoRef.value;
  if (!video || currentMode.value !== 'direct_hls') return;

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  const src = props.streamUrl || '';
  if (!src) return;

  if (Hls.isSupported() && (src.includes('.m3u8') || props.streamType === 'hls')) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hlsInstance.loadSource(src);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(console.warn);
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl') || src.endsWith('.mp4')) {
    video.src = src;
    video.play().catch(console.warn);
  }
};

const togglePlay = () => {
  const video = videoRef.value;
  if (!video) return;
  if (video.paused) {
    video.play().catch(console.warn);
  } else {
    video.pause();
  }
};

const seekRelative = (seconds: number) => {
  const video = videoRef.value;
  if (!video) return;
  video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
};

const handleScrubClick = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  if (!target || !videoRef.value || duration.value <= 0) return;
  const rect = target.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  videoRef.value.currentTime = ratio * duration.value;
};

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime;
  }
};

const onLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
  }
};

const onVideoEnded = () => {
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
      // Try to orient to landscape if supported
      try {
        (screen.orientation as any)?.lock?.('landscape').catch(() => {});
      } catch (e) {}
    }).catch(console.warn);
  } else {
    document.exitFullscreen?.().then(() => {
      isFullscreen.value = false;
      try {
        (screen.orientation as any)?.unlock?.();
      } catch (e) {}
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
  try {
    (screen.orientation as any)?.unlock?.();
  } catch (e) {}
  emit('close');
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    recordHistory();
    if (currentMode.value === 'direct_hls') {
      setupHlsPlayer();
    }
    window.addEventListener('resize', handleResize);
    handleResize();
  } else {
    closePlayer();
    window.removeEventListener('resize', handleResize);
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

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize();
});

onUnmounted(() => {
  closePlayer();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.safe-top {
  padding-top: max(0.75rem, env(safe-area-inset-top));
}
.fullscreen-mode {
  background-color: #000000;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
