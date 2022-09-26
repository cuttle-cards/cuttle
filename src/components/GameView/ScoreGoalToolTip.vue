<template>
  <span>
    <span class="ml-4" :data-cy="dataCyName"> GOAL: {{ pointsToWin }} </span>
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
        <v-list-item :class="{ 'current-goal': kingCount === 3 }"> 3 Kings: 7pts </v-list-item>
        <v-list-item :class="{ 'current-goal': kingCount === 4 }"> 4 Kings: 5pts </v-list-item>
      </v-list>
    </v-menu>
  </span>
</template>

<script>
export default {
  name: 'ScoreGoalTooltip',
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
    dataCyName() {
      return this.isPlayer ? 'player-player-points-to-win' : 'opponent-points-to-win';
    },
  },
};
</script>

<style lang="scss" scoped>
.score-goal-explanation .current-goal {
  background-color: var(--v-accent-lighten1);
}
</style>
