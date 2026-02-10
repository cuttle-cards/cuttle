<template>
  <header>
    <v-toolbar data-cy="nav-drawer" color="base-light">
      <v-toolbar-title>
        <div class="d-flex flex-md-row flex-row-reverse align-center justify-space-between">
          <TheUserMenu v-if="authStore.authenticated" />
          <v-btn
            v-else
            :to="signupButtonLink"
            variant="text"
            color="base-dark"
            prepend-icon="mdi-login"
            data-cy="login-link"
          >
            {{ signupButtonText }}
          </v-btn>
          <router-link 
            :to="{ name: ROUTE_NAME_HOME }"
            class="logo-container"
          >
            <img
              id="logo"
              alt="Cuttle logo"
              :src="`/img/cuttle_logo_text_brown.svg`"
              width="60"
              height="60"
              class="ma-md-auto desktop-logo"
            >
          </router-link>
        </div>
      </v-toolbar-title>
      <v-toolbar-items v-if="!smAndDown" class="hidden-xs">
        <v-tabs class="pa-2">
          <v-tab
            v-for="({ text, icon, page, cyName }, i) in pageLinks"
            :key="i"
            :class="tabColor(page.name)"
            variant="text"
            :data-cy="cyName"
            :title="text"
            :to="page"
          >
            <v-icon
              class="mr-1"
              :icon="`mdi-${icon}`"
              :aria-label="text"
              aria-hidden="false"
              role="img"
            />
            {{ text }}
          </v-tab>
        </v-tabs>
      </v-toolbar-items>
    </v-toolbar>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { getPageLinks } from '@/composables/navLink.js';
import { ROUTE_NAME_SIGNUP, ROUTE_NAME_LOGIN, ROUTE_NAME_HOME } from '@/router.js';
import TheUserMenu from '@/components/TheUserMenu.vue';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const { t } = useI18n();
const authStore = useAuthStore();


const { smAndDown } = useDisplay();
const pageLinks = getPageLinks();

const tabColor = (page) => {

  // highlight tab when spectate list tab 
  if (route.name === 'SpectateList') {
    return page === 'Home' ? 'text-primary' : 'text-base-dark';
  }

  return route.name === page ? 'text-primary' : 'text-base-dark';
};

const signupButtonText = computed(() => {
  return authStore.getIsReturningUser() ? t('global.login') : t('global.signup');
});

const signupButtonLink = computed(() => {
  const routeName = authStore.getIsReturningUser() ? ROUTE_NAME_LOGIN : ROUTE_NAME_SIGNUP;
  return {
    name: routeName,
    hash: '#login-container'
  };
});
</script>

<style scoped>
@media screen and (min-width: 960px) {
  .logo-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .desktop-logo {
    display: block;
  }
}
</style>
