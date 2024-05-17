<template>
  <v-row>
    <v-col lg="2" sm="5">
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
      <p class="mb-2 text-surface-2">
        <strong>{{ t(title) }}</strong> <br>
        {{ t(description) }}
      </p>
      <p v-if="description2" class="mb-2 text-surface-2">
        {{ t(description2) }}
      </p>
      <div>
        <v-btn color="newPrimary" :data-cy-open-rule-preview="title" @click="toggleDialog">
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
    icon: {
      type: String,
      default: '',
    },
});

const emit = defineEmits(['animate']);

const { t } = useI18n();

const animate = ref(false);

function toggleDialog() {
  animate.value = !animate.value;
  emit('animate');
}
</script>
