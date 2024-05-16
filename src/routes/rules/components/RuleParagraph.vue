<template>
  <v-row
    align="start"
    class="my-6"
  >
    <div class="flex-column">
      <div class="d-flex">
        <v-img
          :src="rule.staticImg"
          class="mr-1 max-w-24"
          aria-hidden="false"
          role="img"
        />
        <h1>
          {{ t(rule.title) }}
        </h1>
      </div>
      <p class="d-block">
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
