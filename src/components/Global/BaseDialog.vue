<template>
  <v-dialog v-model="show" persistent max-width="650" :scrollable="scrollable">
    <v-card :id="id" class="dialog-card">
      <div class="dialog-content-wrapper">
        <v-card-title class="mb-4"><h1>{{ title }}</h1></v-card-title>
        <v-card-text>
          <slot name="body" />
        </v-card-text>
      </div>
      <v-card-actions class="dialog-actions">
        <div class="dialog-actions-wrapper d-flex justify-end">
          <slot name="actions" />
        </div>
      </v-card-actions>
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
  /* padding: 8px; */
  opacity: .95;
  color: rgba(var(--v-theme-surface-2));
}

.dialog-content-wrapper {
  margin-top: 8px;
  margin-right: 8px;
  margin-left: 8px;
  border-top: 4px solid rgba(var(--v-theme-surface-2));
  border-right: 4px solid rgba(var(--v-theme-surface-2));
  border-left: 4px solid rgba(var(--v-theme-surface-2));
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.dialog-actions {
  background-color: rgba(var(--v-theme-surface-2));
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 8px;
  padding-top: 0;
}
.dialog-actions-wrapper {
  width: 100%;
  padding: 4px;
  border-left: 4px solid rgba(var(--v-theme-surface-1));
  border-right: 4px solid rgba(var(--v-theme-surface-1));
  border-bottom: 4px solid rgba(var(--v-theme-surface-1));
}
</style>