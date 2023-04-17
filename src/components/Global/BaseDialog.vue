<template>
  <v-dialog v-model="show" persistent max-width="650" :scrollable="scrollable">
    <v-card :id="id" class="dialog-card">
      <div class="dialog-content-wrapper">
        <v-card-title class="mb-4"><h1>{{ title }}</h1></v-card-title>
        <v-card-text>
          <slot name="body" />
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <slot name="actions" />
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'BaseDialog',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    scrollable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
  },
}
</script>

<style scoped>
.dialog-card {
  padding: 8px;
  opacity: .95;
  color: rgba(var(--v-theme-surface-2));
}

.dialog-content-wrapper {
  border: 4px solid rgba(var(--v-theme-surface-2));
  border-radius: 8px;
}
</style>