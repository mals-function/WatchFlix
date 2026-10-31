import type { Episode } from '../types';

const TVMAZE_BASE = 'https://api.tvmaze.com';

export const tvmazeService = {
  // Search TV show by title and get all episodes
  async getShowEpisodes(showTitle: string): Promise<Episode[]> {
    if (!showTitle) return [];
    try {
      const cleanTitle = encodeURIComponent(showTitle.trim());
      const res = await fetch(`${TVMAZE_BASE}/singlesearch/shows?q=${cleanTitle}&embed=episodes`);
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      const rawEpisodes = data?._embedded?.episodes || [];

      return rawEpisodes.map((ep: any) => ({
        id: ep.id,
        name: ep.name || `Episode ${ep.number}`,
        season: ep.season || 1,
        number: ep.number || 1,
        summary: ep.summary ? ep.summary.replace(/<[^>]*>?/gm, '') : 'No episode description available.',
        image: ep.image,
        airdate: ep.airdate,
        runtime: ep.runtime
      }));
    } catch (error) {
      console.warn('TVmaze fetch failed:', error);
      return [];
    }
  }
};
