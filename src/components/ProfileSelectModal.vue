<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 bg-[#141414] flex flex-col items-center justify-center p-4 select-none animate-fadeIn"
  >
    <!-- Netflix Brand Header -->
    <div class="absolute top-6 left-6 sm:left-10 flex items-center">
      <span class="text-2xl sm:text-3xl font-black text-red-600 tracking-tighter drop-shadow">
        WATCHFLIX
      </span>
    </div>

    <!-- Title -->
    <h1 class="text-2xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight mb-8 sm:mb-12 text-center">
      {{ isManaging ? 'Manage Profiles:' : "Who's Watching?" }}
    </h1>

    <!-- 5 Profiles Grid -->
    <div class="flex flex-wrap items-center justify-center gap-5 sm:gap-8 max-w-4xl mx-auto">
      <div 
        v-for="profile in profilesStore.profiles" 
        :key="profile.id"
        class="group flex flex-col items-center cursor-pointer transition transform active:scale-95"
        @click="handleProfileClick(profile)"
      >
        <!-- Profile Avatar Box -->
        <div class="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition-all shadow-xl bg-neutral-900">
          <img 
            :src="profile.avatar" 
            :alt="profile.name" 
            class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            :class="{ 'opacity-60 brightness-75': isManaging }"
          />

          <!-- Kids Badge -->
          <div 
            v-if="profile.isKids && !isManaging" 
            class="absolute bottom-1 right-1 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase"
          >
            Kids
          </div>

          <!-- Edit Pencil Overlay in Manage Mode -->
          <div 
            v-if="isManaging" 
            class="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition"
          >
            <div class="w-10 h-10 rounded-full bg-black/70 border border-white text-white flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
          </div>

          <!-- Active Profile Indicator Border -->
          <div 
            v-if="profilesStore.activeProfileId === profile.id && !isManaging"
            class="absolute inset-0 border-2 border-red-600 rounded-md pointer-events-none"
          ></div>
        </div>

        <!-- Profile Name -->
        <span 
          class="mt-3 text-sm sm:text-base font-medium text-neutral-400 group-hover:text-white transition text-center truncate max-w-[120px]"
        >
          {{ profile.name }}
        </span>
      </div>
    </div>

    <!-- Manage Profiles Action Button -->
    <div class="mt-12 sm:mt-16">
      <button 
        @click="isManaging = !isManaging"
        class="border border-neutral-500 hover:border-white text-neutral-400 hover:text-white font-semibold text-xs sm:text-sm uppercase tracking-widest px-6 py-2 rounded-none transition active:scale-95"
      >
        {{ isManaging ? 'Done' : 'Manage Profiles' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProfilesStore } from '../stores/profiles';
import type { UserProfileSlot } from '../config/appConfig';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit-profile', profile: UserProfileSlot): void;
  (e: 'selected', profile: UserProfileSlot): void;
}>();

const profilesStore = useProfilesStore();
const isManaging = ref(false);

const handleProfileClick = (profile: UserProfileSlot) => {
  if (isManaging.value) {
    emit('edit-profile', profile);
  } else {
    profilesStore.selectProfile(profile.id);
    emit('selected', profile);
    emit('close');
  }
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
