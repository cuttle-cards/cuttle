<template>
  <header>
    <v-toolbar data-cy="nav-drawer" :color="variant === 'light' ? 'surface-2' : 'surface-1'">
      <v-toolbar-title>
        <div class="d-flex flex-md-row flex-row-reverse align-center justify-space-between">
          <TheUserMenu v-if="authStore.authenticated" :variant="variant" />
          <v-btn
            v-else
            :to="signupButtonLink"
            variant="text"
            color="surface-1"
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
              :src="`/img/cuttle_logo_text_${logoColor}.svg`"
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
import { computed, toRefs } from 'vue';

const props = defineProps({
  variant:{
    type:String,
    default:'light'
  }
});

const route = useRoute();
const { t } = useI18n();
const authStore = useAuthStore();

const { variant } = toRefs(props);
const { smAndDown } = useDisplay();
const pageLinks = getPageLinks();
const linkColor = computed(() => variant.value === 'light' ? 'text-surface-1' : 'text-surface-2');
const logoColor = computed(() => variant.value === 'light' ? 'brown' : 'white');

const tabColor = (page) => {
  return route.name === page ? 'text-newPrimary' : linkColor.value;
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
