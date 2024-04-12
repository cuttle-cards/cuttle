<template>
  <BaseDialog id="rules-preview" opacity="1" :persistent="false">
    <template #title>
      <h1>{{ title }}</h1>
      <v-btn
        icon
        aria-label="Close rules dialog"
        color="surface-2"
        variant="text"
        @click="$emit('close')"
      >
        <v-icon icon="mdi-close" size="large" aria-hidden="true" />
      </v-btn>
    </template>
    <template #body>
      <v-skeleton-loader
        v-if="!imageLoaded"
        color="surface-1"
        class="pa-6"
        type="image"
      />
      <v-img v-else :src="imageUrl" :alt="t('rules.rulesPreviewGif', { title })" />
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, defineProps,watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
const props = defineProps({
  imageUrl: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
});
 defineEmits(['close']);
const { t } = useI18n();

const imageLoaded = ref(false);

watch(() => props.imageUrl, () => {
  preloadImage();
});

const preloadImage = () => {
  imageLoaded.value = false;
  const img = new Image();
  img.onload = () => {
    imageLoaded.value = true;
  };
  img.src = props.imageUrl;
};
</script>
