import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSupabase } from '../services/supabase';
import { useUserStore } from './user';
import { useProfilesStore } from './profiles';
import type { WatchHistoryItem, MediaItem } from '../types';

export const useHistoryStore = defineStore('history', () => {
  const history = ref<WatchHistoryItem[]>([]);
  const loading = ref(false);

  const getStorageKey = () => {
    const profilesStore = useProfilesStore();
    return `WATCHFLIX_HISTORY_${profilesStore.activeProfileId || 'default'}`;
  };

  const loadHistory = async () => {
    loading.value = true;
    const userStore = useUserStore();
    const profilesStore = useProfilesStore();
    const supabase = getSupabase();

    if (supabase && userStore.user && !userStore.isGuest) {
      try {
        const { data, error } = await supabase
          .from('watch_history')
          .select('*')
          .eq('user_id', `${userStore.user.id}_${profilesStore.activeProfileId}`)
          .order('last_watched_at', { ascending: false });

        if (data && !error) {
          history.value = data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            media_id: item.media_id,
            media_type: item.media_type,
            title: item.title,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            season_number: item.season_number,
            episode_number: item.episode_number,
            episode_title: item.episode_title,
            progress_seconds: item.progress_seconds || 0,
            duration_seconds: item.duration_seconds || 0,
            percentage: item.duration_seconds > 0 ? Math.round((item.progress_seconds / item.duration_seconds) * 100) : 0,
            completed: item.completed || false,
            last_watched_at: item.last_watched_at,
          }));
          loading.value = false;
          return;
        }
      } catch (err) {
        console.warn('History fetch from Supabase failed, falling back to local storage:', err);
      }
    }

    // Local storage fallback partitioned by active profile
    const local = localStorage.getItem(getStorageKey());
    if (local) {
      try {
        history.value = JSON.parse(local);
      } catch {
        history.value = [];
      }
    } else {
      history.value = [];
    }
    loading.value = false;
  };

  const updateProgress = async (
    media: MediaItem,
    progressSeconds: number,
    durationSeconds: number,
    episode?: { season: number; number: number; title: string },
    streamUrl?: string
  ) => {
    if (durationSeconds <= 0) return;
    const percentage = Math.min(100, Math.round((progressSeconds / durationSeconds) * 100));
    const completed = percentage >= 95;

    const existingIndex = history.value.findIndex(h => 
      h.media_id === String(media.id) && 
      (episode ? h.episode_number === episode.number && h.season_number === episode.season : true)
    );

    const historyItem: WatchHistoryItem = {
      id: existingIndex >= 0 ? history.value[existingIndex].id : 'wh_' + Date.now(),
      media_id: String(media.id),
      media_type: media.media_type,
      title: media.title || media.name || '',
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      season_number: episode?.season || 1,
      episode_number: episode?.number || 1,
      episode_title: episode?.title || '',
      progress_seconds: Math.floor(progressSeconds),
      duration_seconds: Math.floor(durationSeconds),
      percentage,
      completed,
      last_watched_at: new Date().toISOString(),
      stream_url: streamUrl
    };

    if (existingIndex >= 0) {
      history.value.splice(existingIndex, 1);
    }
    history.value.unshift(historyItem);
    localStorage.setItem(getStorageKey(), JSON.stringify(history.value));

    // Save to Supabase if authenticated
    const userStore = useUserStore();
    const profilesStore = useProfilesStore();
    const supabase = getSupabase();
    if (supabase && userStore.user && !userStore.isGuest) {
      try {
        await supabase.from('watch_history').upsert({
          user_id: `${userStore.user.id}_${profilesStore.activeProfileId}`,
          media_id: String(media.id),
          media_type: media.media_type,
          title: media.title || media.name || '',
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          season_number: episode?.season || 1,
          episode_number: episode?.number || 1,
          episode_title: episode?.title || null,
          progress_seconds: Math.floor(progressSeconds),
          duration_seconds: Math.floor(durationSeconds),
          completed,
          last_watched_at: new Date().toISOString(),
        }, { onConflict: 'user_id,media_id,season_number,episode_number' });
      } catch (err) {
        console.warn('Failed to save to Supabase history:', err);
      }
    }
  };

  const getProgress = (mediaId: string | number, season = 1, episode = 1): WatchHistoryItem | undefined => {
    return history.value.find(h => 
      String(h.media_id) === String(mediaId) && 
      h.season_number === season && 
      h.episode_number === episode
    );
  };

  const clearHistory = async () => {
    history.value = [];
    localStorage.removeItem(getStorageKey());

    const userStore = useUserStore();
    const profilesStore = useProfilesStore();
    const supabase = getSupabase();
    if (supabase && userStore.user && !userStore.isGuest) {
      try {
        await supabase.from('watch_history').delete().eq('user_id', `${userStore.user.id}_${profilesStore.activeProfileId}`);
      } catch (err) {
        console.warn('Failed to clear Supabase history:', err);
      }
    }
  };

  return {
    history,
    loading,
    loadHistory,
    updateProgress,
    getProgress,
    clearHistory,
  };
});
