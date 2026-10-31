<template>
  <div class="relative min-h-screen bg-[#141414] text-white">
    <!-- Top Global Sticky Navbar -->
    <Navbar 
      :active-tab="currentTab"
      :user-avatar="profilesStore.activeProfile.avatar"
      :profile-name="profilesStore.activeProfile.name"
      @nav="setTab"
      @open-search="setTab('search')"
      @open-profile-switcher="isProfileSelectOpen = true"
    />

    <!-- Main View Content according to selected tab -->
    <main class="w-full">
      <HomeTab 
        v-if="currentTab === 'home' || currentTab === 'movies' || currentTab === 'series'" 
        @play="handlePlay" 
        @detail="handleOpenDetail" 
      />
      <SearchTab 
        v-else-if="currentTab === 'search'" 
        @detail="handleOpenDetail" 
      />
      <WatchlistTab 
        v-else-if="currentTab === 'watchlist'" 
        @play="handlePlay" 
        @detail="handleOpenDetail" 
      />
      <ProfileTab 
        v-else-if="currentTab === 'profile'" 
        @switch-profile="isProfileSelectOpen = true"
        @manage-profiles="isProfileSelectOpen = true"
        @edit-current-profile="openEditProfile(profilesStore.activeProfile)"
        @open-admin-portal="isAdminPortalOpen = true"
      />
    </main>

    <!-- Mobile Bottom Tab Bar (Netflix Style) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-neutral-900 px-6 py-2 flex items-center justify-between">
      <!-- Home Tab -->
      <button 
        @click="setTab('home')" 
        class="flex flex-col items-center gap-1 transition"
        :class="[currentTab === 'home' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400']"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <span class="text-[10px] font-semibold">Home</span>
      </button>

      <!-- Search Tab -->
      <button 
        @click="setTab('search')" 
        class="flex flex-col items-center gap-1 transition"
        :class="[currentTab === 'search' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400']"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span class="text-[10px] font-semibold">Search</span>
      </button>

      <!-- My List Tab -->
      <button 
        @click="setTab('watchlist')" 
        class="flex flex-col items-center gap-1 transition"
        :class="[currentTab === 'watchlist' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400']"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
        <span class="text-[10px] font-semibold">My List</span>
      </button>

      <!-- Profile Tab -->
      <button 
        @click="setTab('profile')" 
        class="flex flex-col items-center gap-1 transition"
        :class="[currentTab === 'profile' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400']"
      >
        <img 
          :src="profilesStore.activeProfile.avatar" 
          alt="User Profile" 
          class="w-5 h-5 rounded-full object-cover border"
          :class="[currentTab === 'profile' ? 'border-red-600 ring-2 ring-red-600/50' : 'border-neutral-700']"
        />
        <span class="text-[10px] font-semibold">Profile</span>
      </button>
    </nav>

    <!-- Global Video Player Modal -->
    <VideoPlayerModal 
      :is-open="isPlayerOpen"
      :media="activeMedia"
      :stream-url="activeStreamUrl"
      :stream-type="activeStreamType"
      :episode="activeEpisode"
      :has-next-episode="hasNextEpisode"
      @close="isPlayerOpen = false"
      @next-episode="playNextEpisode"
    />

    <!-- Global Media Details Modal -->
    <MediaDetailModal 
      :is-open="isDetailOpen"
      :media="activeMedia"
      :in-watchlist="isDetailInWatchlist"
      :is-admin="false"
      :episodes="detailEpisodes"
      :episodes-loading="episodesLoading"
      :has-custom-stream="hasActiveCustomStream"
      @close="isDetailOpen = false"
      @play="handlePlay"
      @play-trailer="handlePlayTrailer"
      @toggle-watchlist="toggleWatchlist"
      @play-episode="handlePlayEpisode"
    />

    <!-- Netflix 5-Profile Selector ("Who's Watching?") -->
    <ProfileSelectModal 
      :is-open="isProfileSelectOpen"
      @close="isProfileSelectOpen = false"
      @selected="onProfileSelected"
      @edit-profile="openEditProfile"
    />

    <!-- Profile Customization Modal -->
    <EditProfileModal 
      :is-open="isEditProfileOpen"
      :profile="selectedProfileToEdit"
      @close="isEditProfileOpen = false"
    />

    <!-- Separate Admin Portal (PIN Protected) -->
    <AdminPortalModal 
      :is-open="isAdminPortalOpen"
      @close="isAdminPortalOpen = false"
      @open-add-stream="openAdminAddStream"
    />

    <!-- Admin Custom Stream Creator Modal -->
    <AdminStreamModal 
      :is-open="isAdminStreamModalOpen"
      :prefill-media="adminPrefillMedia"
      @close="isAdminStreamModalOpen = false"
      @saved="customStreamsStore.loadStreams"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { MediaItem, Episode } from '../types';
import type { UserProfileSlot } from '../config/appConfig';
import { tmdbService } from '../services/tmdb';
import { tvmazeService } from '../services/tvmaze';
import { watchmodeService } from '../services/watchmode';
import { useProfilesStore } from '../stores/profiles';
import { useWatchlistStore } from '../stores/watchlist';
import { useHistoryStore } from '../stores/history';
import { useCustomStreamsStore } from '../stores/customStreams';

import Navbar from '../components/Navbar.vue';
import HomeTab from './HomeTab.vue';
import SearchTab from './SearchTab.vue';
import WatchlistTab from './WatchlistTab.vue';
import ProfileTab from './ProfileTab.vue';

import VideoPlayerModal from '../components/VideoPlayerModal.vue';
import MediaDetailModal from '../components/MediaDetailModal.vue';
import ProfileSelectModal from '../components/ProfileSelectModal.vue';
import EditProfileModal from '../components/EditProfileModal.vue';
import AdminPortalModal from '../components/AdminPortalModal.vue';
import AdminStreamModal from '../components/AdminStreamModal.vue';

const profilesStore = useProfilesStore();
const watchlistStore = useWatchlistStore();
const historyStore = useHistoryStore();
const customStreamsStore = useCustomStreamsStore();

const currentTab = ref('home');

// Modals State
const isPlayerOpen = ref(false);
const isDetailOpen = ref(false);
const isProfileSelectOpen = ref(false);
const isEditProfileOpen = ref(false);
const isAdminPortalOpen = ref(false);
const isAdminStreamModalOpen = ref(false);

const selectedProfileToEdit = ref<UserProfileSlot | null>(null);
const adminPrefillMedia = ref<MediaItem | null>(null);

const activeMedia = ref<MediaItem | null>(null);
const activeStreamUrl = ref<string | undefined>(undefined);
const activeStreamType = ref<'hls' | 'mp4' | 'youtube' | 'embed'>('hls');
const activeEpisode = ref<{ season: number; number: number; title: string } | undefined>(undefined);

const detailEpisodes = ref<Episode[]>([]);
const episodesLoading = ref(false);

const isDetailInWatchlist = computed(() => {
  return activeMedia.value ? watchlistStore.isInWatchlist(activeMedia.value.id) : false;
});

const hasActiveCustomStream = computed(() => {
  if (!activeMedia.value) return false;
  return Boolean(customStreamsStore.getStreamForMedia(activeMedia.value.id));
});

const hasNextEpisode = computed(() => {
  if (!activeEpisode.value || detailEpisodes.value.length === 0) return false;
  const currentIdx = detailEpisodes.value.findIndex(
    e => e.season === activeEpisode.value?.season && e.number === activeEpisode.value?.number
  );
  return currentIdx >= 0 && currentIdx < detailEpisodes.value.length - 1;
});

onMounted(async () => {
  profilesStore.initProfiles();
  await Promise.all([
    watchlistStore.loadWatchlist(),
    historyStore.loadHistory(),
    customStreamsStore.loadStreams(),
  ]);
});

const setTab = (tab: string) => {
  currentTab.value = tab;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const onProfileSelected = async (_profile: UserProfileSlot) => {
  await Promise.all([
    watchlistStore.loadWatchlist(),
    historyStore.loadHistory(),
  ]);
};

const openEditProfile = (profile: UserProfileSlot) => {
  selectedProfileToEdit.value = profile;
  isEditProfileOpen.value = true;
};

// Opening Media Detail
const handleOpenDetail = async (media: MediaItem) => {
  activeMedia.value = media;
  detailEpisodes.value = [];
  isDetailOpen.value = true;

  // Enrich with full details from TMDB
  if (media.media_type === 'movie' || media.media_type === 'tv') {
    const fullDetails = await tmdbService.getDetails(media.id, media.media_type);
    if (fullDetails) {
      activeMedia.value = { ...media, ...fullDetails };
    }
  }

  // Also query Watchmode if configured
  const title = media.title || media.name || '';
  const watchmodeSources = await watchmodeService.getStreamingSources(title, media.id);
  if (watchmodeSources && watchmodeSources.length > 0) {
    activeMedia.value = {
      ...activeMedia.value,
      providers: [...(activeMedia.value.providers || []), ...watchmodeSources]
    };
  }

  // Load TV episodes if TV series
  if (media.media_type === 'tv') {
    episodesLoading.value = true;
    try {
      detailEpisodes.value = await tvmazeService.getShowEpisodes(title);
    } finally {
      episodesLoading.value = false;
    }
  }
};

// Playing Media
const handlePlay = (media: MediaItem, episode?: { season: number; number: number; title: string }) => {
  activeMedia.value = media;
  activeEpisode.value = episode;

  // Check custom stream store first
  const custom = customStreamsStore.getStreamForMedia(media.id, episode?.season, episode?.number);
  if (custom) {
    activeStreamUrl.value = custom.stream_url;
    activeStreamType.value = custom.stream_type;
  } else if (media.custom_stream_url) {
    activeStreamUrl.value = media.custom_stream_url;
    activeStreamType.value = 'hls';
  } else if (media.trailer_url) {
    activeStreamUrl.value = media.trailer_url;
    activeStreamType.value = 'youtube';
  } else {
    // Demo HLS stream
    activeStreamUrl.value = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    activeStreamType.value = 'hls';
  }

  isDetailOpen.value = false;
  isPlayerOpen.value = true;
};

const handlePlayTrailer = (media: MediaItem) => {
  activeMedia.value = media;
  activeEpisode.value = undefined;
  activeStreamUrl.value = media.trailer_url;
  activeStreamType.value = 'youtube';
  isPlayerOpen.value = true;
};

const handlePlayEpisode = (episode: Episode) => {
  if (!activeMedia.value) return;
  handlePlay(activeMedia.value, {
    season: episode.season,
    number: episode.number,
    title: episode.name,
  });
};

const playNextEpisode = () => {
  if (!activeEpisode.value || detailEpisodes.value.length === 0 || !activeMedia.value) return;
  const currentIdx = detailEpisodes.value.findIndex(
    e => e.season === activeEpisode.value?.season && e.number === activeEpisode.value?.number
  );
  if (currentIdx >= 0 && currentIdx < detailEpisodes.value.length - 1) {
    const nextEp = detailEpisodes.value[currentIdx + 1];
    handlePlayEpisode(nextEp);
  }
};

const toggleWatchlist = (media: MediaItem) => {
  watchlistStore.toggleWatchlist(media);
};

const openAdminAddStream = () => {
  adminPrefillMedia.value = null;
  isAdminStreamModalOpen.value = true;
};
</script>
