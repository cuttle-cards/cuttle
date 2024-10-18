<template>
  <!--
    Using v-model is not allowed, in a base component such as this we need to adhere
    to the one-way data flow Vue prefers and take the value, then emit it back up manually
    see https://vuejs.org/guide/components/props.html#one-way-data-flow
  -->
  <v-snackbar
    :model-value="modelValue"
    :color="color"
    class="base-snackbar"
    position="fixed"
    location="bottom"
    :data-cy="dataCy"
    @update:model-value="$emit('update:modelValue', $event)"
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
export default {
  name: 'BaseSnackbar',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'error'
    },
    dataCy: {
      type: String,
      required: true
    }
  },
  emits: [ 'clear', 'update:modelValue' ],
  methods: {
    clear() {
      this.$emit('clear');
    },
  }
};
</script>
