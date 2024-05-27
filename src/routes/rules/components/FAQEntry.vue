<template>
  <div class="mb-8">
    <strong class="text-label-md">{{ question }}</strong>
    <p class="text-md mt-4">
      {{ answer }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  msgKey: {
    type: String,
    required: true,
  }
});

const { t } = useI18n();

const question = computed(() => t(`rules.faq.${props.msgKey}`));

const answer = computed(() => t(`rules.faq.${props.msgKey}Answer`));
</script>
