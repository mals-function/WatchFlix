<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-md bg-[#181818] rounded-xl border border-neutral-800 text-white p-6 shadow-2xl">
      <!-- Close Button -->
      <button 
        @click="$emit('close')"
        aria-label="Close"
        class="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Logo & Title -->
      <div class="text-center mb-6">
        <h2 class="text-3xl font-black text-red-600 tracking-tighter mb-1">
          WATCHFLIX
        </h2>
        <p class="text-xs text-neutral-400">
          {{ isSignUp ? 'Create your personal account' : 'Sign in to access your synchronized watchlist' }}
        </p>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex items-center rounded-lg bg-neutral-900 p-1 mb-5 border border-neutral-800">
        <button 
          @click="isSignUp = false"
          class="flex-1 py-1.5 text-xs font-semibold rounded-md transition"
          :class="[!isSignUp ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white']"
        >
          Sign In
        </button>
        <button 
          @click="isSignUp = true"
          class="flex-1 py-1.5 text-xs font-semibold rounded-md transition"
          :class="[isSignUp ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white']"
        >
          Sign Up
        </button>
      </div>

      <!-- Auth Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="isSignUp">
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            Display Name
          </label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="e.g. Alex"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            Email Address
          </label>
          <input 
            v-model="email" 
            type="email" 
            required
            placeholder="alex@example.com"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            Password
          </label>
          <input 
            v-model="password" 
            type="password" 
            required
            placeholder="••••••••"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-2.5 rounded bg-red-950/80 border border-red-700/80 text-xs text-red-200">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-2.5 rounded bg-green-950/80 border border-green-700/80 text-xs text-green-200">
          {{ successMessage }}
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg transition"
        >
          <span v-if="loading">Processing...</span>
          <span v-else>{{ isSignUp ? 'Create Account' : 'Sign In' }}</span>
        </button>

        <!-- Divider -->
        <div class="relative flex items-center justify-center my-4">
          <div class="border-t border-neutral-800 w-full"></div>
          <span class="bg-[#181818] px-2 text-[11px] text-neutral-500 uppercase tracking-wider absolute">or</span>
        </div>

        <!-- Guest Mode Button -->
        <button 
          type="button" 
          @click="continueAsGuest"
          class="w-full py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
        >
          Continue as Guest (Free Offline Mode)
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/user';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();

const isSignUp = ref(false);
const email = ref('');
const password = ref('');
const username = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    if (isSignUp.value) {
      await userStore.signUp(email.value, password.value, username.value);
      successMessage.value = 'Account created successfully! Check your email to confirm or sign in directly.';
    } else {
      await userStore.signIn(email.value, password.value);
      emit('close');
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Authentication failed. Make sure Supabase URL & Key are set.';
  } finally {
    loading.value = false;
  }
};

const continueAsGuest = () => {
  userStore.loginAsGuest();
  emit('close');
};
</script>
