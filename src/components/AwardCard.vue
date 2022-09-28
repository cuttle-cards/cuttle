<template>
  <v-card class="d-flex align-center" :color="theme.neutral.lighten2" :data-tournament="`${place}${suffix}`">
    <div class="medal-icon pa-8 d-flex align-center">
      <v-icon size="48" :color="medalColor" icon="mdi-medal" />
    </div>
    <div class="text d-flex flex-column align-center px-16 justify-center">
      <h3 class="mx-4">
        {{ username }}
      </h3>
      {{ placeWithSuffix }}
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'AwardCard',
  props: {
    username: String,
    place: Number,
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes.light;
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
  background-color: #fff;
}
.text {
  height: 100%;
}
</style>
