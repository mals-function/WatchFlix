<template>
  <ion-app class="min-h-screen w-full overflow-y-auto">
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>

<style>
/* Global resets for mobile video & touch experience */
ion-app {
  background-color: #141414;
  color: #ffffff;
  overflow-y: auto !important;
  position: relative !important;
}
</style>
