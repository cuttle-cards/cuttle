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
  The spectator playback bar is fixed across the bottom of the game, exactly where this snackbar
  lands, and an error rendering behind it can be neither read nor dismissed.

  Sit the snackbar clear of the bar rather than stacking it over the bar: vuetify assigns overlay
  z-indexes from a running stack, each new overlay taking the last one's + 10 (see useStack), so a
  z-index declared here would only be honoured while nothing else is open — and would seed that
  stack above the bar for everything opened afterwards (#1479). Not overlapping settles it without
  entering that race, and leaves the bar's buttons usable while the snackbar shows. Keep the offset
  in step with #playback-controls' min-height.
*/
.clears-playback-controls {
  :deep(.v-snackbar__wrapper) {
    margin-bottom: 56px;
  }
}
</style>
