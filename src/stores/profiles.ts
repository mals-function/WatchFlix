import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DEFAULT_PROFILES, type UserProfileSlot } from '../config/appConfig';

export const useProfilesStore = defineStore('profiles', () => {
  const profiles = ref<UserProfileSlot[]>([]);
  const activeProfileId = ref<string>('profile_1');
  const showSelector = ref(false);

  const initProfiles = () => {
    const saved = localStorage.getItem('WATCHFLIX_USER_PROFILES');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          profiles.value = parsed;
        } else {
          profiles.value = [...DEFAULT_PROFILES];
        }
      } catch {
        profiles.value = [...DEFAULT_PROFILES];
      }
    } else {
      profiles.value = [...DEFAULT_PROFILES];
      saveProfiles();
    }

    const savedActiveId = localStorage.getItem('WATCHFLIX_ACTIVE_PROFILE_ID');
    if (savedActiveId && profiles.value.some(p => p.id === savedActiveId)) {
      activeProfileId.value = savedActiveId;
    } else if (profiles.value.length > 0) {
      activeProfileId.value = profiles.value[0].id;
    }
  };

  const saveProfiles = () => {
    localStorage.setItem('WATCHFLIX_USER_PROFILES', JSON.stringify(profiles.value));
  };

  const activeProfile = computed<UserProfileSlot>(() => {
    return profiles.value.find(p => p.id === activeProfileId.value) || profiles.value[0] || DEFAULT_PROFILES[0];
  });

  const selectProfile = (id: string) => {
    const exists = profiles.value.find(p => p.id === id);
    if (exists) {
      activeProfileId.value = id;
      localStorage.setItem('WATCHFLIX_ACTIVE_PROFILE_ID', id);
      showSelector.value = false;
    }
  };

  const updateProfile = (id: string, updates: Partial<Omit<UserProfileSlot, 'id'>>) => {
    const idx = profiles.value.findIndex(p => p.id === id);
    if (idx !== -1) {
      profiles.value[idx] = {
        ...profiles.value[idx],
        ...updates
      };
      saveProfiles();
    }
  };

  const openSelector = () => {
    showSelector.value = true;
  };

  const closeSelector = () => {
    showSelector.value = false;
  };

  return {
    profiles,
    activeProfileId,
    activeProfile,
    showSelector,
    initProfiles,
    selectProfile,
    updateProfile,
    openSelector,
    closeSelector,
  };
});
