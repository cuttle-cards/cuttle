<template>
  <div class="rule-preview">
    <v-img
      v-if="!animate"
      :src="require(`../img/game_images/${staticImg}`)"
      :alt="`How to play ${title} in Cuttle`"
      aspect-ratio="1.7778"
    />
    <v-img v-else :src="animatedImg" :alt="`Animated preview of ${title} in Cuttle`" aspect-ratio="1.7778" />
    <p class="mt-2">
      <v-icon v-if="icon" color="black" class="mr-2"> mdi-{{ icon }} </v-icon>
      <strong>{{ title }}:</strong>
      {{ description }}
    </p>
    <div class="d-flex justify-center">
      <v-btn :color="buttonColor" outlined @click="$emit('click', !animate)">
        <v-icon>{{ buttonIcon }}</v-icon>
        {{ buttonText }}
      </v-btn>
    </div>
  </div>
</template>
<script>
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
    animatedImg: {
      type: String,
      default: '',
    },
    staticImg: {
      type: String,
      required: true,
    },
    animate: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
  },
  computed: {
    buttonText() {
      return this.animate ? 'Stop Preview' : `Preview ${this.title}`;
    },
    buttonIcon() {
      return this.animate ? 'mdi-stop' : 'mdi-play';
    },
    buttonColor() {
      return this.animate ? 'secondary' : 'primary';
    },
  },
};
</script>
