<template>
  <BaseMenu v-if="points" v-model="showMenu" :title="`${username} ${menuHeader} ${t('stats.results')}`">
    <template #activator="{ props }">
      <v-chip
        :color="colorForScore"
        :variant="variant"
        class="pointer"
        :class="colorForScore === 'surface-2' ? 'text-surface-1' : 'text-surface-2'"
        rounded="sm"
        :data-cy="`week-${week}-points-${playerRow.username}`"
        v-bind="{
          ...props,
        }"
      >
        {{ points }}
      </v-chip>
    </template>
    <template #body>
      <h3>{{ t('stats.wins') }}</h3>
      <v-list :data-players-beaten="`${username}-week-${week}`" bg-color="surface-2" class="text-surface-1">
        {{ playersBeatenText }}
      </v-list>
      <h3>{{ t('stats.losses') }}</h3>
      <v-list :data-players-lost-to="`${username}-week-${week}`" bg-color="surface-2" class="text-surface-1">
        {{ playersLostToText }}
      </v-list>
      <h3>{{ t('stats.winRate') }}</h3>
      <v-list :data-win-rate="`${username}-week-${week}`" bg-color="surface-2" class="text-surface-1">
        {{ winRateText }}
      </v-list>
    </template>
  </BaseMenu>
</template>

<script>
import { useI18n } from 'vue-i18n';
import BaseMenu from '@/components/BaseMenu.vue';

export default {
  name: 'StatsLeaderboardCell',
  components: {
    BaseMenu,
  },
  props: {
    playerRow: {
      type: Object,
      required: true,
    },
    week: {
      type: [ Number, String ],
      required: true,
      validator: (val) => [ 'total', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ].includes(val),
    },
    playersBeaten: {
      type: String,
      default: '',
    },
    playersLostTo: {
      type: String,
      default: '',
    },
    topTotalScores: {
      type: Object,
      required: true,
    },
    seasonName: {
      type: String,
      default: '',
    },
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      showMenu: false,
    };
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes.cuttleTheme.colors;
    },
    username() {
      return this.playerRow.username;
    },
    wins() {
      return this.playerRow[`week_${this.week}_wins`];
    },
    points() {
      return this.playerRow[`week_${this.week}_points`];
    },
    weekCount() {
      return this.playerRow[`week_${this.week}_count`];
    },
    colorForScore() {
      return this.week === 'total' ? this.colorForTotalScore : this.colorForWeeklyScore;
    },
    colorForTotalScore() {
      if (this.points === this.topTotalScores.first) {
        return this.theme.firstPlace;
      }
      if (this.points === this.topTotalScores.second) {
        return this.theme.secondPlace;
      }
      if (this.points === this.topTotalScores.third) {
        return 'surface-2';
      }
      return '#000';
    },
    colorForWeeklyScore() {
      switch (this.points) {
        case 5:
          return this.theme.firstPlace;
        case 4:
          return this.theme.secondPlace;
        case 3:
          return 'surface-2';
        case 2:
        case 1:
        default:
          return '#000';
      }
    },
    variant() {
      switch (this.colorForScore) {
        case this.theme.firstPlace:
        case this.theme.secondPlace:
        case 'surface-2':
          return 'flat';
        default:
          return 'outlined';
      }
    },
    winRatePercentage() {
      const winRate = Math.floor((this.wins / this.weekCount) * 100);
      return `${winRate}%`;
    },
    losses() {
      return this.weekCount - this.wins;
    },
    winRateText() {
      return `${this.winRatePercentage} (${this.wins} Won, ${this.losses} Lost, ${this.weekCount} Total)`;
    },
    menuHeader() {
      return this.week === 'total' ? this.seasonName : `Week ${this.week}`;
    },
    playersBeatenText() {
      return this.playersBeaten !== '' ? this.playersBeaten : 'None';
    },
    playersLostToText() {
      return this.playersLostTo !== '' ? this.playersLostTo : 'None';
    },
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
