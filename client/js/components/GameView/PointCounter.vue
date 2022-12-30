<template>
  <div
    class="d-flex flex-column justify-start align-center elevation-10 rounded point-counter elevation-10"
  >
    <div class="point-counter__current-points">{{ currentPoints }}</div>
    <div class="point-counter__total-points">{{ pointsToWin }}</div>
    <v-menu :top="isPlayer" :bottom="!isPlayer" offset-y>
      <template #activator="{ on, attrs }">
        <v-btn class="mb-2" x-small icon v-bind="attrs" v-on="on">
          <v-icon color="white" medium> mdi-information </v-icon>
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
.point-counter {
  font-weight: bold;
  background-color: rgba(241, 200, 160, 0.5);
  border: 1px solid rgba(241, 200, 160);
  color: #111111;
  font-family: 'Cormorant Infant', Century Gothic, CenturyGothic, AppleGothic, sans-serif;
  padding: 0 0.25rem;
  text-shadow: 1px 1px rgba(241, 200, 160);
  clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);
}

.point-counter__current-points {
  border-bottom: 2px solid #f3f3f3;
  font-size: 1.5em;
}

.point-counter__total-points {
  font-size: 1.15em;
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
