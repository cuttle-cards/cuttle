<template>
  <!--
    Using v-model is not allowed, in a base component such as this we need to adhere
    to the one-way binding Vue prefers and takwe the value, then emit it back up manually
  -->
  <v-snackbar
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :color="color"
    class="base-snackbar"
    position="fixed"
    location="bottom"
    :data-cy="dataCy"
  >
    {{ message }}
    <template #actions>
      <v-btn
        data-cy="close-snackbar"
        icon
        variant="text"
        @click="clear"
      >
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
