<template>
  <v-snackbar
    v-model="show"
    :color="color"
    class="base-snackbar"
    position="absolute"
    location="bottom"
  >
    {{ message }}
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
  emits: ['clear', 'update:show', 'update:message'],
  props: ['show', 'message', 'color'],
  methods: {
    clear() {
      this.$emit('clear');
    },
  }
}
</script>
