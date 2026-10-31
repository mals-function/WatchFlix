<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto animate-fadeIn"
    @click.self="handleBackdropClick"
  >
    <div class="relative w-full max-w-md bg-gradient-to-b from-[#181820] via-[#101014] to-[#0b0b0e] border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(229,9,20,0.16)] text-white my-auto overflow-hidden">
      <!-- Ambient Top Glow Spotlight -->
      <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-600/25 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Close button (allowed if user is already authenticated) -->
      <button 
        v-if="allowClose"
        @click="$emit('close')"
        aria-label="Close"
        class="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-10"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Brand Header -->
      <div class="relative text-center mb-6 pt-1">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl shadow-[0_4px_20px_rgba(229,9,20,0.4)] mb-3 border border-red-500/40">
          5M
        </div>
        <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-neutral-300">
            5MWatch
          </span>
          <span class="text-red-500">Stream</span>
        </h2>
        <p class="text-xs text-neutral-400 font-medium mt-1">
          {{ isSignUpMode ? 'Create a new account to unlock full HD streaming' : 'Enter your credentials to access your streaming library' }}
        </p>
      </div>

      <!-- Segmented Mode Switcher (Sign In vs Create Account) -->
      <div class="p-1 bg-neutral-950/80 rounded-xl border border-neutral-800/80 flex items-center mb-6">
        <button 
          type="button" 
          @click="switchMode(false)"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200"
          :class="[!isSignUpMode ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' : 'text-neutral-400 hover:text-white']"
        >
          Sign In
        </button>
        <button 
          type="button" 
          @click="switchMode(true)"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200"
          :class="[isSignUpMode ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' : 'text-neutral-400 hover:text-white']"
        >
          Create Account
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Username Field -->
        <div>
          <label class="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
            <span>Username or Email</span>
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 text-neutral-400 pointer-events-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </span>
            <input 
              v-model="inputUsername" 
              type="text" 
              required
              autocomplete="username"
              placeholder="Enter your username or email"
              class="w-full bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition duration-150"
            />
          </div>
        </div>

        <!-- Extra Email field for Sign Up -->
        <div v-if="isSignUpMode">
          <label class="block text-xs font-bold text-neutral-300 mb-1.5">
            Email Address
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 text-neutral-400 pointer-events-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </span>
            <input 
              v-model="inputEmail" 
              type="email" 
              autocomplete="email"
              placeholder="name@example.com (optional)"
              class="w-full bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition duration-150"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
            <span>Password</span>
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 text-neutral-400 pointer-events-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </span>
            <input 
              v-model="inputPassword" 
              :type="showPassword ? 'text' : 'password'" 
              required
              :autocomplete="isSignUpMode ? 'new-password' : 'current-password'"
              placeholder="Enter your password"
              class="w-full bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-neutral-500 outline-none transition duration-150"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="absolute right-3 text-neutral-400 hover:text-white p-1 rounded transition"
              :title="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirm Password Field for Sign Up -->
        <div v-if="isSignUpMode">
          <label class="block text-xs font-bold text-neutral-300 mb-1.5">
            Confirm Password
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 text-neutral-400 pointer-events-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </span>
            <input 
              v-model="confirmPassword" 
              :type="showPassword ? 'text' : 'password'" 
              required
              autocomplete="new-password"
              placeholder="Re-enter your password"
              class="w-full bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition duration-150"
            />
          </div>
        </div>

        <!-- Error Banner -->
        <div 
          v-if="errorMessage" 
          class="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn"
        >
          <svg class="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div class="leading-relaxed">{{ errorMessage }}</div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base shadow-[0_8px_25px_-4px_rgba(229,9,20,0.5)] transition duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <svg v-if="isSubmitting" class="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span v-else>{{ isSignUpMode ? 'Create 5MWatchStream Account' : 'Sign In to 5MWatchStream' }}</span>
          <svg v-if="!isSubmitting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>
      </form>

      <!-- Security / Privacy notice -->
      <div class="mt-6 text-center text-[11px] text-neutral-400">
        <span>Protected with secure client session storage</span>
      </div>
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

// Form states: initialized clean/empty requiring user input
const inputUsername = ref('');
const inputEmail = ref('');
const inputPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const isSignUpMode = ref(false);
const errorMessage = ref('');
const isSubmitting = ref(false);

const switchMode = (signUp: boolean) => {
  isSignUpMode.value = signUp;
  errorMessage.value = '';
};

const handleBackdropClick = () => {
  if (props.allowClose) {
    emit('close');
  }
};

const handleSubmit = async () => {
  errorMessage.value = '';

  if (!inputUsername.value.trim()) {
    errorMessage.value = 'Please enter your username.';
    return;
  }

  if (!inputPassword.value) {
    errorMessage.value = 'Please enter your password.';
    return;
  }

  isSubmitting.value = true;

  try {
    if (isSignUpMode.value) {
      if (inputPassword.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match. Please re-enter.';
        isSubmitting.value = false;
        return;
      }

      const res = await userStore.signUp(inputUsername.value, inputPassword.value, inputEmail.value);
      if (res.success) {
        emit('logged-in');
        emit('close');
        inputUsername.value = '';
        inputPassword.value = '';
        confirmPassword.value = '';
      } else {
        errorMessage.value = res.message || 'Account creation failed. Please try again.';
      }
    } else {
      const res = userStore.login(inputUsername.value, inputPassword.value);
      if (res.success) {
        emit('logged-in');
        emit('close');
        inputUsername.value = '';
        inputPassword.value = '';
      } else {
        errorMessage.value = res.message || 'Invalid username or password.';
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
