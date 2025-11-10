<template>
  <v-menu
    v-model="internal"
    v-bind="$attrs"
  >
    <template #activator="{ props: menuActivatorProps }">
      <div v-bind="menuActivatorProps">
        <slot name="activator" />
      </div>
    </template>

    <div class="base-menu pa-2">
      <slot />
    </div>
  </v-menu>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([ 'update:modelValue' ]);

const internal = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped lang="scss">
.base-menu {
  background-color: var(--surface-2); /* cream */
  color: var(--surface-1);            /* chocolate */
  border: none;
  box-shadow: none;
  outline: none;
  border-radius: 8px;
}
</style>
