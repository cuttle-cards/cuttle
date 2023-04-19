<template>
  <v-dialog v-model="show" persistent max-width="650" :scrollable="scrollable" elevation scrim="surface-1">
    <v-card :id="id" class="dialog-card">
      <v-card-title class="d-flex justify-space-between">
        <h1 v-if="title">{{ title }}</h1>
        <slot name="title" />
      </v-card-title>
      <v-card-text>
        <slot name="body" />
      </v-card-text>
      <div class="dialog-actions d-flex justify-end">
        <slot name="actions" />
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
      default: '',
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
  color: rgba(var(--v-theme-surface-2));
  opacity: .92;
  border: 4px solid rgba(var(--v-theme-surface-2));
  border-radius: 12px !important;
}

.dialog-actions {
  background-color: rgba(var(--v-theme-surface-2));
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 8px;
  padding-bottom: 2px;
  border-bottom-left-radius: 8px;
  border: none;
}
</style>