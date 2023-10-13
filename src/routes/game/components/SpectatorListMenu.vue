<template>
  <v-menu v-model="spectatingMenu">
    <!-- Activator -->
    <template #activator="{ props }">
      <v-btn
        id="spectating-menu-activator"
        data-cy="spectate-list-button"
        class="pl-2"
        v-bind="props"
        icon
        variant="text"
        aria-label="View current spectators"
      >
        <v-icon
          class="mr-1"
          icon="mdi-eye-outline"
          size="large"
          aria-hidden="true"   
        />
        <span v-if="!$vuetify.display.xs" class="pr-2">{{ spectatingUsers.length }}</span>
      </v-btn>
    </template>
    <!-- Menu -->
    <v-list
      id="spectatorList"
      class="pl-2 pr-2"
      bg-color="surface-2"
      color="surface-1"
      data-cy="spectate-list-menu"
    >
      <v-list-item-title v-if="spectatingUsers.length > 0">
        {{ `${t('game.menus.spectatorListMenu.spectators')}` }}
      </v-list-item-title>
      <v-list-item-title v-else>
        {{ `${t('game.menus.spectatorListMenu.noSpectators')}` }}
      </v-list-item-title>
      <v-list-item v-for="spectator in spectatingUsers" :key="spectator">
        {{ spectator }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  props: {
    spectatingUsers: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return { spectatingMenu: false };
  },
};
</script>
