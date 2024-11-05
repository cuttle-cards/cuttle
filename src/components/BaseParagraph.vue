<template>
  <div>
    <h2 v-if="heading">
      {{ t(heading) }}
    </h2>
    <p>
      <template v-for="(chunk, index) in paragraph" :key="`text-chunk-${index}`">
        <!-- Remote Link -->
        <a
          v-if="chunk.url"
          :href="chunk.url"
          class="text-cyan-lighten-2 font-weight-bold text-decoration-none"
        >
          {{ t(chunk.text) }}
        </a>
        <!-- Plain text -->
        <template v-else>
          {{ t(chunk.text) }}
        </template>
      </template>
    </p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  heading: {
    type: String,
    default: '',
  },
  paragraph: {
    type: Array,
    required: true,
  },
});

const { t } = useI18n();

</script>
