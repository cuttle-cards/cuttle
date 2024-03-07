<template>
  <v-row>
    <v-col lg="2" sm="5">
      <v-img
        :src="staticImg"
        aspect-ratio="1.7778"
        :alt="`How to play ${title} in Cuttle`"
        class="mr-2"
        aria-hidden="false"
        role="img"
      />
    </v-col>
    <v-col>
      <p class="mb-2 text-surface-2">
        <strong>{{ title }}</strong> <br />
        {{ description }}
      </p>
      <p class="mb-2 text-surface-2">
        {{ description2 }}
      </p>
      <div>
        <v-btn color="newPrimary" @click="toggleDialog">
          <v-icon icon="mdi-play" />
          Wacth Video
        </v-btn>
      </div>
    </v-col>
  </v-row>
  <v-dialog v-model="animate" :persistent="persistent" max-width="650" elevation scrim="surface-1">
    <div class="dialog-actions d-flex justify-end position-relative">
      <v-btn
        class="position-absolute closeIcon"
        variant="text"
        icon
        data-cy="cancel-target-mobile"
        aria-label="Close Dialog"
        @click="toggleDialog"
      >
        <v-icon icon="mdi-close" color="white" size="x-large" aria-hidden="true" />
      </v-btn>
    </div>
    <v-img :src="animatedImg" :alt="`Animated preview of ${title} in Cuttle`" />
  </v-dialog>
</template>

<script>
export default {
  name: 'RulePreview',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    subtitle2: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    description2: {
      type: String,
    },
    animatedImg: {
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
  data() {
    return {
      animate: false,
    };
  },
  methods: {
    toggleDialog() {
      this.animate = !this.animate;
    },
  },
};
</script>

<style scoped>
.closeIcon {
  z-index: 99;
  top: 0;
  right: 0;
}
</style>
