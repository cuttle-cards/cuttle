<template>
  <v-menu v-model="spectatingMenu">
    <!-- Activator -->
    <template #activator="{ props }">
      <v-btn
        data-cy="spectate-list-button"
        class="pl-2"
        id="spectating-menu-activator"
        v-bind="props"
        icon
        variant="text"
      >
        <v-icon class="mr-1" icon="mdi-eye-outline" size="large" />
        <span class="pr-2" v-if="!$vuetify.display.xs">{{ spectatingUsers.length }}</span>
      </v-btn>
    </template>
    <!-- Menu -->
    <v-list class="pl-2 pr-2" id="spectatorList" data-cy="spectate-list-menu">
      <v-list-title>Spectators</v-list-title>
      <v-list-item v-for="spectator in spectatingUsers">{{ spectator }}</v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data() {
    return { spectatingMenu: false };
  },
  props: {
    spectatingUsers: {
      type: Array,
      required: true,
    },
  },
};
</script>
