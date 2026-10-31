import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile } from '../types';

export interface AuthAccount extends UserProfile {
  role: 'admin' | 'user';
  password?: string;
}

const INITIAL_ACCOUNTS: AuthAccount[] = [
  {
    id: 'acc_admin',
    username: 'admin',
    password: 'admin',
    email: 'admin@5mwatchstream.com',
    role: 'admin',
    is_admin: true,
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  },
  {
    id: 'acc_user',
    username: 'user',
    password: 'user',
    email: 'user@5mwatchstream.com',
    role: 'user',
    is_admin: false,
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  }
];

function getAccountsDB(): AuthAccount[] {
  try {
    const raw = localStorage.getItem('WATCHFLIX_ACCOUNTS_DB');
    if (!raw) {
      localStorage.setItem('WATCHFLIX_ACCOUNTS_DB', JSON.stringify(INITIAL_ACCOUNTS));
      return [...INITIAL_ACCOUNTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  localStorage.setItem('WATCHFLIX_ACCOUNTS_DB', JSON.stringify(INITIAL_ACCOUNTS));
  return [...INITIAL_ACCOUNTS];
}

function saveAccountToDB(account: AuthAccount) {
  const db = getAccountsDB();
  const idx = db.findIndex(a => a.username.toLowerCase() === account.username.toLowerCase());
  if (idx >= 0) {
    db[idx] = account;
  } else {
    db.push(account);
  }
  localStorage.setItem('WATCHFLIX_ACCOUNTS_DB', JSON.stringify(db));
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<AuthAccount | null>(INITIAL_ACCOUNTS[1]);
  const isAuthenticated = ref(true);
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
        if (parsed && parsed.username) {
          currentUser.value = parsed;
          isAuthenticated.value = true;
          isGuest.value = parsed.role !== 'admin';
          loading.value = false;
          return;
        }
      } catch (e) {
        console.warn('Failed to parse saved account:', e);
      }
    }

    const lastUsername = localStorage.getItem('WATCHFLIX_LAST_USERNAME');
    const db = getAccountsDB();
    if (lastUsername) {
      const existing = db.find(a => a.username.toLowerCase() === lastUsername.toLowerCase());
      if (existing) {
        currentUser.value = existing;
        isAuthenticated.value = true;
        isGuest.value = existing.role !== 'admin';
        loading.value = false;
        return;
      }
    }

    // Default to user account if first run
    currentUser.value = db[1] || INITIAL_ACCOUNTS[1];
    isAuthenticated.value = true;
    isGuest.value = true;
    loading.value = false;
  };

  const login = (usernameInput: string, passwordInput: string): { success: boolean; message?: string } => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if (!u || !p) {
      return {
        success: false,
        message: 'Please enter both your username and password.'
      };
    }

    const db = getAccountsDB();
    const matched = db.find(
      a => a.username.toLowerCase() === u || a.email.toLowerCase() === u
    );

    if (matched && matched.password === p) {
      currentUser.value = matched;
      isAuthenticated.value = true;
      isGuest.value = matched.role !== 'admin';
      localStorage.setItem('WATCHFLIX_CURRENT_ACCOUNT', JSON.stringify(matched));
      localStorage.setItem('WATCHFLIX_LAST_USERNAME', matched.username);
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Invalid username or password. Please verify your credentials and try again.' 
    };
  };

  const signUp = async (usernameInput: string, passwordInput: string, emailInput?: string): Promise<{ success: boolean; message?: string }> => {
    const u = usernameInput.trim();
    const p = passwordInput.trim();
    const email = emailInput?.trim() || `${u.toLowerCase()}@5mwatchstream.com`;

    if (!u || !p) {
      return { success: false, message: 'Please provide both a username and password.' };
    }
    if (u.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (p.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const db = getAccountsDB();
    if (db.some(a => a.username.toLowerCase() === u.toLowerCase())) {
      return { success: false, message: 'Username is already taken. Please choose another.' };
    }

    const newAcc: AuthAccount = {
      id: 'acc_' + Date.now(),
      username: u,
      password: p,
      email: email,
      role: 'user',
      is_admin: false,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    };

    saveAccountToDB(newAcc);
    currentUser.value = newAcc;
    isAuthenticated.value = true;
    isGuest.value = true;
    localStorage.setItem('WATCHFLIX_CURRENT_ACCOUNT', JSON.stringify(newAcc));
    localStorage.setItem('WATCHFLIX_LAST_USERNAME', newAcc.username);

    return { success: true };
  };

  const signIn = async (usernameOrEmail: string, password: string) => {
    const res = login(usernameOrEmail, password);
    if (!res.success) throw new Error(res.message);
    return res;
  };

  const loginAsGuest = () => {
    login('user', 'user');
  };

  const updateAvatar = (newAvatarUrl: string) => {
    if (currentUser.value) {
      currentUser.value.avatar_url = newAvatarUrl;
      saveAccountToDB(currentUser.value);
      localStorage.setItem('WATCHFLIX_CURRENT_ACCOUNT', JSON.stringify(currentUser.value));
    }
  };

  const logout = () => {
    currentUser.value = null;
    isAuthenticated.value = false;
    isGuest.value = true;
    localStorage.removeItem('WATCHFLIX_CURRENT_ACCOUNT');
    localStorage.removeItem('WATCHFLIX_LAST_USERNAME');
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
    updateAvatar,
    logout,
  };
});
