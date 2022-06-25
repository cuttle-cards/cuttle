<template>
  <div>
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
        chips
        deletable-chips
      />
    </div>
    <v-data-table
      :items="tableRows"
      :headers="tableColumns"
      :sort-by.sync="sortBy"
      :loading="loading"
      :item-class="tableRowClass"
    >
      <template #[`item.rank`]="{item, value}">
        <span :data-rank="item.username">{{ value }} </span>
      </template>
      <template v-for="week in ['total', ...selectedWeeks]" #[`item.week_${week}`]="{item, value}">
        <v-tooltip :key="`${item.username}_week_${week}_wins`" top v-if="value">
          <template #activator="{on, attrs}">
            <v-chip
              :key="`${item.username}_week_${week}`"
              :color="colorForScoreByWeek(week, value)"
              dark
              :outlined="['primary', '#000'].includes(colorForScoreByWeek(week, value))"
              v-bind="{
                ...attrs,
                ...dataAttribute(item.username, week),
              }"
              v-on="on"
            >
              {{ tableCell(item, week) }}
            </v-chip>
          </template>
          {{ playersBeaten(item.username, week) }}
        </v-tooltip>
      </template>
    </v-data-table>
  </div>
</template>
<script>
const Result = {
  WON: 1,
  LOST: 2,
  INCOMPLETE: -1,
};

export default {
  name: 'StatsLeaderboard',
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
      metricChoices: ['Points and Wins', 'Points Only', 'Wins Only'],
      selectedMetric: 'Points and Wins',
      weeks: [
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
      ],
      selectedWeeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    };
  },
  computed: {
    tableColumns() {
      if (!this.season || !this.season.rankings || this.season.rankings.length === 0) {
        return [];
      }
      const res = [
        { text: 'User', value: 'username' },
        { text: 'Rank', value: 'rank' },
        { text: 'Season Total', value: 'week_total' },
      ];
      // Add headers for each week
      for (const weekNum of this.selectedWeeks) {
        res.push({
          text: `Week ${weekNum}`,
          value: `week_${weekNum}`,
        });
      }
      return res;
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
      return this.season.rankings.map(playerStats => {
        const res = { total: 0 };
        const playerMatches = playerStats.matches;
        for (const weekNum of this.weeks.map(week => week.value)) {
          const matchesThisWeek = playerMatches[weekNum] || [];
          const wins = matchesThisWeek.filter(match => match.result === Result.WON);
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
      return this.playerWins.map(playerWins => {
        const res = { total: 0 };
        for (const weekNum in playerWins) {
          if (weekNum != 'total') {
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
      return this.playerScores.map(playerStats => playerStats.total).sort((a, b) => b - a);
    },
    theme() {
      return this.$vuetify.theme.themes.light;
    },
  },
  methods: {
    // Value displayed in each cell
    tableCell(item, week) {
      const wins = item[`week_${week}_wins`];
      const points = item[`week_${week}_points`];
      switch (this.selectedMetric) {
        case 'Points and Wins':
          return `W: ${wins}, P: ${points}`;
        case 'Points Only':
          return `${points}`;
        case 'Wins Only':
          return `${wins}`;
        default:
          return `W: ${wins}, P: ${points}`;
      }
    },
    colorForScore(score) {
      switch (score) {
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
    colorForTotalScore(score) {
      if (score === this.topTotalScores.first) {
        return this.theme.firstPlace;
      }
      if (score === this.topTotalScores.second) {
        return this.theme.secondPlace;
      }
      if (score === this.topTotalScores.third) {
        return this.theme.thirdPlace;
      }
      if (score > 0) {
        return 'primary';
      }
      return '#000';
    },
    colorForScoreByWeek(week, score) {
      return week === 'total' ? this.colorForTotalScore(score) : this.colorForScore(score);
    },
    /**
     * Returns an object for v-bind for testing attributes to identify table cell
     * @example {'points-2': 'someUserName'} identifies someUserNames' week-2 points
     * @param {String} username
     * @param {int} weekNum Which week
     */
    dataAttribute(username, weekNum) {
      const res = {};
      const attributeName = `week-${weekNum}`;
      res[attributeName] = username;
      return res;
    },
    /**
     * Returns concatenated usernames of all opponent's the specified player
     * defeated in the specified week
     * @param {string} username which player's defeated opponents to return
     * @param {string} weekNum which week to analyze (use 'total' for the total)
     */
    playersBeaten(username, weekNum) {
      const playerStats = this.season.rankings.find(player => player.username === username);
      if (!playerStats) {
        return '';
      }
      let playerMatches;
      // Aggregate all matches if looking at total
      if (weekNum === 'total') {
        playerMatches = Object.entries(playerStats.matches).reduce((wins, [week, matches]) => {
          return [...wins, ...matches];
        }, []);
        // Otherwise just show this week's matches
      } else {
        playerMatches = playerStats.matches[weekNum];
      }
      if (!playerMatches) {
        return [];
      }
      return playerMatches
        .filter(match => match.result === Result.WON)
        .map(match => match.opponent)
        .join(', ');
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
