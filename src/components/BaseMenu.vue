<template>
  <v-menu v-model="show" :location="location" v-bind="$attrs">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <slot name="activator" />
      </span>
    </template>

    <v-card
      color="game-card"
      class="menu-card"
      :class="variant"
      :data-cy="dataCy"
    >
      <v-card-title v-if="title">
        {{ title }}
      </v-card-title>

      <slot name="body" :list-props="listProps" />
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
  location: {
    type: String,
    default: 'top',
  },
  dataCy: {
    type: String,
    default: ''
  },
  listBgColor: {
    type: String,
    default: 'game-card'
  },
  listColor: {
    type: String, 
    default: 'game-board'
  },
});

const emit = defineEmits([ 'update:modelValue' ]);

const show = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const listProps = computed(() => {
  return {
    bgColor: props.listBgColor,
    color: props.listColor,
  };
});
</script>

<style scoped lang="scss">
.menu-card {
  color: rgba(var(--v-theme-game-board)) !important;
 }
</style>

