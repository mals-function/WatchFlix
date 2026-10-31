import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSupabase } from '../services/supabase';
import type { CustomStream, MediaType } from '../types';

const INITIAL_DEMO_STREAMS: CustomStream[] = [
  {
    id: 'stream_bunny',
    media_id: 'demo_1',
    media_type: 'movie',
    title: 'Big Buck Bunny (4K HLS Stream)',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    stream_type: 'hls',
    quality_label: 'Adaptive 1080p',
    is_active: true,
  },
  {
    id: 'stream_tears',
    media_id: 'demo_2',
    media_type: 'movie',
    title: 'Tears of Steel (Sci-Fi HLS Stream)',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    stream_type: 'hls',
    quality_label: '1080p HLS',
    is_active: true,
  },
  {
    id: 'stream_sintel',
    media_id: 'demo_3',
    media_type: 'movie',
    title: 'Sintel (Animation MP4 HD)',
    stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    stream_type: 'mp4',
    quality_label: '720p MP4',
    is_active: true,
  }
];

export const useCustomStreamsStore = defineStore('customStreams', () => {
  const streams = ref<CustomStream[]>([]);
  const loading = ref(false);

  const loadStreams = async () => {
    loading.value = true;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('custom_streams')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          streams.value = data;
          loading.value = false;
          return;
        }
      } catch (err) {
        console.warn('Custom streams fetch from Supabase failed:', err);
      }
    }

    const local = localStorage.getItem('WATCHFLIX_CUSTOM_STREAMS');
    if (local) {
      try {
        streams.value = JSON.parse(local);
      } catch {
        streams.value = [...INITIAL_DEMO_STREAMS];
      }
    } else {
      streams.value = [...INITIAL_DEMO_STREAMS];
      localStorage.setItem('WATCHFLIX_CUSTOM_STREAMS', JSON.stringify(streams.value));
    }
    loading.value = false;
  };

  const getStreamForMedia = (mediaId: string | number, season?: number, episode?: number): CustomStream | undefined => {
    return streams.value.find(s => {
      const idMatch = String(s.media_id) === String(mediaId);
      if (!idMatch) return false;
      if (season !== undefined && episode !== undefined) {
        return s.season_number === season && s.episode_number === episode;
      }
      return true;
    });
  };

  const addStream = async (stream: Omit<CustomStream, 'id' | 'is_active'>) => {
    const newStream: CustomStream = {
      ...stream,
      id: 'cs_' + Date.now(),
      is_active: true,
      created_at: new Date().toISOString()
    };

    streams.value.unshift(newStream);
    localStorage.setItem('WATCHFLIX_CUSTOM_STREAMS', JSON.stringify(streams.value));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('custom_streams').insert(newStream);
      } catch (err) {
        console.warn('Failed to insert custom stream to Supabase:', err);
      }
    }
    return newStream;
  };

  const removeStream = async (id: string) => {
    streams.value = streams.value.filter(s => s.id !== id);
    localStorage.setItem('WATCHFLIX_CUSTOM_STREAMS', JSON.stringify(streams.value));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('custom_streams').delete().eq('id', id);
      } catch (err) {
        console.warn('Failed to delete custom stream from Supabase:', err);
      }
    }
  };

  return {
    streams,
    loading,
    loadStreams,
    getStreamForMedia,
    addStream,
    removeStream,
  };
});
