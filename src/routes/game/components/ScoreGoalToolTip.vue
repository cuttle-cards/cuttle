<template>
  <span>
    <span class="ml-4" :data-cy="dataCyName"> {{ $t('game.score.goal') }}: {{ pointsToWin }} </span>
    <BaseMenu v-model="show" :location="isPlayer ? 'top' : 'bottom'">
      <template #activator="{ props }">
        <v-btn
          class="mb-2"
          size="x-small"
          icon
          v-bind="{ ...props }"
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
      <template #body>
        <v-list class="score-goal-explanation" bg-color="surface-2" color="surface-1">
          <v-list-item 
            v-for="(explanation, index) in kingsPoints" 
            :key="index" 
            :class="{ 'current-goal': kingCount === index }"
          >
            {{ explanation }}
          </v-list-item>
        </v-list>
      </template>
    </BaseMenu>
  </span>
</template>

<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseMenu from '@/components/BaseMenu.vue';

export default {
  name: 'ScoreGoalTooltip',
  components: {
    BaseMenu,
  },
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
    const show = ref(false);
    return { t, show };
  },
  computed: {
    dataCyName() {
      return this.isPlayer ? 'player-player-points-to-win' : 'opponent-points-to-win';
    },
    kingsPoints() {
      return  [
        `${this.t('game.score.kings', 0)}: 21pts`,
        `${this.t('game.score.kings', 1)}: 14pts`,
        `${this.t('game.score.kings', 2)}: 10pts`,
        `${this.t('game.score.kings', 3)}: 5pts`,
        `${this.t('game.score.kings', 4)}: 0pts`
      ];
    }
  },
};
</script>

<style lang="scss" scoped>
.score-goal-explanation .current-goal {
  background-color: rgba(var(--v-theme-accent-lighten1));
}
</style>
