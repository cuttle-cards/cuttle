<template>
  <v-menu v-model="spectatingMenu">
    <!-- Activator -->
    <template #activator="{ props }">
      <v-btn
        data-cy="spectate-list-button"
        class="pl-2"
        id="game-menu-activator"
        v-bind="props"
        icon
        variant="text"
      >
        <v-icon class="mr-1" icon="mdi-eye-outline" size="large" />
        <span class="pr-2">{{ spectatingUsers.length }}</span>
      </v-btn>
    </template>
    <!-- Menu -->

    <v-list id="spectatorList" data-cy="spectate-list-menu">
      <v-list-item><h3>Spectators</h3></v-list-item>
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
