<template>
  <v-row>
    <v-col lg="2" sm="5">
      <v-img
        :src="staticImg"
        aspect-ratio="1.7778"
        :alt="t('rules.preview.imgAlt', { title })"
        class="mr-2"
        aria-hidden="false"
        role="img"
      />
    </v-col>
    <v-col>
      <p class="mb-2 text-surface-2">
        <strong>{{ title }}</strong> <br>
        {{ description }}
      </p>
      <p v-if="description2" class="mb-2 text-surface-2">
        {{ description2 }}
      </p>
      <div>
        <v-btn color="newPrimary" @click="toggleDialog">
          <v-icon icon="mdi-play" />
          {{ t('rules.preview.watchVideo') }}
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: 'RulePreview',
  props: {
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
  },
  emits: ['animate'],
  setup(){
    const { t } = useI18n();
    return {
      t
    };
  },
  data() {
    return {
      animate: false,
    };
  },
  methods: {
    toggleDialog() {
      this.animate = !this.animate;
      this.$emit('animate');
    },
  },
};
</script>
