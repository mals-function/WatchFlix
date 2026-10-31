import type { StreamingProvider } from '../types';
import { EMBEDDED_CONFIG } from '../config/appConfig';

const WATCHMODE_BASE = 'https://api.watchmode.com/v1';

export const getWatchmodeApiKey = (): string => {
  return localStorage.getItem('WATCHFLIX_ADMIN_WATCHMODE_API_KEY') || (import.meta as any).env?.VITE_WATCHMODE_API_KEY || EMBEDDED_CONFIG.WATCHMODE_API_KEY;
};

export const setWatchmodeApiKey = (key: string) => {
  localStorage.setItem('WATCHFLIX_ADMIN_WATCHMODE_API_KEY', key.trim());
};

export const watchmodeService = {
  async getStreamingSources(title: string, tmdbId?: number | string): Promise<StreamingProvider[]> {
    const apiKey = getWatchmodeApiKey();
    if (!apiKey) {
      return [];
    }

    try {
      // Search title id in Watchmode
      const searchRes = await fetch(`${WATCHMODE_BASE}/search/?apiKey=${apiKey}&search_field=name&search_value=${encodeURIComponent(title)}&types=movie,tv`);
      if (!searchRes.ok) return [];
      const searchData = await searchRes.json();
      const titleMatch = searchData.title_results?.[0];
      if (!titleMatch) return [];

      // Query sources
      const sourcesRes = await fetch(`${WATCHMODE_BASE}/title/${titleMatch.id}/sources/?apiKey=${apiKey}`);
      if (!sourcesRes.ok) return [];
      const sourcesData = await sourcesRes.json();

      const providers: StreamingProvider[] = [];
      const seen = new Set<string>();

      for (const src of sourcesData || []) {
        if (!seen.has(src.name)) {
          seen.add(src.name);
          providers.push({
            provider_id: src.source_id,
            provider_name: src.name,
            logo_path: src.logo_100px || '',
            type: src.type === 'sub' ? 'flatrate' : src.type === 'free' ? 'free' : 'rent'
          });
        }
      }
      return providers;
    } catch (err) {
      console.warn('Watchmode fetch failed:', err);
      return [];
    }
  }
};
