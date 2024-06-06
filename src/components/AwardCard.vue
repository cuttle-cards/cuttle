<template>
  <v-card
    class="d-flex align-center"
    :color="theme['neutral-lighten2']"
    :data-tournament="`${place}${suffix}`"
    :variant="isCard ? 'elevated' : 'text'"
  >
    <div class="medal-icon d-flex align-center bg-surface-2 pa-5">
      <v-icon
        size="48"
        :color="medalColor"
        icon="mdi-medal"
        aria-label="medal icon"
        aria-hidden="false"
        role="img"
      />
    </div>
    <div class="bg-surface-1 text text-center text-surface-2 px-10 py-5 d-flex flex-column align-center justify-center">
      <h3 class="mx-4">
        {{ username }}
      </h3>
      {{ isCard ? placeWithSuffix : '' }}
    </div>
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
    isCard: {
      type: Boolean,
      default: true,
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
