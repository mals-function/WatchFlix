// Default embedded configuration for WatchFlix
// Standard users will never see these or need to configure them.
// Only accessible and updatable via the separate Admin Portal.

export const EMBEDDED_CONFIG = {
  // TMDB API v3 Key
  TMDB_API_KEY: '45db073573c0f4f6e4d4ff46b41cb765',

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

// 5 Netflix-style customizable profiles
export const DEFAULT_PROFILES: UserProfileSlot[] = [
  {
    id: 'profile_1',
    name: 'Home',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    isKids: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'profile_2',
    name: 'Movie Buff',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
    isKids: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'profile_3',
    name: 'Series Fan',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
    isKids: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'profile_4',
    name: 'Kids',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=160&auto=format&fit=crop&q=80',
    isKids: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'profile_5',
    name: 'Anime',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    isKids: false,
    createdAt: new Date().toISOString()
  }
];

export const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
];
