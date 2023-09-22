<template>
  <v-menu transition="slide-x-transition">
    <template #activator="{ props }">
      <v-btn
        :color="isHomeView ? 'surface-1' : 'surface-2'"
        data-cy="user-menu"
        class="d-flex text-body-1 font-weight-medium mr-md-16"
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
      <v-menu location="end">
        <template #activator="{ props }">
          <v-list-item
            data-cy="language-menu"
            v-bind="props"
            :prepend-icon="`mdi-web`"
            append-icon="mdi-chevron-right"
            :title="$i18n.locale"
          />
        </template>

        <v-list data-cy="lang-list" density="compact" class="bg-surface-2 text-surface-1">
          <v-list-item
            v-for="(lang, i) in $i18n.availableLocales"
            :key="`${i}-${lang}`"
            :value="lang"
            :title="lang"
            :data-lang="lang"
            @click="$i18n.locale = lang"
          />
        </v-list>
      </v-menu>
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ROUTE_NAME_LOGOUT } from '@/router.js';

defineProps({
  isHomeView: {
    type: Boolean,
    default: true
  }
});

const { t } = useI18n();

const menuItems = computed(() => {
  return [{ text: t('global.logout'), icon: 'logout', page: { name: ROUTE_NAME_LOGOUT }, cyName: 'Log Out' }];
});

</script>
