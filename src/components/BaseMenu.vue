<template>
  <v-menu
    v-model="show"
  >
    <template #activator="{ props }">
      <span v-bind="props">
        <slot name="activator" />
      </span>
    </template>

    <v-card
    color="surface-2"
    class="menu-card"
    :class="variant"
    >
      <v-card-title v-if="title">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <slot name="body" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const show = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
</script>

<style scoped lang="scss">
.menu-card {
  color: rgba(var(--v-theme-surface-1)) !important;
 }
</style>

