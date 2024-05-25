<template>
  <v-row
    align="center"
    class="my-8"
  >
    <div class="flex-column">
      <div class="d-flex align-center mb-4">
        <v-img
          :src="rule.staticImg"
          class="mr-1 max-w-24"
          aria-hidden="false"
          role="img"
        />
        <h2 class="text-label-lg">
          {{ t(rule.title) }}
        </h2>
      </div>
      <p class="d-block text-md">
        {{ t(rule.description) }}
      </p>
      <component :is="rule.childComponent" v-if="rule.childComponent" />
    </div>
  </v-row>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  rule: {
    type: Object,
    required: true
  }
});

const { t } = useI18n();
</script>

<style scoped>
.max-w-24 {
  max-width: 24px;
}
</style>
