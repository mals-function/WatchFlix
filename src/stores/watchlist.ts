import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSupabase } from '../services/supabase';
import { useUserStore } from './user';
import type { MediaItem } from '../types';

export const useWatchlistStore = defineStore('watchlist', () => {
  const watchlist = ref<MediaItem[]>([]);
  const loading = ref(false);

  const loadWatchlist = async () => {
    loading.value = true;
    const userStore = useUserStore();
    const supabase = getSupabase();

    if (supabase && userStore.user && !userStore.isGuest) {
      try {
        const { data, error } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('user_id', userStore.user.id)
          .order('added_at', { ascending: false });

        if (data && !error) {
          watchlist.value = data.map((item: any) => ({
            id: item.media_id,
            title: item.title,
            media_type: item.media_type,
            overview: item.overview,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: Number(item.rating) || 0,
            release_date: item.release_date,
          }));
          loading.value = false;
          return;
        }
      } catch (err) {
        console.warn('Watchlist fetch from Supabase failed, falling back to local storage:', err);
      }
    }

    // Local storage fallback
    const local = localStorage.getItem('WATCHFLIX_WATCHLIST');
    if (local) {
      try {
        watchlist.value = JSON.parse(local);
      } catch {
        watchlist.value = [];
      }
    }
    loading.value = false;
  };

  const isInWatchlist = (mediaId: string | number): boolean => {
    return watchlist.value.some(item => String(item.id) === String(mediaId));
  };

  const toggleWatchlist = async (media: MediaItem) => {
    const exists = isInWatchlist(media.id);
    if (exists) {
      await removeFromWatchlist(media.id);
    } else {
      await addToWatchlist(media);
    }
  };

  const addToWatchlist = async (media: MediaItem) => {
    if (isInWatchlist(media.id)) return;
    watchlist.value.unshift(media);
    localStorage.setItem('WATCHFLIX_WATCHLIST', JSON.stringify(watchlist.value));

    const userStore = useUserStore();
    const supabase = getSupabase();
    if (supabase && userStore.user && !userStore.isGuest) {
      try {
        await supabase.from('user_watchlist').upsert({
          user_id: userStore.user.id,
          media_id: String(media.id),
          media_type: media.media_type,
          title: media.title || media.name || '',
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          overview: media.overview,
          rating: media.vote_average,
          release_date: media.release_date || media.first_air_date,
        }, { onConflict: 'user_id,media_id,media_type' });
      } catch (err) {
        console.warn('Failed to save to Supabase watchlist:', err);
      }
    }
  };

  const removeFromWatchlist = async (mediaId: string | number) => {
    watchlist.value = watchlist.value.filter(item => String(item.id) !== String(mediaId));
    localStorage.setItem('WATCHFLIX_WATCHLIST', JSON.stringify(watchlist.value));

    const userStore = useUserStore();
    const supabase = getSupabase();
    if (supabase && userStore.user && !userStore.isGuest) {
      try {
        await supabase
          .from('user_watchlist')
          .delete()
          .eq('user_id', userStore.user.id)
          .eq('media_id', String(mediaId));
      } catch (err) {
        console.warn('Failed to delete from Supabase watchlist:', err);
      }
    }
  };

  return {
    watchlist,
    loading,
    loadWatchlist,
    isInWatchlist,
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  };
});
