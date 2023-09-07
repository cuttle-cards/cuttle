<template>
  <v-menu transition="slide-x-transition">
    <template #activator="{ props }">
      <v-btn
        data-cy="user-menu"
        class="d-flex text-body-1"
        v-bind="props"
        variant="text"
      >
        <v-icon
          icon="mdi-account-circle" 
          aria-label="Open user menu"
          aria-hidden="false"
          role="img"
        />
        {{ $store.state.auth.username }}
      </v-btn>
    </template>
    <v-list density="compact" class="bg-surface-2 text-surface-1">
      <v-list-item
        v-for="({ text, icon, page }, i) in menuItems"
        :key="i"
        :prepend-icon="`mdi-${icon}`"
        :title="text"
        :to="page"
        exact
        :data-nav="text"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ROUTE_NAME_LOGOUT } from '@/router.js';

const { t } = useI18n();

const menuItems = computed(() => {
  return [{ text: t('global.logout'), icon: 'logout', page: { name: ROUTE_NAME_LOGOUT } }];
});
</script>
