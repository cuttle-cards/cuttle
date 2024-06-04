<template>
  <v-card
    class="d-flex align-center"
    :color="theme['neutral-lighten2']"
    :data-tournament="`${place}${suffix}`"
    :variant="isCard ? 'elevated' : 'text'"
  >
    <div class="medal-icon d-flex align-center" :class="[isCard ? 'white px-5 py-5' : 'cream']">
      <v-icon
        size="48"
        :color="medalColor"
        icon="mdi-medal"
        aria-label="medal icon"
        aria-hidden="false"
        role="img"
      />
    </div>
    <div
      class="text d-flex flex-column align-center px-10 text-center justify-center"
      :class="[isCard ? 'chocolate background-cream py-5' : 'cream']"
    >
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
.medal-icon.cream {
  background-color: rgba(var(--v-theme-surface-2));
}
.medal-icon.white {
  background-color: #fff;
}
.text {
  height: 100%;
}
.text.chocolate {
  color: rgba(var(--v-theme-surface-1));
}
.text.cream {
  color: rgba(var(--v-theme-surface-2));
}
.text.white {
  color: #fff;
}
.background-cream {
  background-color: rgba(var(--v-theme-surface-2));
}
</style>
