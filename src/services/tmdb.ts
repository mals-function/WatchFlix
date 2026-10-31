import type { MediaItem, StreamingProvider } from '../types';

const DEFAULT_TMDB_API_KEY = '45db073573c0f4f6e4d4ff46b41cb765'; // Public development key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getTmdbApiKey = (): string => {
  return localStorage.getItem('WATCHFLIX_TMDB_API_KEY') || (import.meta as any).env?.VITE_TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
};

export const setTmdbApiKey = (key: string) => {
  localStorage.setItem('WATCHFLIX_TMDB_API_KEY', key.trim());
};

// High quality fallback mock data for instant offline & first-time preview
const MOCK_ITEMS: MediaItem[] = [
  {
    id: 111110,
    title: 'Stranger Things',
    media_type: 'tv',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    vote_average: 8.6,
    first_air_date: '2016-07-15',
    genre_ids: [18, 9648, 10765],
    trailer_url: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    providers: [
      { provider_id: 8, provider_name: 'Netflix', logo_path: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg', type: 'flatrate' }
    ]
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    media_type: 'movie',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520023.jpg',
    vote_average: 8.3,
    release_date: '2024-02-27',
    genre_ids: [878, 12],
    trailer_url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    providers: [
      { provider_id: 1899, provider_name: 'Max', logo_path: '/f5F4cRh8cbj57p6A3g6T0R2H8m9.jpg', type: 'flatrate' },
      { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2Z7b3eK6mG304O0mpD.jpg', type: 'rent' }
    ]
  },
  {
    id: 94605,
    title: 'Arcane',
    media_type: 'tv',
    overview: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    poster_path: '/fqldrq26q7ioG3i6xs2KiMdSIJJ.jpg',
    backdrop_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    vote_average: 8.7,
    first_air_date: '2021-11-06',
    genre_ids: [16, 10765, 18],
    trailer_url: 'https://www.youtube.com/watch?v=fXmAurh012s',
    providers: [
      { provider_id: 8, provider_name: 'Netflix', logo_path: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg', type: 'flatrate' }
    ]
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    media_type: 'movie',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB1jv8uaC.jpg',
    vote_average: 7.7,
    release_date: '2024-07-24',
    genre_ids: [28, 35, 878],
    trailer_url: 'https://www.youtube.com/watch?v=73_1biulkYk',
    providers: [
      { provider_id: 337, provider_name: 'Disney Plus', logo_path: '/7rwgQI5a5BPco4YPRb3ALDHZhMm.jpg', type: 'flatrate' }
    ]
  },
  {
    id: 106379,
    title: 'Fallout',
    media_type: 'tv',
    overview: 'The story of haves and have-nots in a world in which there\'s almost nothing left to have. 200 years after the apocalypse, the gentle denizens of luxury fallout shelters are forced to return to the irradiated hellscape their ancestors left behind.',
    poster_path: '/ans4Uf3Jm8930bE5iJ2d9jQkK6F.jpg',
    backdrop_path: '/2rmK7mnchw9Xr3XdiTFSxTT09qv.jpg',
    vote_average: 8.4,
    first_air_date: '2024-04-10',
    genre_ids: [10765, 18, 10759],
    trailer_url: 'https://www.youtube.com/watch?v=V-mugKDQDlg',
    providers: [
      { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2Z7b3eK6mG304O0mpD.jpg', type: 'flatrate' }
    ]
  }
];

export const tmdbFetch = async (endpoint: string, params: Record<string, string> = {}) => {
  const apiKey = getTmdbApiKey();
  const query = new URLSearchParams({
    api_key: apiKey,
    include_adult: 'false',
    language: 'en-US',
    ...params,
  });

  try {
    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`TMDB HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`TMDB API call failed for ${endpoint}:`, error);
    return null;
  }
};

const mapTmdbItem = (item: any, explicitType?: 'movie' | 'tv'): MediaItem => {
  const media_type = explicitType || item.media_type || (item.title ? 'movie' : 'tv');
  return {
    id: item.id,
    title: item.title || item.name || 'Untitled',
    name: item.name,
    original_title: item.original_title || item.original_name,
    media_type: media_type as 'movie' | 'tv',
    overview: item.overview || 'No overview available.',
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path || item.poster_path,
    vote_average: Math.round((item.vote_average || 0) * 10) / 10,
    release_date: item.release_date || item.first_air_date,
    first_air_date: item.first_air_date,
    genre_ids: item.genre_ids || [],
    genres: item.genres,
    runtime: item.runtime,
    number_of_seasons: item.number_of_seasons,
    number_of_episodes: item.number_of_episodes,
  };
};

export const tmdbService = {
  // Trending Movies and TV Shows
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<MediaItem[]> {
    const data = await tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
    if (data?.results && data.results.length > 0) {
      return data.results.map((item: any) => mapTmdbItem(item));
    }
    return MOCK_ITEMS;
  },

  // Netflix Originals (using TMDB discover TV network 213)
  async getNetflixOriginals(): Promise<MediaItem[]> {
    const data = await tmdbFetch('/discover/tv', {
      with_networks: '213',
      sort_by: 'popularity.desc'
    });
    if (data?.results && data.results.length > 0) {
      return data.results.map((item: any) => mapTmdbItem(item, 'tv'));
    }
    return MOCK_ITEMS.filter(item => item.media_type === 'tv');
  },

  // Popular Movies
  async getPopularMovies(): Promise<MediaItem[]> {
    const data = await tmdbFetch('/movie/popular');
    if (data?.results && data.results.length > 0) {
      return data.results.map((item: any) => mapTmdbItem(item, 'movie'));
    }
    return MOCK_ITEMS.filter(item => item.media_type === 'movie');
  },

  // Top Rated Movies
  async getTopRatedMovies(): Promise<MediaItem[]> {
    const data = await tmdbFetch('/movie/top_rated');
    if (data?.results && data.results.length > 0) {
      return data.results.map((item: any) => mapTmdbItem(item, 'movie'));
    }
    return MOCK_ITEMS.filter(item => item.media_type === 'movie');
  },

  // Popular Series
  async getPopularSeries(): Promise<MediaItem[]> {
    const data = await tmdbFetch('/tv/popular');
    if (data?.results && data.results.length > 0) {
      return data.results.map((item: any) => mapTmdbItem(item, 'tv'));
    }
    return MOCK_ITEMS.filter(item => item.media_type === 'tv');
  },

  // Discover by Genre or Provider
  async discover(mediaType: 'movie' | 'tv', options: { genreId?: number; providerId?: number; sortBy?: string } = {}): Promise<MediaItem[]> {
    const params: Record<string, string> = {
      sort_by: options.sortBy || 'popularity.desc'
    };
    if (options.genreId) params.with_genres = options.genreId.toString();
    if (options.providerId) {
      params.with_watch_providers = options.providerId.toString();
      params.watch_region = 'US';
    }

    const data = await tmdbFetch(`/discover/${mediaType}`, params);
    if (data?.results && data.results.length > 0) {
      return data.results.map((item: any) => mapTmdbItem(item, mediaType));
    }
    return [];
  },

  // Search Movies & TV Shows
  async searchMulti(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return [];
    const data = await tmdbFetch('/search/multi', { query: query.trim() });
    if (data?.results) {
      return data.results
        .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
        .map((item: any) => mapTmdbItem(item));
    }
    return [];
  },

  // Get full Details with videos and watch providers
  async getDetails(id: string | number, mediaType: 'movie' | 'tv'): Promise<MediaItem | null> {
    const data = await tmdbFetch(`/${mediaType}/${id}`, {
      append_to_response: 'videos,credits,watch/providers,similar'
    });

    if (!data) {
      const fallback = MOCK_ITEMS.find(m => String(m.id) === String(id));
      return fallback || null;
    }

    const item = mapTmdbItem(data, mediaType);
    
    // Extract YouTube trailer if present
    const videos = data.videos?.results || [];
    const trailer = videos.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos[0];
    if (trailer) {
      item.trailer_url = `https://www.youtube.com/watch?v=${trailer.key}`;
    }

    // Extract Watch Providers
    const providersUS = data['watch/providers']?.results?.US || data['watch/providers']?.results?.[Object.keys(data['watch/providers']?.results || {})[0]];
    if (providersUS) {
      const providersList: StreamingProvider[] = [];
      const addList = (list: any[], type: 'flatrate' | 'rent' | 'buy' | 'free') => {
        if (!list) return;
        for (const p of list) {
          if (!providersList.find(existing => existing.provider_id === p.provider_id)) {
            providersList.push({
              provider_id: p.provider_id,
              provider_name: p.provider_name,
              logo_path: p.logo_path,
              display_priority: p.display_priority,
              type
            });
          }
        }
      };

      addList(providersUS.flatrate, 'flatrate');
      addList(providersUS.free, 'free');
      addList(providersUS.rent, 'rent');
      addList(providersUS.buy, 'buy');
      item.providers = providersList;
    }

    return item;
  }
};
