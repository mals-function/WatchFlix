<template>
  <div 
    v-if="isOpen && profile" 
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-lg bg-[#181818] rounded-2xl border border-neutral-800 text-white p-5 sm:p-6 shadow-2xl my-auto">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Edit Profile & Avatar</span>
            <span class="text-[10px] bg-red-600/90 text-white font-extrabold uppercase px-2 py-0.5 rounded-full">
              Animated
            </span>
          </h3>
          <p class="text-xs text-neutral-400 mt-0.5">Customize your character, name, and preferences</p>
        </div>
        <button 
          @click="$emit('close')"
          aria-label="Close"
          class="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="mt-4 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar pr-1">
        <!-- Current Avatar Preview & Name Input -->
        <div class="flex items-center gap-4 p-3 bg-neutral-900/70 rounded-xl border border-neutral-800">
          <div class="relative">
            <img 
              :src="selectedAvatar" 
              alt="Profile Avatar" 
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-red-600 shadow-lg shadow-red-950/40 bg-neutral-800"
            />
            <button 
              @click="generateRandom"
              title="Generate Random Avatar"
              class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition active:scale-90"
            >
              🎲
            </button>
          </div>
          <div class="flex-1 min-w-0">
            <label class="block text-xs font-bold text-neutral-300 mb-1">
              Profile Name
            </label>
            <input 
              v-model="editName" 
              type="text" 
              maxlength="20"
              placeholder="Enter profile name..."
              class="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition"
            />
          </div>
        </div>

        <!-- Custom Avatar Generator Input -->
        <div class="p-3 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
          <label class="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
            <span>✨ Generate Custom Avatar by Name</span>
            <span class="text-[10px] text-neutral-400">Type any seed or name</span>
          </label>
          <div class="flex items-center gap-2">
            <input 
              v-model="customSeedInput" 
              type="text" 
              placeholder="e.g. Goku, CyberSamurai, Luna, Rex..."
              class="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
              @keyup.enter="applyCustomSeed"
            />
            <button 
              @click="applyCustomSeed"
              class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-bold rounded-lg transition border border-neutral-700 whitespace-nowrap"
            >
              Generate
            </button>
            <button 
              @click="generateRandom"
              class="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-lg transition shadow whitespace-nowrap"
            >
              🎲 Random
            </button>
          </div>
        </div>

        <!-- Animated Style Category Tabs -->
        <div>
          <label class="block text-xs font-bold text-neutral-300 mb-2">
            Browse Animated Avatar Collections
          </label>
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button 
              v-for="cat in ANIMATED_AVATAR_CATEGORIES" 
              :key="cat.id"
              @click="activeCategory = cat.id"
              class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border backdrop-blur-md cursor-pointer active:scale-95"
              :class="[
                activeCategory === cat.id 
                  ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-900/30' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
              ]"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Avatar Grid for active category -->
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mt-3 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 max-h-48 overflow-y-auto no-scrollbar">
            <button 
              v-for="(avatarUrl, idx) in currentCategoryAvatars" 
              :key="idx"
              @click="selectedAvatar = avatarUrl"
              class="relative rounded-xl overflow-hidden aspect-square border-2 transition transform active:scale-95 bg-neutral-800 hover:scale-105 cursor-pointer"
              :class="[
                selectedAvatar === avatarUrl 
                  ? 'border-red-600 ring-2 ring-red-600/50 scale-105 shadow-lg' 
                  : 'border-transparent hover:border-neutral-600'
              ]"
            >
              <img :src="avatarUrl" class="w-full h-full object-cover" loading="lazy" />
              <div v-if="selectedAvatar === avatarUrl" class="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px] font-bold">
                ✓
              </div>
            </button>
          </div>
        </div>

        <!-- Kids Mode Toggle -->
        <div class="flex items-center justify-between p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
          <div>
            <div class="text-xs font-bold text-white">Kids Profile?</div>
            <div class="text-[11px] text-neutral-400">Filters content appropriate for all ages</div>
          </div>
          <button 
            type="button" 
            @click="isKids = !isKids"
            class="w-11 h-6 flex items-center rounded-full p-1 transition duration-300"
            :class="[isKids ? 'bg-red-600' : 'bg-neutral-700']"
          >
            <div 
              class="bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300"
              :class="{ 'translate-x-5': isKids }"
            ></div>
          </button>
        </div>

        <!-- Sync With Account Avatar Checkbox -->
        <label class="flex items-center gap-2.5 p-3 bg-neutral-900/40 rounded-xl border border-neutral-800/60 cursor-pointer hover:bg-neutral-900/80 transition">
          <input 
            v-model="applyToAccount" 
            type="checkbox" 
            class="w-4 h-4 accent-red-600 rounded cursor-pointer"
          />
          <div class="text-xs">
            <span class="font-bold text-white">Also update Main Account Avatar</span>
            <span class="text-neutral-400 block text-[11px]">Syncs this animated picture to your navbar & account profile</span>
          </div>
        </label>

        <!-- Actions -->
        <div class="pt-3 flex items-center justify-end gap-3 border-t border-neutral-800">
          <button 
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition active:scale-95"
          >
            Cancel
          </button>
          <button 
            @click="handleSave"
            class="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-extrabold transition shadow-lg shadow-red-900/40 active:scale-95 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useProfilesStore } from '../stores/profiles';
import { useUserStore } from '../stores/user';
import { 
  ANIMATED_AVATAR_CATEGORIES, 
  generateCustomAvatar,
  type UserProfileSlot 
} from '../config/appConfig';

const props = defineProps<{
  isOpen: boolean;
  profile: UserProfileSlot | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const profilesStore = useProfilesStore();
const userStore = useUserStore();

const editName = ref('');
const selectedAvatar = ref('');
const isKids = ref(false);
const applyToAccount = ref(true);

const activeCategory = ref<string>('adventurer');
const customSeedInput = ref('');

const currentCategoryAvatars = computed(() => {
  const cat = ANIMATED_AVATAR_CATEGORIES.find(c => c.id === activeCategory.value);
  return cat ? cat.avatars : ANIMATED_AVATAR_CATEGORIES[0].avatars;
});

watch(() => props.profile, (p) => {
  if (p) {
    editName.value = p.name;
    selectedAvatar.value = p.avatar;
    isKids.value = p.isKids;
  }
}, { immediate: true });

const generateRandom = () => {
  const cat = ANIMATED_AVATAR_CATEGORIES.find(c => c.id === activeCategory.value) || ANIMATED_AVATAR_CATEGORIES[0];
  selectedAvatar.value = generateCustomAvatar(cat.style);
};

const applyCustomSeed = () => {
  if (!customSeedInput.value.trim()) return;
  const cat = ANIMATED_AVATAR_CATEGORIES.find(c => c.id === activeCategory.value) || ANIMATED_AVATAR_CATEGORIES[0];
  selectedAvatar.value = generateCustomAvatar(cat.style, customSeedInput.value.trim());
};

const handleSave = () => {
  if (props.profile && editName.value.trim()) {
    // 1. Update Profile Slot
    profilesStore.updateProfile(props.profile.id, {
      name: editName.value.trim(),
      avatar: selectedAvatar.value,
      isKids: isKids.value,
    });

    // 2. Optionally update Main Account Avatar
    if (applyToAccount.value) {
      userStore.updateAvatar(selectedAvatar.value);
    }

    emit('close');
  }
};
</script>
