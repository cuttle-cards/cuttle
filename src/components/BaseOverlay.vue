<template>
  <v-overlay
    :model-value="modelValue"
    :persistent="persistent"
    class="game-overlay"
    v-bind="$attrs"
  >
    <h1 :class="[$vuetify.display.xs ? 'text-h5' : 'text-h3', 'overlay-header']">
      <slot name="header" />
    </h1>
    <slot />
  </v-overlay>
</template>

<script setup>
defineOptions({
  name: 'BaseOverlay',
  inheritAttrs: false,
});

const _props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped lang="scss">
:deep(.v-overlay__content) {
  left: 0;
}
.game-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  contain: var(--contain-isolated);
}
.overlay-header {
  font-weight: bold;
  background-color: rgba(var(--v-theme-surface-light));
  color: rgba(var(--v-theme-surface-dark));
  padding: 24px;
  text-align: center;
  width: 100vw;
}
</style>
