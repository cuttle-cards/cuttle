<template>
  <v-card class="d-flex align-center" color="#eee" :data-tournament="`${place}${suffix}`">
    <div class="medal-icon pa-8 d-flex align-center">
      <v-icon size="48" :color="medalColor">
        mdi-medal
      </v-icon>
    </div>
    <div class="text d-flex flex-column align-center px-16 justify-center">
      <h3 class="mx-4">
        {{ username }}
      </h3>
      {{ place }}{{ suffix }}
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
    medalColor() {
      switch (this.place) {
        case 1:
          return '#AF9500';
        case 2:
          return '#B4B4B4';
        case 3:
          return '#6A3805';
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
