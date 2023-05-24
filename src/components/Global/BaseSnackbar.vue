<template>
  <v-snackbar
    v-model="modelValue"
    :color="color"
    class="base-snackbar"
    position="absolute"
    location="bottom"
    :data-cy="dataCy"
  >
    {{ message }}
    <template #actions>
      <v-btn
        data-cy="close-snackbar"
        icon
        variant="text"
        @click="clear">
        <v-icon icon="mdi-close" />
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'BaseSnackbar',
  emits: ['clear', 'update:modelValue'],
  props: ['modelValue', 'message', 'color', 'data-cy'],
  methods: {
    clear() {
      this.$emit('clear');
    },
  }
};
</script>
