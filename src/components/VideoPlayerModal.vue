<template>
  <div 
    v-if="isOpen"
    ref="playerContainer"
    class="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    @mousemove="handleActivity"
    @touchstart="handleActivity"
  >
    <!-- 1. Native / HLS HTML5 Video Player -->
    <video
      v-if="!isYoutubeTrailer"
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

    <!-- 2. YouTube Trailer Embed Fallback -->
    <div v-else class="w-full h-full flex items-center justify-center relative">
      <iframe 
        :src="youtubeEmbedUrl" 
        class="w-full h-full border-0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen
      ></iframe>
      <!-- Close Button for YouTube view -->
      <button 
        @click="closePlayer"
        class="absolute top-4 left-4 z-50 bg-black/70 hover:bg-black text-white p-3 rounded-full backdrop-blur-md transition"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
      </button>
    </div>

    <!-- Buffering Spinner -->
    <div 
      v-if="isBuffering && !isYoutubeTrailer"
      class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
    >
      <div class="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Video Controls Overlay -->
    <div 
      v-if="!isYoutubeTrailer"
      class="absolute inset-0 flex flex-col justify-between pointer-events-none transition-opacity duration-300 z-40 bg-gradient-to-t from-black/80 via-transparent to-black/60"
      :class="{ 'opacity-100 pointer-events-auto': showControls, 'opacity-0': !showControls }"
    >
      <!-- Top Bar: Back, Title, Quality/Stream info -->
      <div class="p-4 sm:p-6 flex items-center justify-between pointer-events-auto">
        <div class="flex items-center gap-4">
          <button 
            @click="closePlayer"
            aria-label="Back"
            class="text-white hover:text-red-500 p-2 rounded-full hover:bg-white/10 transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-white tracking-wide">
              {{ title }}
            </h2>
            <p v-if="episodeTitle" class="text-xs text-neutral-300">
              {{ episodeTitle }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Stream Type Badge -->
          <span class="text-[10px] bg-red-600/90 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">
            {{ streamType.toUpperCase() }}
          </span>

          <!-- Quality Selector (HLS levels) -->
          <div v-if="qualityLevels.length > 1" class="relative">
            <select 
              v-model="currentQualityIndex" 
              @change="changeQuality"
              class="bg-black/60 border border-neutral-700 text-white text-xs rounded px-2 py-1 outline-none focus:border-red-600"
            >
              <option :value="-1">Auto</option>
              <option v-for="(q, idx) in qualityLevels" :key="idx" :value="idx">
                {{ q.height ? `${q.height}p` : `Level ${idx + 1}` }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Center Controls: Rewind, Play/Pause, Fast Forward -->
      <div class="flex items-center justify-center gap-8 sm:gap-14 pointer-events-auto">
        <!-- Rewind 10s -->
        <button 
          @click="seekRelative(-10)"
          aria-label="Rewind 10s"
          class="text-white hover:text-red-500 transition transform hover:scale-110 active:scale-95 flex flex-col items-center"
        >
          <svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/>
          </svg>
          <span class="text-[10px] mt-0.5 font-bold">-10s</span>
        </button>

        <!-- Big Play / Pause Button -->
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

        <!-- Forward 10s -->
        <button 
          @click="seekRelative(10)"
          aria-label="Forward 10s"
          class="text-white hover:text-red-500 transition transform hover:scale-110 active:scale-95 flex flex-col items-center"
        >
          <svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/>
          </svg>
          <span class="text-[10px] mt-0.5 font-bold">+10s</span>
        </button>
      </div>

      <!-- Bottom Bar: Timeline Slider, Timestamps, Speed, Next Ep, Fullscreen -->
      <div class="p-4 sm:p-6 space-y-2 pointer-events-auto">
        <!-- Scrub Bar -->
        <div class="relative flex items-center group cursor-pointer" @click="handleScrubClick">
          <div class="w-full h-1.5 group-hover:h-2.5 bg-white/20 rounded-full overflow-hidden transition-all relative">
            <!-- Progress Bar -->
            <div 
              class="h-full bg-red-600 rounded-full relative"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <!-- Thumb Knob -->
          <div 
            class="absolute w-4 h-4 bg-red-600 rounded-full shadow-md transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{ left: `${progressPercentage}%` }"
          ></div>
        </div>

        <!-- Controls Row -->
        <div class="flex items-center justify-between text-xs sm:text-sm text-neutral-300">
          <!-- Time Display -->
          <div class="flex items-center gap-2 font-mono">
            <span>{{ formatTime(currentTime) }}</span>
            <span>/</span>
            <span>{{ formatTime(duration) }}</span>
          </div>

          <!-- Right Controls -->
          <div class="flex items-center gap-4">
            <!-- Next Episode Button -->
            <button 
              v-if="hasNextEpisode"
              @click="$emit('next-episode')"
              class="flex items-center gap-1 text-xs font-semibold hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition"
            >
              <span>Next Ep</span>
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            <!-- Playback Speed -->
            <div class="relative">
              <button 
                @click="cycleSpeed"
                class="hover:text-white font-bold text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
              >
                {{ playbackRate }}x
              </button>
            </div>

            <!-- Volume / Mute -->
            <button 
              @click="toggleMute"
              class="hover:text-white transition"
            >
              <svg v-if="isMuted || volume === 0" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              </svg>
            </button>

            <!-- Fullscreen -->
            <button 
              @click="toggleFullscreen"
              class="hover:text-white transition"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import Hls from 'hls.js';
import type { MediaItem } from '../types';
import { useHistoryStore } from '../stores/history';

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

const isPlaying = ref(false);
const isBuffering = ref(false);
const isMuted = ref(false);
const volume = ref(1);
const currentTime = ref(0);
const duration = ref(0);
const playbackRate = ref(1);
const isFullscreen = ref(false);
const showControls = ref(true);

const qualityLevels = ref<any[]>([]);
const currentQualityIndex = ref(-1);

const title = computed(() => {
  return props.media?.title || props.media?.name || 'WatchFlix Video';
});

const episodeTitle = computed(() => {
  if (props.episode) {
    return `Season ${props.episode.season} Episode ${props.episode.number}: ${props.episode.title}`;
  }
  return '';
});

const streamType = computed(() => {
  if (props.streamType) return props.streamType;
  if (props.streamUrl?.includes('.m3u8')) return 'hls';
  if (props.streamUrl?.includes('youtube.com') || props.streamUrl?.includes('youtu.be')) return 'youtube';
  if (!props.streamUrl && props.media?.trailer_url) return 'youtube';
  return 'mp4';
});

const isYoutubeTrailer = computed(() => {
  return streamType.value === 'youtube';
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

// Controls visibility management
const handleActivity = () => {
  showControls.value = true;
  clearTimeout(controlsTimeout);
  if (isPlaying.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false;
    }, 3500);
  }
};

const setupVideoSource = async () => {
  await nextTick();
  const video = videoRef.value;
  if (!video || isYoutubeTrailer.value) return;

  // Cleanup old HLS instance
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  // Determine stream source URL
  // If no custom stream assigned, provide the reliable Big Buck Bunny HLS adaptive test stream!
  const targetUrl = props.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  // Check saved progress in history
  const savedProgress = props.media ? historyStore.getProgress(props.media.id, props.episode?.season, props.episode?.number) : null;
  const initialSeek = savedProgress && !savedProgress.completed ? savedProgress.progress_seconds : 0;

  if (targetUrl.includes('.m3u8') && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hlsInstance.loadSource(targetUrl);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
      qualityLevels.value = data.levels;
      if (initialSeek > 0) {
        video.currentTime = initialSeek;
      }
      video.play().catch(console.warn);
    });

    hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.warn('HLS fatal error, attempting recovery:', data);
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hlsInstance?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hlsInstance?.recoverMediaError();
            break;
          default:
            hlsInstance?.destroy();
            break;
        }
      }
    });
  } else {
    // Native HLS (Safari/iOS) or MP4/WebM
    video.src = targetUrl;
    video.load();
    if (initialSeek > 0) {
      video.currentTime = initialSeek;
    }
    video.play().catch(console.warn);
  }

  // Periodic history progress saving every 5 seconds
  clearInterval(saveInterval);
  saveInterval = setInterval(() => {
    saveCurrentProgress();
  }, 5000);
};

const saveCurrentProgress = () => {
  if (props.media && duration.value > 0 && currentTime.value > 0) {
    historyStore.updateProgress(
      props.media,
      currentTime.value,
      duration.value,
      props.episode ? {
        season: props.episode.season,
        number: props.episode.number,
        title: props.episode.title
      } : undefined,
      props.streamUrl
    );
  }
};

const togglePlay = () => {
  const video = videoRef.value;
  if (!video) return;
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
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
  const video = videoRef.value;
  if (!video) return;
  currentTime.value = video.currentTime;
};

const onLoadedMetadata = () => {
  const video = videoRef.value;
  if (!video) return;
  duration.value = video.duration;
};

const onVideoEnded = () => {
  isPlaying.value = false;
  saveCurrentProgress();
  if (props.hasNextEpisode) {
    emit('next-episode');
  }
};

const cycleSpeed = () => {
  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const nextIdx = (speeds.indexOf(playbackRate.value) + 1) % speeds.length;
  playbackRate.value = speeds[nextIdx];
  if (videoRef.value) {
    videoRef.value.playbackRate = playbackRate.value;
  }
};

const toggleMute = () => {
  const video = videoRef.value;
  if (!video) return;
  video.muted = !video.muted;
  isMuted.value = video.muted;
};

const changeQuality = () => {
  if (hlsInstance) {
    hlsInstance.currentLevel = currentQualityIndex.value;
  }
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
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const closePlayer = () => {
  saveCurrentProgress();
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
    setupVideoSource();
  } else {
    closePlayer();
  }
});

watch(() => [props.streamUrl, props.episode], () => {
  if (props.isOpen) {
    setupVideoSource();
  }
});

onUnmounted(() => {
  closePlayer();
});
</script>
