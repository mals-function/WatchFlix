<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-55 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 select-none overflow-y-auto animate-fadeIn"
  >
    <div class="relative w-full max-w-md bg-[#181818] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white my-auto">
      <!-- Close button if already authenticated -->
      <button 
        v-if="allowClose"
        @click="$emit('close')"
        aria-label="Close"
        class="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Brand Header -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center gap-1 mb-2">
          <span class="text-3xl sm:text-4xl font-black text-red-600 tracking-tighter">
            STREAMFLIX
          </span>
        </div>
        <p class="text-xs text-neutral-400 font-medium">
          Select an account or enter your credentials
        </p>
      </div>

      <!-- Quick 1-Tap Account Selector Cards -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <!-- Admin Card -->
        <button 
          type="button" 
          @click="selectPreset('admin')"
          class="p-3.5 rounded-xl border text-left transition transform active:scale-95 flex flex-col justify-between"
          :class="[
            inputUsername === 'admin' 
              ? 'bg-red-950/40 border-red-600 ring-2 ring-red-600/50' 
              : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
          ]"
        >
          <div class="flex items-center justify-between w-full mb-2">
            <span class="text-lg">👑</span>
            <span class="text-[9px] font-black uppercase tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded">
              Admin
            </span>
          </div>
          <div>
            <div class="text-sm font-bold text-white">Admin</div>
            <div class="text-[10px] text-neutral-400">admin / admin</div>
            <div class="text-[10px] text-red-400 mt-1 font-medium">Full Watch + API Config</div>
          </div>
        </button>

        <!-- User Card -->
        <button 
          type="button" 
          @click="selectPreset('user')"
          class="p-3.5 rounded-xl border text-left transition transform active:scale-95 flex flex-col justify-between"
          :class="[
            inputUsername === 'user' 
              ? 'bg-red-950/40 border-red-600 ring-2 ring-red-600/50' 
              : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
          ]"
        >
          <div class="flex items-center justify-between w-full mb-2">
            <span class="text-lg">👤</span>
            <span class="text-[9px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
              Member
            </span>
          </div>
          <div>
            <div class="text-sm font-bold text-white">User</div>
            <div class="text-[10px] text-neutral-400">user / user</div>
            <div class="text-[10px] text-neutral-400 mt-1 font-medium">Streaming Only</div>
          </div>
        </button>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            Username
          </label>
          <input 
            v-model="inputUsername" 
            type="text" 
            required
            autocomplete="username"
            placeholder="admin or user"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            Password
          </label>
          <input 
            v-model="inputPassword" 
            type="password" 
            required
            autocomplete="current-password"
            placeholder="••••"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition"
          />
        </div>

        <!-- Error Message Banner -->
        <div v-if="errorMessage" class="p-2.5 rounded-lg bg-red-950/80 border border-red-700 text-xs text-red-200">
          {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          class="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition transform active:scale-98 flex items-center justify-center gap-2"
        >
          <span>Sign In to StreamFlix</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/user';

const props = defineProps<{
  isOpen: boolean;
  allowClose?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'logged-in'): void;
}>();

const userStore = useUserStore();

const inputUsername = ref('admin');
const inputPassword = ref('admin');
const errorMessage = ref('');

const selectPreset = (accountType: 'admin' | 'user') => {
  if (accountType === 'admin') {
    inputUsername.value = 'admin';
    inputPassword.value = 'admin';
  } else {
    inputUsername.value = 'user';
    inputPassword.value = 'user';
  }
  errorMessage.value = '';
};

const handleLogin = () => {
  errorMessage.value = '';
  const result = userStore.login(inputUsername.value, inputPassword.value);
  if (result.success) {
    emit('logged-in');
    emit('close');
  } else {
    errorMessage.value = result.message || 'Login failed';
  }
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
