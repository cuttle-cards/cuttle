<template>
  <div data-cy="stats-leaderboard">
    <!-- Select Metric and Weeks -->
    <div id="stats-table-upper-surface" class="d-flex align-end">
      <v-select
        v-model="selectedMetric"
        :items="metricChoices"
        :label="t('stats.selectMetric')"
        class="filter-select mr-4 fit"
        data-cy="metric-select"
      />
      <v-select
        v-model="selectedWeeks"
        :items="weeks"
        :label="t('stats.selectWeeks')"
        class="week-select"
        data-cy="week-select"
        multiple
      />
    </div>
    <v-table>
      <!-- Headers -->
      <tr>
        <th v-for="header in tableColumns" :key="header.value">
          {{ header.text }}
        </th>
      </tr>
      <!-- Body -->
      <tbody>
        <tr v-for="row in tableRows" :key="row.username" :class="tableRowClass(row)">
          <!-- Username -->
          <td :data-username="row.username">
            {{ row.username }}
          </td>
          <!-- Rank -->
          <td :data-rank="row.username">
            {{ row.rank }}
          </td>
          <td v-for="(week) in ['total', ...selectedWeeks]" :key="`${row.username}-${week}`">
            <StatsLeaderboardCell
              :player-row="row"
              :week="week"
              :selected-metric="selectedMetric"
              :players-beaten="playersBeaten(row.username, week)"
              :players-lost-to="playersLostTo(row.username, week)"
              :top-total-scores="topTotalScores"
              :season-name="seasonName"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { uniq, countBy } from 'lodash';
import { useI18n } from 'vue-i18n';
import StatsLeaderboardCell from '@/routes/stats/components/StatsLeaderboardCell.vue';
import Result from '_/types/Result';

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
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      sortBy: 'rank',
      selectedMetric: Metrics.POINTS_AND_WINS,
      selectedWeeks: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ],
    };
  },
  computed: {
    ...mapStores(useAuthStore),
    noSeasonRankingsExist() {
      return !this.season || !this.season.rankings || this.season.rankings.length === 0;
    },
    tableColumns() {
      if (this.noSeasonRankingsExist) {
        return [];
      }
      return [
        { text: this.t('global.user'), value: 'username' },
        { text: this.t('global.rank'), value: 'rank' },
        { text: this.t('stats.seasonTotal'), value: 'week_total' },
        ...this.selectedWeeks.map((weekNum) => {
          return {
            text: `${this.t('stats.week')} ${weekNum}`,
            value: `week_${weekNum}`,
          };
        }),
      ];
    },
    tableRows() {
      if (this.noSeasonRankingsExist) {
        return [];
      }

      return this.season.rankings.map((playerStats, index) => {
        const playerMatches = this.playerMatches[index];
        const playerScores = this.playerScores[index];
        // Count matches completed per week and in total
        const playerMatchesCount = Object.values(playerStats.matches).reduce(
          (totalCount, weekMatches) =>
            (totalCount += weekMatches.filter((match) =>
              [ Result.WON, Result.LOST ].includes(match.result),
            ).length),
          0,
        );
        const res = {
          username: playerStats.username,
          week_total_count: playerMatchesCount,
          week_total_wins: playerMatches.totalWins,
          week_total_points: playerScores.total,
          week_total: playerScores.total,
          rank: this.rank({ totalScore: playerScores.total, totalWins: playerMatches.totalWins }),
        };
        for (const weekNum in playerStats.matches) {
          res[`week_${weekNum}`] = playerScores[weekNum];
          res[`week_${weekNum}_count`] = playerStats.matches[weekNum].length;
          res[`week_${weekNum}_wins`] = playerMatches[weekNum].winCount;
          res[`week_${weekNum}_points`] = playerScores[weekNum];
        }
        return res;
      }).sort((player1, player2) => player1.rank - player2.rank);
    },
    playerMatches() {
      if (this.noSeasonRankingsExist) {
        return [];
      }
      return this.season.rankings.map((playerStats) => {
        const res = { totalWins: 0 };
        const playerMatches = playerStats.matches;
        for (const weekNum of this.weeks.map((week) => week.value)) {
          const matchesThisWeek = playerMatches[weekNum] || [];
          const wins = matchesThisWeek.filter((match) => match.result === Result.WON);
          const losses = matchesThisWeek.filter((match) => match.result === Result.LOST);
          res.totalWins += wins.length;
          res[`${weekNum}`] = {
            winCount: wins.length,
            lossCount: losses.length,
            totalCount: matchesThisWeek.length,
          };
        }
        return res;
      });
    },
    playerScores() {
      if (this.noSeasonRankingsExist) {
        return [];
      }
      return this.playerMatches.map((playerMatches) => {
        const res = { total: 0 };

        // We need the entire playerWeeks object EXCEPT the total count
        const playerMatchesByWeek = { ...playerMatches };
        delete playerMatchesByWeek['totalWins'];

        for (const weekNum in { ...playerMatchesByWeek }) {
          let pointsThisWeek = 0;
          if (this.topWinCountsPerWeek[weekNum].first === 0) {
            pointsThisWeek = 0;
          } else if (playerMatches[weekNum].winCount === this.topWinCountsPerWeek[weekNum].first) {
            pointsThisWeek = 5;
          } else if (playerMatches[weekNum].winCount === this.topWinCountsPerWeek[weekNum].second) {
            pointsThisWeek = 4;
          } else if (playerMatches[weekNum].winCount === this.topWinCountsPerWeek[weekNum].third) {
            pointsThisWeek = 3;
          } else if (playerMatches[weekNum].winCount > 0) {
            pointsThisWeek = 2;
          } else if (playerMatches[weekNum].totalCount > 0) {
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
      for (const playerStats of this.playerMatches) {
        for (const weekNum in playerStats) {
          // First time seeing a score for this week
          if (!(weekNum in res)) {
            const newWeek = {
              first: playerStats[weekNum].winCount,
              second: null,
              third: null,
            };
            res[weekNum] = newWeek;
          } else {
            // Tie for first
            if (playerStats[weekNum].winCount === res[weekNum].first) {
              res[weekNum].third = res[weekNum].second;
              res[weekNum].second = res[weekNum].first;
            }
            // Current score is higher than max for this week
            if (playerStats[weekNum].winCount > res[weekNum].first) {
              res[weekNum].third = res[weekNum].second;
              res[weekNum].second = res[weekNum].first;
              res[weekNum].first = playerStats[weekNum].winCount;
            } else if (playerStats[weekNum].winCount < res[weekNum].first) {
              // New Score ties for 2nd
              if (playerStats[weekNum].winCount === res[weekNum].second) {
                res[weekNum].third = res[weekNum].second;
              } else if (playerStats[weekNum].winCount > res[weekNum].second) {
                // New score beats 2nd
                res[weekNum].third = res[weekNum].second;
                res[weekNum].second = playerStats[weekNum].winCount;
              } else if (playerStats[weekNum].winCount > res[weekNum].third) {
                // New score beats 3rd
                res[weekNum].third = playerStats[weekNum].winCount;
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
    playerRankingsSorted() {
      let scoreboard = [];
      if (this.noSeasonRankingsExist) {
        return scoreboard;
      }

      for (let i = 0; i < this.season.rankings.length; i++) {
        scoreboard.push({
          totalScore: this.playerScores[i].total,
          totalWins: this.playerMatches[i].totalWins,
        });
      }

      // sort and prioritize total scores before taking into account total wins
      return scoreboard.sort((a, b) => {
        if (b.totalScore > a.totalScore) {
          return 1;
        }
        if (b.totalScore < a.totalScore) {
          return -1;
        }
        return b.totalWins - a.totalWins;
      });
    },
    theme() {
      return this.$vuetify.theme.themes.light;
    },
    seasonName() {
      return this.season.name;
    },
  },
  created() {
    // Define non-reactive attributes for selection options
    this.metricChoices = [
      { title: this.t('stats.pointsAndWins'), value: Metrics.POINTS_AND_WINS },
      { title: this.t('stats.pointsOnly'), value: Metrics.POINTS_ONLY },
      { title: this.t('stats.winsOnly'), value: Metrics.WINS_ONLY },
    ];
    this.weeks = [
      { title: `${this.t('stats.week')} 1`, value: 1 },
      { title: `${this.t('stats.week')} 2`, value: 2 },
      { title: `${this.t('stats.week')} 3`, value: 3 },
      { title: `${this.t('stats.week')} 4`, value: 4 },
      { title: `${this.t('stats.week')} 5`, value: 5 },
      { title: `${this.t('stats.week')} 6`, value: 6 },
      { title: `${this.t('stats.week')} 7`, value: 7 },
      { title: `${this.t('stats.week')} 8`, value: 8 },
      { title: `${this.t('stats.week')} 9`, value: 9 },
      { title: `${this.t('stats.week')} 10`, value: 10 },
      { title: `${this.t('stats.week')} 11`, value: 11 },
      { title: `${this.t('stats.week')} 12`, value: 12 },
      { title: `${this.t('stats.week')} 13`, value: 13 },
    ];
  },
  methods: {
    playersByResult(username, result, weekNum) {
      const playerStats = this.season.rankings.find((player) => player.username === username);
      if (!playerStats) {
        return '';
      }
      let playerMatches;
      // Aggregate all matches if looking at total
      if (weekNum === 'total') {
        playerMatches = Object.entries(playerStats.matches).reduce((wins, [ , matches ]) => {
          return [ ...wins, ...matches ];
        }, []);
        // Otherwise just show this week's matches
      } else {
        playerMatches = playerStats.matches[weekNum];
      }
      if (!playerMatches) {
        return '';
      }
      let opponents = playerMatches.filter((match) => match.result === result).map((match) => match.opponent);

      // If looking at total, show number of times each opponent appeared in the wins or losses
      if (weekNum === 'total') {
        opponents = Object.entries(countBy(opponents))
          .sort((x, y) => {
            return y[1] - x[1];
          })
          .map(([ opponent, matches ]) => `${opponent} (${matches})`);
        // Otherwise just show each opponent's name
      } else {
        opponents = uniq(opponents);
      }
      return opponents.join(', ');
    },
    /**
     * Returns concatenated usernames of all opponent's the specified player
     * defeated in the specified week
     * @param {string} username which player's defeated opponents to return
     * @param {string} weekNum which week to analyze (use 'total' for the total)
     */
    playersBeaten(username, weekNum) {
      return this.playersByResult(username, Result.WON, weekNum);
    },
    /**
     * Returns concatenated usernames of all opponent's the specified player
     * was defeated by in the specified week
     * @param {string} username which player's defeated opponents to return
     * @param {string} weekNum which week to analyze (use 'total' for the total)
     */
    playersLostTo(username, weekNum) {
      return this.playersByResult(username, Result.LOST, weekNum);
    },
    isCurrentPlayer(username) {
      return username === this.authStore.username;
    },
    tableRowClass(item) {
      return this.isCurrentPlayer(item.username) ? 'active-user-stats' : '';
    },
    /**
     * @description Compute rank from total score and wins
     */
    rank(player) {
      return (
        this.playerRankingsSorted.findIndex(
          ({ totalScore, totalWins }) => totalScore === player.totalScore && totalWins === player.totalWins,
        ) + 1
      );
    },
  },
};
</script>

<style scoped>
th {
  text-align: left;
}
.active-user-stats {
  background-color: rgba(var(--v-theme-accent-lighten3));
}
.week-select {
  width: 60%;
}
</style>
