import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSupabase } from '../services/supabase';
import type { UserProfile } from '../types';

export const useUserStore = defineStore('user', () => {
  const user = ref<UserProfile | null>(null);
  const session = ref<any>(null);
  const loading = ref(false);
  const isGuest = ref(false);

  // Initialize from existing local state or Supabase session
  const initUser = async () => {
    loading.value = true;
    const savedGuest = localStorage.getItem('WATCHFLIX_GUEST_USER');
    if (savedGuest) {
      user.value = JSON.parse(savedGuest);
      isGuest.value = true;
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user) {
          session.value = currentSession;
          isGuest.value = false;
          await fetchProfile(currentSession.user.id, currentSession.user.email!);
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (_event, newSession) => {
          session.value = newSession;
          if (newSession?.user) {
            isGuest.value = false;
            await fetchProfile(newSession.user.id, newSession.user.email!);
          } else if (!isGuest.value) {
            user.value = null;
          }
        });
      } catch (err) {
        console.warn('Supabase auth getSession error:', err);
      }
    }

    // Default demo user if neither is present
    if (!user.value) {
      loginAsGuest('WatchFlix Member');
    }
    loading.value = false;
  };

  const fetchProfile = async (userId: string, email: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        user.value = {
          id: data.id,
          email: data.email || email,
          username: data.username || email.split('@')[0],
          avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          is_admin: data.is_admin || false,
        };
      } else {
        user.value = {
          id: userId,
          email,
          username: email.split('@')[0],
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          is_admin: false,
        };
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }
  };

  const loginAsGuest = (customName?: string) => {
    isGuest.value = true;
    const guestUser: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      email: 'guest@watchflix.local',
      username: customName || 'Netflix Fan',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      is_admin: true, // Allow admin stream testing in guest mode
    };
    user.value = guestUser;
    localStorage.setItem('WATCHFLIX_GUEST_USER', JSON.stringify(guestUser));
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Configure Supabase URL & Key in Settings.');
    }
    loading.value = true;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    loading.value = false;
    if (error) throw error;
    if (data.user) {
      isGuest.value = false;
      localStorage.removeItem('WATCHFLIX_GUEST_USER');
      await fetchProfile(data.user.id, data.user.email!);
    }
    return data;
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Configure Supabase URL & Key in Settings.');
    }
    loading.value = true;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || email.split('@')[0] }
      }
    });
    loading.value = false;
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    session.value = null;
    user.value = null;
    localStorage.removeItem('WATCHFLIX_GUEST_USER');
    loginAsGuest('WatchFlix Member');
  };

  return {
    user,
    session,
    loading,
    isGuest,
    initUser,
    signIn,
    signUp,
    signOut,
    loginAsGuest,
  };
});
