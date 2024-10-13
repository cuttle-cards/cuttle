<template>
  <v-dialog
    v-model="show"
    :persistent="persistent"
    :max-width="maxWidth"
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
      :class="variant"
      :color="backgroundColor"
      :style="`opacity:${opacity}`"
    >
      <v-card-title class="d-flex justify-space-between pt-4">
        <h1 v-if="title">
          {{ title }}
        </h1>

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
    variant: {
      type: String,
      default: 'dark',
      validator: (val) => [ 'light', 'dark' ].includes(val),
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
    },
    maxWidth: {
      type: Number,
      default: 650,
    },
  },
  emits: [ 'update:modelValue' ],
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    isLight() {
      return this.variant === 'light';
    },
    backgroundColor() {
      return this.isLight ? 'surface-2': 'surface-1';
    },
    textColor() {
      return this.isLight ? 'surface-1' : 'surface-2';
    },
  },
};
</script>

<style scoped lang="scss">
.dialog-card {
  border-radius: 12px !important;
  border: 4px solid rgba(var(--v-theme-surface-2));
  
  &.dark {
    /* Stuck using important because vuetify applies it to these styles for cards */
    color: rgba(var(--v-theme-surface-2)) !important;
  }

  &.light {
    /* Stuck using important because vuetify applies it to these styles for cards */
    color: rgba(var(--v-theme-surface-1)) !important;
  }
}


.dialog-actions {
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 8px;
  padding-bottom: 2px;
  border-bottom-left-radius: 8px;
  border: none;

  .dark & {
    background-color: rgba(var(--v-theme-surface-2));
  }

}
</style>
