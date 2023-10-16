<template>
  <span>
    <span class="ml-4" :data-cy="dataCyName"> GOAL: {{ pointsToWin }} </span>
    <v-menu :location="isPlayer ? 'top' : 'bottom'">
      <template #activator="{ props }">
        <v-btn 
          class="mb-2" 
          size="x-small" 
          icon 
          v-bind="props" 
          variant="plain"
          :aria-label="`Open scoring goal menu for ${isPlayer ? 'your score' : 'your opponents score'}`"
        >
          <v-icon 
            color="white" 
            icon="mdi-information" 
            size="small" 
            aria-hidden="true" 
          />
        </v-btn>
      </template>
      <v-list class="score-goal-explanation">
        <v-list-item 
          v-for="(points, index) in kingsPoints" 
          :key="index" 
          :class="{ 'current-goal': kingCount === index }"
        >
          {{ points }}
        </v-list-item>
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
  data() {
    return {
      kingsPoints: [
        '0 Kings: 21pts',
        '1 King: 14pts',
        '2 Kings: 10pts',
        '3 Kings: 5pts',
        '4 Kings: 0pts'
      ]
    };
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
  background-color: rgba(var(--v-theme-accent-lighten1));
}
</style>
