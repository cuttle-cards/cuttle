<template>
  <div class="point-counter__wrapper">
    <div
      class="d-flex flex-column justify-start align-center rounded point-counter"
    >
      <div class="point-counter__current-points">{{ currentPoints }}</div>
      <div class="point-counter__total-points">{{ pointsToWin }}</div>
      <v-menu :top="isPlayer" :bottom="!isPlayer" offset-y>
        <template #activator="{ on, attrs }">
          <v-btn class="mb-2" x-small icon v-bind="attrs" v-on="on">
            <v-icon class="point-counter__icon" color="white" small> mdi-information </v-icon>
          </v-btn>
        </template>
        <v-list class="score-goal-explanation">
          <v-list-item :class="{ 'current-goal': kingCount === 0 }"> 0 Kings: 21pts </v-list-item>
          <v-list-item :class="{ 'current-goal': kingCount === 1 }"> 1 King: 14pts </v-list-item>
          <v-list-item :class="{ 'current-goal': kingCount === 2 }"> 2 Kings: 10pts </v-list-item>
          <v-list-item :class="{ 'current-goal': kingCount === 3 }"> 3 Kings: 5pts </v-list-item>
          <v-list-item :class="{ 'current-goal': kingCount === 4 }"> 4 Kings: 0pts </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PointCounter',
  props: {
    kingCount: {
      required: true,
      type: Number, // 0-4
    },
    pointsToWin: {
      required: true,
      type: Number,
    },
    isPlayer: {
      default: true,
      type: Boolean,
    },
  },
  computed: {
    ...mapGetters([
      'playerPointTotal',
      'opponentPointTotal',
    ]),
    currentPoints() {
      return this.isPlayer ? this.playerPointTotal : this.opponentPointTotal;
    },
  },
};
</script>

<style scoped>
.point-counter__wrapper {
  filter: drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5));
  background-color: rgba(241, 200, 160, .75);
  border: 2px solid rgb(241, 200, 160);
  clip-path: polygon(0 0, 100% 0, 100% 93%, 50% 100%, 0 93%);
}

.point-counter {
  font-weight: bold;
  color: #f3f3f3;
  font-family: 'Cormorant Infant', Century Gothic, CenturyGothic, AppleGothic, sans-serif;
  padding: 0 0.25rem;
  text-shadow: 1px 1px 5px #111111;
  /*clip-path: polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%);*/
}

.point-counter__current-points {
  padding-bottom: 0;
  border-bottom: 2px solid #f3f3f3;
  font-size: 1.5em;
}

.point-counter__total-points {
  font-size: 1.15em;
}
.point-counter__icon {
  text-shadow: 1px 1px 5px #111111;
  margin-top: 1.5rem;
}

@media screen and (min-width: 1024px) {
  .point-counter {
    padding: 0 0.5rem;
  }
  .point-counter__current-points {
    font-size: 3.5em;
  }
  .point-counter__total-points {
    font-size: 2em;
  }
}
</style>
