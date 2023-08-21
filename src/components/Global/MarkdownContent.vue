<script setup>
import { parse } from 'marked';
import { computed, defineProps } from 'vue';

const props = defineProps({
  markdown: String,
});

const text = computed(() => parse(props.markdown, {
  headerIds: false,
  mangle: false,
}));
</script>

<template>
  <div class="markdown" v-html="text" />
</template>

<style lang="scss">
.markdown {
  p {
    padding-bottom: 16px;
  }
}
</style>
