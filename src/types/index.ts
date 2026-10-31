export type MediaType = 'movie' | 'tv' | 'custom';

export interface MediaItem {
  id: string | number;
  title: string;
  name?: string;
  original_title?: string;
  media_type: MediaType;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  trailer_url?: string;
  providers?: StreamingProvider[];
  custom_stream_url?: string;
}

export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
  type?: 'flatrate' | 'rent' | 'buy' | 'free';
}

export interface Episode {
  id: number | string;
  name: string;
  season: number;
  number: number;
  summary?: string;
  image?: {
    medium?: string;
    original?: string;
  };
  airdate?: string;
  runtime?: number;
  stream_url?: string;
}

export interface WatchHistoryItem {
  id: string;
  user_id?: string;
  media_id: string;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season_number?: number;
  episode_number?: number;
  episode_title?: string;
  progress_seconds: number;
  duration_seconds: number;
  percentage: number;
  completed: boolean;
  last_watched_at: string;
  stream_url?: string;
}

export interface CustomStream {
  id: string;
  media_id: string;
  media_type: MediaType;
  title: string;
  season_number?: number;
  episode_number?: number;
  stream_url: string;
  stream_type: 'hls' | 'mp4' | 'embed' | 'youtube';
  quality_label: string;
  subtitles_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  is_admin?: boolean;
}
