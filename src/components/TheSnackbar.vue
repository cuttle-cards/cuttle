<template>
  <!--
    Using v-model is not allowed, in a base component such as this we need to adhere
    to the one-way data flow Vue prefers and take the value, then emit it back up manually
    see https://vuejs.org/guide/components/props.html#one-way-data-flow
  -->
  <v-snackbar
    :model-value="showSnackbar"
    :color="color"
    :timeout="timeout"
    :class="[ 'base-snackbar', { 'clears-playback-controls': showingPlaybackControls } ]"
    position="fixed"
    location="bottom"
    z-index="3000"
    data-cy="global-snackbar"
    @update:model-value="clear"
  >
    {{ message }}
    <template #actions>
      <v-btn
        data-cy="close-snackbar"
        icon
        variant="text"
        aria-label="Close snackbar"
        @click="clear"
      >
        <v-icon icon="mdi-close" aria-hidden="true" />
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { useSnackbarStore } from '../stores/snackbar';
import { useGameHistoryStore } from '../stores/gameHistory';
import { mapStores } from 'pinia';

export default {
  name: 'TheSnackbar',
  computed: {
    ...mapStores(useSnackbarStore, useGameHistoryStore),

    // The spectator playback bar is fixed across the bottom of the game, where this snackbar lands
    showingPlaybackControls() {
      return this.gameHistoryStore.showPlaybackControls;
    },

    showSnackbar() {
      return this.snackbarStore.getShowSnackbar;
    },
    color() {
      return this.snackbarStore.getSnackColor;
    },
    message() {
      return this.snackbarStore.getSnackMessage;
    },
    timeout() {
      return this.snackbarStore.getSnackTimeout;
    },
  },

  methods: {
    clear() {
      this.snackbarStore.clear();
    },
  }
};
</script>

<style scoped lang="scss">
/*
  The spectator playback bar is fixed to the bottom of the game at z-index 2500, above dialogs,
  while Vuetify hands this snackbar a lower z-index off its own overlay stack. Left alone, an error
  renders behind the bar where it can be neither read nor dismissed. Sit above the bar, and clear
  its height so it doesn't cover the playback buttons while it shows -- keep this in step with
  #playback-controls' min-height in PlaybackControls.vue.
*/
.clears-playback-controls {
  /* Vuetify writes the overlay's z-index inline, so clearing the bar's 2500 has to win outright */
  z-index: 2600 !important;

  :deep(.v-snackbar__wrapper) {
    margin-bottom: 56px;
  }
}
</style>
