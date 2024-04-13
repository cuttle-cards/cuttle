<template>
  <v-overlay
    id="rule-preview-dialog"
    class="game-ovelay text-center d-flex justify-center align-center"
    width="650"
  >
    <div id="close-wrapper" class="d-flex justify-end my-4">
      <v-btn
        icon
        variant="text"
        color="surface-2"
        size="x-large"
        aria-lable="close"
        @click="$emit('close')"
      >
        <v-icon
          icon="mdi-close"
          size="x-large" 
          aria-hidden="true"
        />
      </v-btn>
    </div>
    <v-skeleton-loader
      v-if="!imageLoaded"
      color="surface-1"
      class="pa-6"
      type="card"
    />
    <v-img v-else :src="imageUrl" :alt="t('rules.rulesPreviewGif', { title })" />
  </v-overlay>
</template>

<script setup>
import { ref, defineProps, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  imageUrl: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
});
defineEmits(['close']);
const { t } = useI18n();

const imageLoaded = ref(false);

watch(
  () => props.imageUrl,
  () => {
    preloadImage();
  },
);

const preloadImage = () => {
  imageLoaded.value = false;
  const img = new Image();
  img.onload = () => {
    imageLoaded.value = true;
  };
  img.src = props.imageUrl;
};
</script>
