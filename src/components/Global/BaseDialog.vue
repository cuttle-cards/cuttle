<template>
  <v-dialog
    v-model="show"
    :persistent="persistent"
    max-width="650"
    :scrollable="scrollable"
    elevation
    scrim="surface-1"
  >
    <template #activator="{ props }">
      <span v-bind="props">
        <slot name="activator" />
      </span>
    </template>
    <v-card
      :id="id"
      :data-cy="id"
      class="dialog-card"
      color="surface-1"
      :style="`opacity:${opacity}`"
    >
      <v-card-title class="d-flex justify-space-between pt-4">
        <h1 v-if="title">{{ title }}</h1>

        <slot v-else name="title" />
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
    opacity:{
      type: Number,
      default: .92,
    },
    persistent: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
};
</script>

<style scoped>
.dialog-card {
  /* Stuck using important because vuetify applies it to these styles for cards */
  color: rgba(var(--v-theme-surface-2)) !important;
  border-radius: 12px !important;
  border: 4px solid rgba(var(--v-theme-surface-2));
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
