<template>
  <div class="point-counter">
    <div class="point-counter__current-points">{{ currentPoints }}</div>
    <div class="point-counter__total-points">{{ pointsToWin }}</div>
    <v-menu :top="isPlayer" :bottom="!isPlayer" offset-y>
      <template #activator="{ on, attrs }">
        <v-btn class="mb-2" x-small icon v-bind="attrs" v-on="on">
          <v-icon color="white" small> mdi-information </v-icon>
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
  border: 1px solid black;
}
</style>
