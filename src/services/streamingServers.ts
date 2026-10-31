export interface StreamingServer {
  id: string;
  name: string;
  badge: string;
  getUrl: (type: 'movie' | 'tv', id: string | number, season?: number, episode?: number) => string;
}

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: 'embed_su',
    name: 'Server 1 (Embed.su HD)',
    badge: '1080p • Clean',
    getUrl: (type, id, season = 1, episode = 1) => 
      type === 'movie' 
        ? `https://embed.su/embed/movie/${id}` 
        : `https://embed.su/embed/tv/${id}/${season}/${episode}`
  },
  {
    id: 'vidlink',
    name: 'Server 2 (VidLink Pro)',
    badge: 'Fast • Multi-Audio',
    getUrl: (type, id, season = 1, episode = 1) => 
      type === 'movie' 
        ? `https://vidlink.pro/movie/${id}?primaryColor=e50914&autoplay=true` 
        : `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=e50914&autoplay=true`
  },
  {
    id: 'vidsrc_icu',
    name: 'Server 3 (VidSrc ICU)',
    badge: 'Multi-Source',
    getUrl: (type, id, season = 1, episode = 1) => 
      type === 'movie' 
        ? `https://vidsrc.icu/embed/movie/${id}` 
        : `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`
  },
  {
    id: 'vidsrc_cc',
    name: 'Server 4 (VidSrc VIP)',
    badge: '1080p FHD',
    getUrl: (type, id, season = 1, episode = 1) => 
      type === 'movie' 
        ? `https://vidsrc.cc/v2/embed/movie/${id}` 
        : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
  },
  {
    id: 'autoembed',
    name: 'Server 5 (AutoEmbed)',
    badge: 'Reliable',
    getUrl: (type, id, season = 1, episode = 1) => 
      type === 'movie' 
        ? `https://player.autoembed.cc/embed/movie/${id}` 
        : `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
  },
  {
    id: 'multiembed',
    name: 'Server 6 (MultiEmbed)',
    badge: 'Direct',
    getUrl: (type, id, season = 1, episode = 1) => 
      type === 'movie' 
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1` 
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
  },
  {
    id: 'smashystream',
    name: 'Server 7 (SmashyStream)',
    badge: 'Backup',
    getUrl: (type, id, season = 1, episode = 1) => 
      type === 'movie' 
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}` 
        : `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`
  }
];

export const getStreamUrlForServer = (
  serverId: string,
  type: 'movie' | 'tv',
  id: string | number,
  season: number = 1,
  episode: number = 1
): string => {
  const server = STREAMING_SERVERS.find(s => s.id === serverId) || STREAMING_SERVERS[0];
  return server.getUrl(type, id, season, episode);
};
