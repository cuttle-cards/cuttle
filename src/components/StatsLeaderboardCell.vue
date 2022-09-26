<template>
  <v-menu v-if="points" v-model="showMenu" top>
    <template #activator="{ on, attrs }">
      <v-chip
        :color="colorForScore"
        :outlined="outlined"
        class="pointer"
        v-bind="{
          ...attrs,
          ...dataAttribute,
        }"
        dark
        v-on="on"
      >
        {{ chipText }}
      </v-chip>
    </template>
    <v-card :data-players-beaten="`${username}-week-${week}`">
      <v-card-title>Players Beaten</v-card-title>
      <v-card-text>
        <v-list>
          {{ playersBeaten }}
        </v-list>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn data-cy="close-players-beaten" outlined color="primary" @click="showMenu = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { Metrics } from '@/components/StatsLeaderboard.vue';

export default {
  name: 'StatsLeaderboardCell',
  props: {
    playerRow: {
      type: Object,
      required: true,
    },
    week: {
      type: [Number, String],
      required: true,
      validator: (val) => ['total', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].includes(val),
    },
    selectedMetric: {
      type: Number,
      required: true,
    },
    playersBeaten: {
      type: String,
      default: '',
    },
    topTotalScores: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showMenu: false,
    };
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes.light;
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
        case 1:
          return 'primary';
        default:
          return '#000';
      }
    },
    outlined() {
      return ['primary', '#000'].includes(this.colorForScore);
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
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
