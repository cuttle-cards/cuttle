<template>
  <div>
    <!-- Select Metric and Weeks -->
    <div id="stats-table-upper-surface" class="d-flex align-end">
      <v-select
        v-model="selectedMetric"
        :items="metricChoices"
        label="Select Metric"
        class="filter-select mr-4 fit"
        data-cy="metric-select"
      />
      <v-select
        v-model="selectedWeeks"
        :items="weeks"
        label="Select Weeks"
        data-cy="week-select"
        class="flex-grow-1"
        menu-props="data-week-select-menu"
        multiple
      />
    </div>
    <!-- https://vuetifyjs.com/en/api/v-data-table/ -->
    <v-data-table
      :items="tableRows"
      :headers="tableColumns"
      :sort-by.sync="sortBy"
      :items-per-page="-1"
      :loading="loading"
      :item-class="tableRowClass"
    >
      <template #[`item.rank`]="{ item, value }">
        <span :data-rank="item.username">{{ value }} </span>
      </template>
      <!-- Customize the appearance of total column and column for each week -->
      <template v-for="week in ['total', ...selectedWeeks]" #[`item.week_${week}`]="{ item }">
        <stats-leaderboard-cell
          :key="`${item.username}_week_${week}_wins`"
          :player-row="item"
          :week="week"
          :selected-metric="selectedMetric"
          :players-beaten="playersBeaten(item.username, week)"
          :top-total-scores="topTotalScores"
        />
      </template>
    </v-data-table>
  </div>
</template>
<script>
import { uniq } from 'lodash';
import StatsLeaderboardCell from '@/components/StatsLeaderboardCell.vue';

const Result = require('../../../types/Result');

export const Metrics = {
  POINTS_AND_WINS: 1,
  POINTS_ONLY: 2,
  WINS_ONLY: 3,
};

export default {
  name: 'StatsLeaderboard',
  components: {
    StatsLeaderboardCell,
  },
  props: {
    loading: Boolean,
    season: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      sortBy: 'rank',
      selectedMetric: Metrics.POINTS_AND_WINS,
      selectedWeeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    };
  },
  computed: {
    tableColumns() {
      if (!this.season || !this.season.rankings || this.season.rankings.length === 0) {
        return [];
      }
      return [
        { text: 'User', value: 'username' },
        { text: 'Rank', value: 'rank' },
        { text: 'Season Total', value: 'week_total' },
        ...this.selectedWeeks.map((weekNum) => {
          return {
            text: `Week ${weekNum}`,
            value: `week_${weekNum}`,
          };
        }),
      ];
    },
    tableRows() {
      if (!this.season || !this.season.rankings || this.season.rankings.length === 0) {
        return [];
      }
      return this.season.rankings.map((playerStats, index) => {
        const playerWins = this.playerWins[index];
        const playerScores = this.playerScores[index];
        const res = {
          username: playerStats.username,
          week_total_wins: playerWins.total,
          week_total_points: playerScores.total,
          week_total: playerScores.total,
          rank: this.rank(playerScores.total),
        };
        for (const weekNum in playerStats.matches) {
          res[`week_${weekNum}`] = playerScores[weekNum];
          res[`week_${weekNum}_wins`] = playerWins[weekNum];
          res[`week_${weekNum}_points`] = playerScores[weekNum];
        }
        return res;
      });
    },
    playerWins() {
      if (!this.season || !this.season.rankings || this.season.rankings.length === 0) {
        return [];
      }
      return this.season.rankings.map((playerStats) => {
        const res = { total: 0 };
        const playerMatches = playerStats.matches;
        for (const weekNum of this.weeks.map((week) => week.value)) {
          const matchesThisWeek = playerMatches[weekNum] || [];
          const wins = matchesThisWeek.filter((match) => match.result === Result.WON);
          res.total += wins.length;
          res[`${weekNum}`] = wins.length;
        }
        return res;
      });
    },
    playerScores() {
      if (!this.season || !this.season.rankings || this.season.rankings.length === 0) {
        return [];
      }
      return this.playerWins.map((playerWins) => {
        const res = { total: 0 };

        // We need the entire playerWeeks object EXCEPT the total count
        const playerWinsByWeek = { ...playerWins };
        delete playerWinsByWeek['total'];

        for (const weekNum in { ...playerWinsByWeek }) {
          let pointsThisWeek = 0;
          if (this.topWinCountsPerWeek[weekNum].first === 0) {
            pointsThisWeek = 0;
          } else if (playerWins[weekNum] === this.topWinCountsPerWeek[weekNum].first) {
            pointsThisWeek = 5;
          } else if (playerWins[weekNum] === this.topWinCountsPerWeek[weekNum].second) {
            pointsThisWeek = 4;
          } else if (playerWins[weekNum] === this.topWinCountsPerWeek[weekNum].third) {
            pointsThisWeek = 3;
          } else if (playerWins[weekNum] > 0) {
            pointsThisWeek = 1;
          }
          res[weekNum] = pointsThisWeek;
          res.total += pointsThisWeek;
        }
        return res;
      });
    },
    topWinCountsPerWeek() {
      const res = {};
      for (const playerStats of this.playerWins) {
        for (const weekNum in playerStats) {
          // First time seeing a score for this week
          if (!(weekNum in res)) {
            const newWeek = {
              first: playerStats[weekNum],
              second: null,
              third: null,
            };
            res[weekNum] = newWeek;
          } else {
            // Tie for first
            if (playerStats[weekNum] === res[weekNum].first) {
              res[weekNum].third = res[weekNum].second;
              res[weekNum].second = res[weekNum].first;
            }
            // Current score is higher than max for this week
            if (playerStats[weekNum] > res[weekNum].first) {
              res[weekNum].third = res[weekNum].second;
              res[weekNum].second = res[weekNum].first;
              res[weekNum].first = playerStats[weekNum];
            } else if (playerStats[weekNum] < res[weekNum].first) {
              // New Score ties for 2nd
              if (playerStats[weekNum] === res[weekNum].second) {
                res[weekNum].third = res[weekNum].second;
              } else if (playerStats[weekNum] > res[weekNum].second) {
                // New score beats 2nd
                res[weekNum].third = res[weekNum].second;
                res[weekNum].second = playerStats[weekNum];
              } else if (playerStats[weekNum] > res[weekNum].third) {
                // New score beats 3rd
                res[weekNum].third = playerStats[weekNum];
              }
            }
          }
        }
      }
      return res;
    },
    topTotalScores() {
      const res = {
        first: 0,
        second: 0,
        third: 0,
      };
      for (const playerScore of this.playerScores) {
        // Top score
        if (playerScore.total >= res.first) {
          res.third = res.second;
          res.second = res.first;
          res.first = playerScore.total;
          // Second place score
        } else if (playerScore.total >= res.second) {
          res.third = res.second;
          res.second = playerScore.total;
        } else if (playerScore.total > res.third) {
          res.third = playerScore.total;
        }
      }
      return res;
    },
    totalScoresSorted() {
      return this.playerScores.map((playerStats) => playerStats.total).sort((a, b) => b - a);
    },
    theme() {
      return this.$vuetify.theme.themes.light;
    },
  },
  created() {
    // Define non-reactive attributes for selection options
    this.metricChoices = [
      { text: 'Points and Wins', value: Metrics.POINTS_AND_WINS },
      { text: 'Points Only', value: Metrics.POINTS_ONLY },
      { text: 'Wins Only', value: Metrics.WINS_ONLY },
    ];
    this.weeks = [
      { text: 'Week 1', value: 1 },
      { text: 'Week 2', value: 2 },
      { text: 'Week 3', value: 3 },
      { text: 'Week 4', value: 4 },
      { text: 'Week 5', value: 5 },
      { text: 'Week 6', value: 6 },
      { text: 'Week 7', value: 7 },
      { text: 'Week 8', value: 8 },
      { text: 'Week 9', value: 9 },
      { text: 'Week 10', value: 10 },
      { text: 'Week 11', value: 11 },
      { text: 'Week 12', value: 12 },
      { text: 'Week 13', value: 13 },
    ];
  },
  methods: {
    /**
     * Returns concatenated usernames of all opponent's the specified player
     * defeated in the specified week
     * @param {string} username which player's defeated opponents to return
     * @param {string} weekNum which week to analyze (use 'total' for the total)
     */
    playersBeaten(username, weekNum) {
      const playerStats = this.season.rankings.find((player) => player.username === username);
      if (!playerStats) {
        return '';
      }
      let playerMatches;
      // Aggregate all matches if looking at total
      if (weekNum === 'total') {
        playerMatches = Object.entries(playerStats.matches).reduce((wins, [, matches]) => {
          return [...wins, ...matches];
        }, []);
        // Otherwise just show this week's matches
      } else {
        playerMatches = playerStats.matches[weekNum];
      }
      if (!playerMatches) {
        return '';
      }
      return uniq(
        playerMatches.filter((match) => match.result === Result.WON).map((match) => match.opponent),
      ).join(', ');
    },
    isCurrentPlayer(username) {
      return username === this.$store.state.auth.username;
    },
    tableRowClass(item) {
      return this.isCurrentPlayer(item.username) ? 'active-user-stats' : '';
    },
    // Compute rank from total score
    rank(totalScore) {
      return this.totalScoresSorted.indexOf(totalScore) + 1;
    },
  },
};
</script>

<style scoped>
::v-deep .active-user-stats {
  background-color: var(--v-accent-lighten3);
}
::v-deep .v-select.fit {
  width: min-content;
}
::v-deep .v-select.fit .v-select__selection--comma {
  text-overflow: unset;
}
</style>
