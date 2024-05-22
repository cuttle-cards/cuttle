<script setup>
import { useI18n } from 'vue-i18n';
import { useThemedLogo } from '@/composables/themedLogo';
const { t } = useI18n();
const { logoSrc } = useThemedLogo();
</script>

<template>
  <div class="pa-4">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center">
          <router-link to="/">
            <img
              id="not-found-logo"
              alt="Cuttle logo"
              :src="logoSrc"
              height="20vh"
              class="mb-8"
            >
          </router-link>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="text-center">
          <router-link to="/" class="text-decoration-none">
            <h1 class="gradient-text">
              {{ t('error.404.title') }}
            </h1>
          </router-link>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
#not-found-logo {
  height: 20vh;
  margin: 0 auto;
}
</style>
