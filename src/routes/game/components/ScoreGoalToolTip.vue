<template>
  <span>
    <span class="ml-4" :data-cy="dataCyName"> {{ $t('game.counter.goal') }}: {{ pointsToWin }} </span>
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
        <v-list-item :class="{ 'current-goal': kingCount === 0 }"> 
          {{ t('game.counter.kings', {count : 0}) }}: 21pts 
        </v-list-item>
        <v-list-item :class="{ 'current-goal': kingCount === 1 }">
          {{ t('game.counter.kings', {count : 1}) }}: 14pts 
        </v-list-item>
        <v-list-item :class="{ 'current-goal': kingCount === 2 }">
          {{ t('game.counter.kings', 2) }}: 10pts
        </v-list-item>
        <v-list-item :class="{ 'current-goal': kingCount === 3 }">
          {{ t('game.counter.kings', {count: 3}) }}: 5pts
        </v-list-item>
        <v-list-item :class="{ 'current-goal': kingCount === 4 }">
          {{ t('game.counter.kings', {count: 4}) }}: 0pts
        </v-list-item>
      </v-list>
    </v-menu>
  </span>
</template>

<script>
import { useI18n } from 'vue-i18n';

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
  setup() {
    const { t } = useI18n();
    return { t };
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
