<template>
  <div 
    v-if="isOpen && profile" 
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-md bg-[#181818] rounded-xl border border-neutral-800 text-white p-6 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <h3 class="text-base font-bold text-white">Edit Profile</h3>
        <button 
          @click="$emit('close')"
          aria-label="Close"
          class="text-neutral-400 hover:text-white p-1 rounded-full transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="mt-4 space-y-5">
        <!-- Current Avatar Preview & Name Input -->
        <div class="flex items-center gap-4">
          <img 
            :src="selectedAvatar" 
            alt="Profile Avatar" 
            class="w-16 h-16 rounded-md object-cover border-2 border-red-600 shadow"
          />
          <div class="flex-1">
            <label class="block text-xs font-semibold text-neutral-300 mb-1">
              Profile Name
            </label>
            <input 
              v-model="editName" 
              type="text" 
              maxlength="20"
              class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        <!-- Kids Mode Toggle -->
        <div class="flex items-center justify-between p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
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

        <!-- Choose an Avatar -->
        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-2">
            Choose an Avatar
          </label>
          <div class="grid grid-cols-5 gap-2.5">
            <button 
              v-for="(avatarUrl, idx) in AVATAR_OPTIONS" 
              :key="idx"
              @click="selectedAvatar = avatarUrl"
              class="relative rounded-md overflow-hidden aspect-square border-2 transition active:scale-95"
              :class="[selectedAvatar === avatarUrl ? 'border-red-600 scale-105 shadow-md' : 'border-transparent hover:border-neutral-500']"
            >
              <img :src="avatarUrl" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-3 flex items-center justify-end gap-3 border-t border-neutral-800">
          <button 
            @click="$emit('close')"
            class="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button 
            @click="handleSave"
            class="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useProfilesStore } from '../stores/profiles';
import { AVATAR_OPTIONS, type UserProfileSlot } from '../config/appConfig';

const props = defineProps<{
  isOpen: boolean;
  profile: UserProfileSlot | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const profilesStore = useProfilesStore();

const editName = ref('');
const selectedAvatar = ref('');
const isKids = ref(false);

watch(() => props.profile, (p) => {
  if (p) {
    editName.value = p.name;
    selectedAvatar.value = p.avatar;
    isKids.value = p.isKids;
  }
}, { immediate: true });

const handleSave = () => {
  if (props.profile && editName.value.trim()) {
    profilesStore.updateProfile(props.profile.id, {
      name: editName.value.trim(),
      avatar: selectedAvatar.value,
      isKids: isKids.value,
    });
    emit('close');
  }
};
</script>
