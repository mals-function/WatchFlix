import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile } from '../types';

export interface AuthAccount extends UserProfile {
  role: 'admin' | 'user';
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<AuthAccount | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const isGuest = ref(false);

  const isAdmin = computed(() => {
    return currentUser.value?.is_admin === true || currentUser.value?.role === 'admin';
  });

  const initUser = async () => {
    loading.value = true;
    const saved = localStorage.getItem('WATCHFLIX_CURRENT_ACCOUNT');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.username === 'admin' || parsed.username === 'user')) {
          currentUser.value = parsed;
          isAuthenticated.value = true;
          isGuest.value = parsed.username === 'user';
          loading.value = false;
          return;
        }
      } catch (e) {
        console.warn('Failed to parse saved account:', e);
      }
    }

    const lastUsername = localStorage.getItem('WATCHFLIX_LAST_USERNAME');
    if (lastUsername === 'admin') {
      login('admin', 'admin');
    } else {
      login('user', 'user');
    }
    loading.value = false;
  };

  const login = (usernameInput: string, passwordInput: string): { success: boolean; message?: string } => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if (u === 'admin' && p === 'admin') {
      const adminAcc: AuthAccount = {
        id: 'acc_admin',
        username: 'admin',
        email: 'admin@watchflix.local',
        role: 'admin',
        is_admin: true,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      };
      currentUser.value = adminAcc;
      isAuthenticated.value = true;
      isGuest.value = false;
      localStorage.setItem('WATCHFLIX_CURRENT_ACCOUNT', JSON.stringify(adminAcc));
      localStorage.setItem('WATCHFLIX_LAST_USERNAME', 'admin');
      return { success: true };
    }

    if (u === 'user' && p === 'user') {
      const userAcc: AuthAccount = {
        id: 'acc_user',
        username: 'user',
        email: 'user@watchflix.local',
        role: 'user',
        is_admin: false,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
      };
      currentUser.value = userAcc;
      isAuthenticated.value = true;
      isGuest.value = true;
      localStorage.setItem('WATCHFLIX_CURRENT_ACCOUNT', JSON.stringify(userAcc));
      localStorage.setItem('WATCHFLIX_LAST_USERNAME', 'user');
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Invalid credentials. Use admin/admin for Admin or user/user for User.' 
    };
  };

  const signIn = async (email: string, password: string) => {
    const res = login(email, password);
    if (!res.success) throw new Error(res.message);
    return res;
  };

  const signUp = async (email: string, password: string, _username?: string) => {
    return signIn(email, password);
  };

  const loginAsGuest = () => {
    login('user', 'user');
  };

  const logout = () => {
    currentUser.value = null;
    isAuthenticated.value = false;
    isGuest.value = true;
    localStorage.removeItem('WATCHFLIX_CURRENT_ACCOUNT');
  };

  return {
    user: currentUser,
    isAuthenticated,
    isAdmin,
    isGuest,
    loading,
    initUser,
    login,
    signIn,
    signUp,
    loginAsGuest,
    logout,
  };
});
