<template>
  <v-menu
    v-model="isOpen"
    transition="slide-x-transition" 
  >
    <template #activator="{ props }">
      <v-btn
        :color="variant === 'light' ? 'surface-1' : 'surface-2'"
        data-cy="user-menu"
        class="d-flex text-body-1 mr-md-16"
        v-bind="props"
        variant="text"
      >
        <v-icon
          icon="mdi-account-circle" 
          aria-label="Open user menu"
          aria-hidden="false"
          role="img"
          class="mr-1"
        />
        {{ authStore.username }}
        <v-icon
          icon="mdi-chevron-down"
          class="ml-1 chevron-icon"
          :class="{ rotate: isOpen }"
        />
      </v-btn>
    </template>
    <v-list density="compact" class="bg-surface-2 text-surface-1">
      <TheLanguageSelector has-chevron />
      <v-list-item
        v-for="({ text, icon, page, cyName }, i) in menuItems"
        :key="i"
        :prepend-icon="`mdi-${icon}`"
        :title="text"
        :to="page"
        exact
        :data-nav="cyName"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ROUTE_NAME_LOGOUT } from '@/router.js';

import TheLanguageSelector from '@/components/TheLanguageSelector.vue';

const authStore = useAuthStore();

const { t } = useI18n();

const isOpen = ref(false);

defineProps({
  variant:{
    type:String,
    default:'light'
  }
});

const menuItems = computed(() => {
  return [ { text: t('global.logout'), icon: 'logout', page: { name: ROUTE_NAME_LOGOUT }, cyName: 'Log Out' } ];
});

</script>
<style scoped>
.chevron-icon {
  transition: transform 0.3s ease-in-out;
}

.rotate {
  transform: rotate(180deg);
}
</style>
