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
    class="base-snackbar"
    position="fixed"
    location="bottom"
    z-index="2412"
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
import { mapStores } from 'pinia';

export default {
  name: 'TheSnackbar',
  computed: {
    ...mapStores(useSnackbarStore),

    showSnackbar() {
      return this.snackbarStore.getShowSnackbar();
    },
    color() {
      return this.snackbarStore.getSnackColor();
    },
    message() {
      return this.snackbarStore.getSnackMessage();
    },
    timeout() {
      return this.snackbarStore.getSnackTimeout();
    },
  },

  methods: {
    clear() {
      this.snackbarStore.clear();
    },
  }
};
</script>
