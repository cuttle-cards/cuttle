<template>
  <v-menu v-if="points" v-model="showMenu" location="top">
    <template #activator="{ props }">
      <v-chip
        :color="colorForScore"
        :variant="variant"
        class="pointer"
        v-bind="{
          ...props,
          ...dataAttribute,
        }"
      >
        {{ chipText }}
      </v-chip>
    </template>
    <v-card :data-player-results="`${username}-week-${week}`">
      <v-card-title>{{ username }} {{ menuHeader }} {{ t('stats.results') }}</v-card-title>
      <v-card-text>
        <h3>{{ t('stats.wins') }}</h3>
        <v-list :data-players-beaten="`${username}-week-${week}`">
          {{ playersBeatenText }}
        </v-list>
        <h3>{{ t('stats.losses') }}</h3>
        <v-list :data-players-lost-to="`${username}-week-${week}`">
          {{ playersLostToText }}
        </v-list>
        <h3>{{ t('stats.winRate') }}</h3>
        <v-list :data-win-rate="`${username}-week-${week}`">
          {{ winRateText }}
        </v-list>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          data-cy="close-player-results"
          variant="outlined"
          color="primary"
          @click="showMenu = false"
        >
          {{ t('global.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { Metrics } from '@/routes/stats/components/StatsLeaderboard.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'StatsLeaderboardCell',
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
    selectedMetric: {
      type: Number,
      required: true,
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
    chipText() {
      switch (this.selectedMetric) {
        case Metrics.POINTS_AND_WINS:
          return `W: ${this.wins}, P: ${this.points}`;
        case Metrics.POINTS_ONLY:
          return `${this.points}`;
        case Metrics.WINS_ONLY:
          return `${this.wins}`;
        default:
          return `W: ${this.wins}, P: ${this.points}`;
      }
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
        return this.theme.thirdPlace;
      }
      if (this.points > 0) {
        return 'primary';
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
          return this.theme.thirdPlace;
        case 2:
          return 'primary';
        case 1:
          return 'neutral-darken-3';
        default:
          return '#000';
      }
    },
    variant() {
      switch (this.colorForScore) {
        case this.theme.firstPlace:
        case this.theme.secondPlace:
        case this.theme.thirdPlace:
          return 'elevated';
        default:
          return 'outlined';
      }
    },
    /**
     * Returns an object for v-bind for testing attributes to identify table cell
     * @example {'data-points-2': 'someUserName'} identifies someUserNames' data-week-2 points
     */
    dataAttribute() {
      const res = {};
      const attributeName = `data-week-${this.week}`;
      res[attributeName] = this.username;
      return res;
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
