<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>

<style>
/* Global resets for mobile video experience */
ion-app {
  background-color: #141414;
  color: #ffffff;
}
</style>
