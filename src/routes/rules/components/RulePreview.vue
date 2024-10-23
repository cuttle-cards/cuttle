<template>
  <v-row class="mb-10">
    <v-col lg="4" sm="5">
      <v-img
        :src="staticImg"
        aspect-ratio="1.7778"
        :alt="t('rules.preview.imgAlt', { title: t(title) })"
        class="mr-2"
        aria-hidden="false"
        role="img"
      />
    </v-col>
    <v-col>
      <h2 class="text-label-lg">
        {{ t(title) }}
      </h2>
      <div class="text-surface-2">
        <p class="text-md">
          {{ t(description) }}
        </p>
        <p v-if="description2" class="mt-4 text-surface-2 text-md">
          {{ t(description2) }}
        </p>
      </div>
      <div>
        <v-btn
          v-if="hasVideo"
          class="mt-6"
          color="newPrimary"
          :data-cy-open-rule-preview="title"
          @click="toggleDialog"
        >
          <v-icon icon="mdi-play" />
          {{ t('rules.preview.watchVideo') }}
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  description2: {
    type: String,
    default: '',
  },
  staticImg: {
    type: String,
    required: true,
  },
  hasVideo: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([ 'animate' ]);

const { t } = useI18n();

const animate = ref(false);

function toggleDialog() {
  animate.value = !animate.value;
  emit('animate');
}
</script>

<style scoped>
.text-label-lg {
  margin-bottom: 8px;
}
</style>
