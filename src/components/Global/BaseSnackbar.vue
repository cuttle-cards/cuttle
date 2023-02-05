<template>
  <v-snackbar
    v-model="showSnackBar"
    :color="color"
    class="base-snackbar"
    position="absolute"
    location="bottom"
    v-bind="$attrs"
  >
    <slot />
    <template #actions>
      <v-btn data-cy="close-snackbar" icon variant="text" @click="clear">
        <v-icon icon="mdi-close" />
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'BaseSnackbar',
  emits: ['clear'],
  props: ['showSnackBar', 'color'],
  methods: {
    clear() {
      this.$emit('clear');
    },
  }
}
</script>
