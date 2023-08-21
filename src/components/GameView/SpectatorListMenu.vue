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
      >
        <v-icon class="mr-1" icon="mdi-eye-outline" size="large" />
        <span v-if="!$vuetify.display.xs" class="pr-2">{{ spectatingUsers.length }}</span>
      </v-btn>
    </template>
    <!-- Menu -->
    <v-list
      id="spectatorList"
      class="pl-2 pr-2 text-surface-1"
      bg-color="surface-2"
      data-cy="spectate-list-menu"
    >
      <v-list v-if="spectatingUsers.length > 0">
        <v-list-item-title>Spectators</v-list-item-title>
        <v-list-item v-for="spectator in spectatingUsers" :key="spectator">
          {{
            spectator
          }}
        </v-list-item>
      </v-list>
      <div v-else>
        Currently no spectators
      </div>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: {
    spectatingUsers: {
      type: Array,
      required: true,
    },
  },
  data() {
    return { spectatingMenu: false };
  },
};
</script>
