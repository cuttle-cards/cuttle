<template>
  <v-card
    class="d-flex align-center pa-5"
    :color=" variant === 'dark' ? 'game-board' : 'game-card'"
    :data-tournament="`${place}${suffix}`"
    min-width="224"
    variant="elevated"
  >
    <img :src="`/img/statsView/medal-${placeWithSuffix}-place.svg`" :alt="`Medal for ${placeWithSuffix} place`">
    <h3 class="mx-4" :class="variant === 'dark' ? 'text-game-card' : 'text-game-board'">
      {{ username }}
    </h3>
  </v-card>
</template>

<script>
export default {
  name: 'AwardCard',
  props: {
    username: {
      type: String,
      default: '',
    },
    place: {
      type: Number,
      required: true,
    },
    variant: {
      type: String,
      default: 'dark',
      validator: (val) => [ 'light', 'dark' ].includes(val),
    },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes.cuttleTheme.colors;
    },
    medalColor() {
      switch (this.place) {
        case 1:
          return this.theme.firstPlace;
        case 2:
          return this.theme.secondPlace;
        case 3:
          return this.theme.thirdPlace;
        default:
          return '#000';
      }
    },
    suffix() {
      switch (this.place) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    },
    placeWithSuffix() {
      return `${this.place}${this.suffix}`;
    },
  },
};
</script>

<style scoped>
.medal-icon {
  height: 100%;
}
.text {
  height: 100%;
}
</style>
