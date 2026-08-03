<script setup>
import { parse } from 'marked';
import { computed } from 'vue';

const props = defineProps({
  markdown: {
    type: String,
    default: '',
  },
});

const text = computed(() => parse(props.markdown));
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="markdown" v-html="text" />
</template>

<style scoped lang="scss">
.markdown {
  :deep(p) {
    padding-bottom: 16px;
  }
}
</style>
