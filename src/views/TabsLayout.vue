<template>
  <ion-page class="w-full h-full bg-[#141414] text-white overflow-hidden flex flex-col">
    <!-- Top Global Sticky Navbar -->
    <Navbar 
      :active-tab="currentTab"
      :user-avatar="profilesStore.activeProfile.avatar || userStore.user?.avatar_url"
      :profile-name="profilesStore.activeProfile.name || userStore.user?.username"
      :is-admin="userStore.isAdmin"
      @nav="setTab"
      @open-search="setTab('search')"
      @open-profile-switcher="isProfileSelectOpen = true"
      @open-admin-portal="handleOpenAdminPortal"
    />

    <!-- Main View Content that scrolls independently -->
    <main id="main-content" class="flex-1 w-full overflow-y-auto overflow-x-hidden relative">
      <HomeTab 
        v-if="currentTab === 'home'" 
        @update:tab="setTab"
        @play="handlePlay" 
        @detail="handleOpenDetail" 
      />
      <CatalogGridView 
        v-else-if="currentTab === 'movies'"
        type="movie"
        title="MOVIES"
        subtitle="Blockbusters, classics, and hidden gems for movie night"
        @play="handlePlay" 
        @detail="handleOpenDetail" 
      />
      <CatalogGridView 
        v-else-if="currentTab === 'series'"
        type="tv"
        title="TV SERIES"
        subtitle="Binge-worthy shows for every mood"
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
        @open-admin-portal="handleOpenAdminPortal"
        @switch-account="isLoginOpen = true"
      />
    </main>

    <!-- Mobile Bottom Tab Bar (Pinned firmly to bottom) -->
    <nav 
      class="md:hidden flex-none z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-neutral-900 px-6 pt-2.5 flex items-center justify-between select-none shadow-2xl"
      style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 12px);"
    >
      <!-- Home Tab -->
      <button 
        @click="setTab('home')" 
        class="flex flex-col items-center gap-1.5 transition active:scale-90 touch-manipulation py-1"
        :class="[currentTab === 'home' || currentTab === 'movies' || currentTab === 'series' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400']"
      >
        <div class="relative flex items-center justify-center">
          <svg 
            class="w-5 h-5 transition-transform duration-200" 
            :class="[currentTab === 'home' || currentTab === 'movies' || currentTab === 'series' ? 'scale-110 text-white' : 'text-neutral-500']" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span v-if="currentTab === 'home' || currentTab === 'movies' || currentTab === 'series'" class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-600 shadow-[0_0_8px_#e50914]"></span>
        </div>
        <span class="text-[10px] font-bold tracking-tight">Home</span>
      </button>

      <!-- Search Tab -->
      <button 
        @click="setTab('search')" 
        class="flex flex-col items-center gap-1.5 transition active:scale-90 touch-manipulation py-1"
        :class="[currentTab === 'search' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400']"
      >
        <div class="relative flex items-center justify-center">
          <svg 
            class="w-5 h-5 transition-transform duration-200" 
            :class="[currentTab === 'search' ? 'scale-110 text-white' : 'text-neutral-500']" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span v-if="currentTab === 'search'" class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-600 shadow-[0_0_8px_#e50914]"></span>
        </div>
        <span class="text-[10px] font-bold tracking-tight">Search</span>
      </button>

      <!-- My List Tab -->
      <button 
        @click="setTab('watchlist')" 
        class="flex flex-col items-center gap-1.5 transition active:scale-90 touch-manipulation py-1"
        :class="[currentTab === 'watchlist' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400']"
      >
        <div class="relative flex items-center justify-center">
          <svg 
            class="w-5 h-5 transition-transform duration-200" 
            :class="[currentTab === 'watchlist' ? 'scale-110 text-white' : 'text-neutral-500']" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
          <span v-if="currentTab === 'watchlist'" class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-600 shadow-[0_0_8px_#e50914]"></span>
        </div>
        <span class="text-[10px] font-bold tracking-tight">My List</span>
      </button>

      <!-- Profile Tab -->
      <button 
        @click="setTab('profile')" 
        class="flex flex-col items-center gap-1.5 transition active:scale-90 touch-manipulation py-1"
        :class="[currentTab === 'profile' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400']"
      >
        <div class="relative flex items-center justify-center">
          <img 
            :src="profilesStore.activeProfile.avatar" 
            alt="User Profile" 
            class="w-5 h-5 rounded-full object-cover border transition-transform duration-200"
            :class="[currentTab === 'profile' ? 'scale-110 border-red-600 ring-2 ring-red-600/50' : 'border-neutral-700']"
          />
          <span v-if="currentTab === 'profile'" class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-600 shadow-[0_0_8px_#e50914]"></span>
        </div>
        <span class="text-[10px] font-bold tracking-tight">Profile</span>
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

    <!-- 5MWatchStream Modern Authentication Modal -->
    <LoginModal 
      :is-open="isLoginOpen || !userStore.isAuthenticated"
      :allow-close="userStore.isAuthenticated"
      @close="isLoginOpen = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonPage } from '@ionic/vue';
import type { MediaItem, Episode } from '../types';
import type { UserProfileSlot } from '../config/appConfig';
import { tmdbService } from '../services/tmdb';
import { tvmazeService } from '../services/tvmaze';
import { watchmodeService } from '../services/watchmode';
import { useUserStore } from '../stores/user';
import { useSettingsStore } from '../stores/settings';
import { useProfilesStore } from '../stores/profiles';
import { useWatchlistStore } from '../stores/watchlist';
import { useHistoryStore } from '../stores/history';
import { useCustomStreamsStore } from '../stores/customStreams';

import Navbar from '../components/Navbar.vue';
import HomeTab from './HomeTab.vue';
import CatalogGridView from '../components/CatalogGridView.vue';
import SearchTab from './SearchTab.vue';
import WatchlistTab from './WatchlistTab.vue';
import ProfileTab from './ProfileTab.vue';

import VideoPlayerModal from '../components/VideoPlayerModal.vue';
import MediaDetailModal from '../components/MediaDetailModal.vue';
import ProfileSelectModal from '../components/ProfileSelectModal.vue';
import EditProfileModal from '../components/EditProfileModal.vue';
import AdminPortalModal from '../components/AdminPortalModal.vue';
import AdminStreamModal from '../components/AdminStreamModal.vue';
import LoginModal from '../components/LoginModal.vue';

const userStore = useUserStore();
const settingsStore = useSettingsStore();
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
const isLoginOpen = ref(false);

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
  await userStore.initUser();
  profilesStore.initProfiles();
  await Promise.all([
    watchlistStore.loadWatchlist(),
    historyStore.loadHistory(),
    customStreamsStore.loadStreams(),
  ]);
});

const handleOpenAdminPortal = () => {
  if (userStore.isAdmin) {
    settingsStore.isAdminUnlocked = true;
  }
  isAdminPortalOpen.value = true;
};

const setTab = (tab: string) => {
  currentTab.value = tab;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const scroller = document.getElementById('main-content');
  if (scroller) {
    scroller.scrollTo({ top: 0, behavior: 'smooth' });
  }
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

  // Check if a direct custom HLS/MP4 stream was assigned in Admin
  const custom = customStreamsStore.getStreamForMedia(media.id, episode?.season, episode?.number);
  if (custom) {
    activeStreamUrl.value = custom.stream_url;
    activeStreamType.value = custom.stream_type;
  } else if (media.custom_stream_url) {
    activeStreamUrl.value = media.custom_stream_url;
    activeStreamType.value = 'hls';
  } else {
    // Default to multi-server embed stream (Server 1: VidLink, Server 2: VidSrc, etc.)
    activeStreamUrl.value = undefined;
    activeStreamType.value = 'embed';
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
