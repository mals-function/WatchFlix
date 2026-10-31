// Default embedded configuration for WatchFlix
// Standard users will never see these or need to configure them.
// Only accessible and updatable via the separate Admin Portal.

export const EMBEDDED_CONFIG = {
  // TMDB API Token / Key
  TMDB_API_KEY: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMTkxMWI0NjhjM2E5MTU3OTk0MzdhYjQxOGQ3NTM5YyIsIm5iZiI6MTc5MzQ0NDg5NS41MzQwMDAyLCJzdWIiOiI2YWU1Y2MxZjkzNmYzNmRkODEwN2Y4ZjQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.VkZeugRynj4s1XvM53dQz1bGoscxStJqM2bYE-tHdME',

  // Watchmode API Key (Can be updated in Admin Portal)
  WATCHMODE_API_KEY: '',

  // Supabase Cloud Project URL & Anon Key (Can be updated in Admin Portal)
  SUPABASE_URL: 'https://watchflix-app.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWZlcnJlciI6ImFkbWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM2NDk2MDAsImV4cCI6MjAyMDY0OTYwMH0.mock_key_watchflix_production_embed',

  // Default master Admin PIN to unlock the separate Admin Portal
  ADMIN_PIN: '8888',

  // Default region for streaming providers availability
  DEFAULT_REGION: 'US',
};

export interface UserProfileSlot {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  pin?: string;
  createdAt: string;
}

// 5 Netflix-style customizable profiles with animated avatars
export const DEFAULT_PROFILES: UserProfileSlot[] = [
  {
    id: 'profile_1',
    name: 'Home',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    isKids: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'profile_2',
    name: 'Movie Buff',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Titan&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    isKids: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'profile_3',
    name: 'Series Fan',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Ruby&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    isKids: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'profile_4',
    name: 'Kids',
    avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    isKids: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'profile_5',
    name: 'Anime',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Aria&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    isKids: false,
    createdAt: new Date().toISOString()
  }
];

export interface AvatarCategory {
  id: string;
  label: string;
  style: string;
  avatars: string[];
}

export const ANIMATED_AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    id: 'adventurer',
    label: 'Anime & Heroes',
    style: 'adventurer',
    avatars: [
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Aiden&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Kai&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    ]
  },
  {
    id: 'bottts',
    label: 'Cyber Bots',
    style: 'bottts',
    avatars: [
      'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Nexus&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Vortex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Titan&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Bolt&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Echo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Matrix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    ]
  },
  {
    id: 'fun-emoji',
    label: '3D Emojis',
    style: 'fun-emoji',
    avatars: [
      'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Wink&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Star&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Fire&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Magic&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Neon&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Hero&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    ]
  },
  {
    id: 'lorelei',
    label: 'Stylized Art',
    style: 'lorelei',
    avatars: [
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Amber&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Ethan&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Oliver&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Ruby&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Milo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Chloe&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Jasper&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    ]
  },
  {
    id: 'micah',
    label: 'Chibi & Pop',
    style: 'micah',
    avatars: [
      'https://api.dicebear.com/7.x/micah/svg?seed=Aria&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/micah/svg?seed=Jack&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/micah/svg?seed=Lily&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/micah/svg?seed=Noah&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/micah/svg?seed=Mia&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/micah/svg?seed=Liam&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/micah/svg?seed=Emma&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
      'https://api.dicebear.com/7.x/micah/svg?seed=Lucas&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    ]
  }
];

export const AVATAR_OPTIONS: string[] = ANIMATED_AVATAR_CATEGORIES.flatMap(c => c.avatars);

export const generateCustomAvatar = (style: string = 'adventurer', seed: string = ''): string => {
  const safeSeed = encodeURIComponent(seed.trim() || Math.random().toString(36).substring(2, 9));
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safeSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};
