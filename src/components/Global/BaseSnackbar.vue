<template>
  <!--
    Using v-model is not allowed, in a base component such as this we need to adhere
    to the one-way data flow Vue prefers and take the value, then emit it back up manually
    see https://vuejs.org/guide/components/props.html#one-way-data-flow
  -->
  <v-snackbar
    :modelValue="modelValue"
    @update:modelValue="modelValue"
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
