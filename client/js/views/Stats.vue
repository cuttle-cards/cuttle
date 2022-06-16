<template>
  <div id="stats-wrapper">
    <!-- Upper Service -->
    <section id="upper-surface" class="pa-8 mb-6">
      <v-select
        v-model="selectedSeason"
        :items="seasons"
        label="Select Season"
        data-cy="season-select"
        return-object
        item-text="name"
      >
        <template #selection="{ item }">
          <h1 class="text-h2" data-cy="selected-season-header">
            {{ item.name }}
          </h1>
        </template>
      </v-select>
    </section>
    <section class="px-8">
      <!-- Season Champions -->
      <div class="mb-10">
        <h2
          v-if="
            selectedSeason &&
              (selectedSeason.bracketLink ||
                selectedSeason.firstPlace ||
                selectedSeason.secondPlace ||
                selectedSeason.thirdPlace)
          "
          class="text-h3 mb-4"
        >
          Season Champions
        </h2>
        <div class="d-flex justify-space-around flex-wrap">
          <award-card
            v-if="selectedSeason && selectedSeason.firstPlace"
            :username="selectedSeason.firstPlace"
            :place="1"
            class="mb-4"
          />
          <award-card
            v-if="selectedSeason && selectedSeason.secondPlace"
            :username="selectedSeason.secondPlace"
            :place="2"
            class="mb-4"
          />
          <award-card
            v-if="selectedSeason && selectedSeason.thirdPlace"
            :username="selectedSeason.thirdPlace"
            :place="3"
            class="mb-4"
          />
        </div>
        <p v-if="selectedSeason && selectedSeason.bracketLink">
          Click
          <a :href="selectedSeason.bracketLink" data-cy="tournament-bracket-link">
            here to see the official tournament bracket
          </a>
        </p>
        <p v-if="selectedSeason && selectedSeason.footageLink">
          Click
          <a :href="selectedSeason.footageLink" data-cy="tournament-footage-link">
            here to watch the official tournament footage
          </a>
          with play-by-play commentary.
        </p>
      </div>
      <!-- Rankings Table -->
      <h2 class="text-h3 my-4">
        Weekly Rankings
      </h2>
      <div id="stat-table-wrapper">
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
          :loading="loadingData"
          :item-class="tableRowClass"
        >
          <!-- Customize win count -->
          <template
            v-for="week in ['total', ...selectedWeeks]"
            #[`item.${week}_wins`]="{item, value}"
          >
            <v-tooltip :key="`${item.username}_week_${week}_wins`" top>
              <template #activator="{on, attrs}">
                <span
                  v-bind="{
                    ...attrs,
                    ...dataAttribute(item.username, week, 'wins'),
                  }"
                  v-on="on"
                >
                  {{ value }}
                </span>
              </template>
              {{ playersBeaten(item.username, week) }}
            </v-tooltip>
          </template>
          <!-- Total Point counts -->
          <template #[`item.total_points`]="{item, value}">
            <v-chip
              :key="`${item.username}_week_total_points`"
              :color="colorForTotalScore(value)"
              dark
              :outlined="['primary', '#000'].includes(colorForTotalScore(value))"
              v-bind="dataAttribute(item.username, 'total', 'points')"
            >
              {{ value }}
            </v-chip>
          </template>
          <!-- Point counts per week -->
          <template v-for="week in selectedWeeks" #[`item.${week}_points`]="{item, value}">
            <v-chip
              v-if="value"
              :key="`${item.username}_week_${week}_points`"
              :color="colorForScore(value)"
              dark
              :outlined="['primary', '#000'].includes(colorForScore(value))"
              v-bind="dataAttribute(item.username, week, 'points')"
            >
              {{ value }}
            </v-chip>
          </template>
        </v-data-table>
      </div>
    </section>
  </div>
</template>

<script>
import { io } from '@/plugins/sails.js';
import AwardCard from '@/components/AwardCard.vue';

const Result = {
  WON: 1,
  LOST: 2,
  INCOMPLETE: -1,
};

export default {
  name: 'Stats',
  components: {
    AwardCard,
  },
  data() {
    return {
      Result,
      loadingData: false,
      selectedSeason: null,
      metricChoices: ['Points and Wins', 'Points Only', 'Wins Only'],
      selectedMetric: 'Points and Wins',
      seasons: [],
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
      if (
        !this.selectedSeason ||
        !this.selectedSeason.rankings ||
        this.selectedSeason.rankings.length === 0
      ) {
        return [];
      }
      const res = [{ text: 'User', value: 'username' }];
      // Add points total if looking at points
      if (['Points and Wins', 'Points Only'].includes(this.selectedMetric)) {
        res.push({ text: 'Total Points', value: 'total_points' });
      }
      // Add wins total if looking at wins
      if (['Points and Wins', 'Wins Only'].includes(this.selectedMetric)) {
        res.push({ text: 'Total Wins', value: 'total_wins' });
      }
      // Add headers for each week
      for (const weekNum of this.selectedWeeks) {
        if (['Points and Wins', 'Wins Only'].includes(this.selectedMetric)) {
          res.push({
            text: `Week ${weekNum} Wins`,
            value: `${weekNum}_wins`,
          });
        }
        if (['Points and Wins', 'Points Only'].includes(this.selectedMetric)) {
          res.push({
            text: `Week ${weekNum} Points`,
            value: `${weekNum}_points`,
          });
        }
      }
      return res;
    },
    tableRows() {
      if (
        !this.selectedSeason ||
        !this.selectedSeason.rankings ||
        this.selectedSeason.rankings.length === 0
      ) {
        return [];
      }
      return this.selectedSeason.rankings.map((playerStats, index) => {
        const playerWins = this.playerWins[index];
        const playerScores = this.playerScores[index];
        const res = {
          username: playerStats.username,
          total_wins: playerWins.total,
          total_points: playerScores.total,
        };
        for (const weekNum in playerStats.matches) {
          res[`${weekNum}_wins`] = playerWins[weekNum];
          res[`${weekNum}_points`] = playerScores[weekNum];
        }
        return res;
      });
    },
    playerWins() {
      if (
        !this.selectedSeason ||
        !this.selectedSeason.rankings ||
        this.selectedSeason.rankings.length === 0
      ) {
        return [];
      }
      return this.selectedSeason.rankings.map(playerStats => {
        const res = { total: 0 };
        for (const [weekNum, matches] of Object.entries(playerStats.matches)) {
          if (this.selectedWeeks.includes(Number(weekNum))) {
            const wins = matches.filter(match => match.result === Result.WON);
            res.total += wins.length;
            // res[`${weekNum}_wins`] = wins.map(match => match.opponent).join(', ');
            res[weekNum] = wins.length;
          }
        }
        return res;
      });
    },
    playerScores() {
      if (
        !this.selectedSeason ||
        !this.selectedSeason.rankings ||
        this.selectedSeason.rankings.length === 0
      ) {
        return [];
      }
      return this.playerWins.map(playerWins => {
        const res = { total: 0 };
        for (const weekNum in playerWins) {
          if (weekNum != 'total') {
            let pointsThisWeek = 0;
            if (playerWins[weekNum] === this.topWinCountsPerWeek[weekNum].first) {
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
  },
  created() {
    this.loadingData = true;
    io.socket.get('/stats', (res, jwres) => {
      this.seasons = res;
      this.selectedSeason = this.seasons[0];
      this.loadingData = false;
    });
  },
  methods: {
    colorForScore(score) {
      switch (score) {
        case 5:
          return '#AF9500'; // gold
        case 4:
          return '#B4B4B4'; // silver
        case 3:
          return '#6A3805'; // bronze
        case 1:
          return 'primary';
        default:
          return '#000';
      }
    },
    colorForTotalScore(score) {
      if (score === this.topTotalScores.first) {
        return '#AF9500'; // gold
      }
      if (score === this.topTotalScores.second) {
        return '#B4B4B4'; // silver
      }
      if (score === this.topTotalScores.third) {
        return '#6A3805'; // bronze
      }
      if (score > 0) {
        return 'primary';
      }
      return '#000';
    },
    /**
     * Returns an object for v-bind for testing attributes to identify table cell
     * @example {'points-2': 'someUserName'} identifies someUserNames' week-2 points
     * @param {String} username
     * @param {int} weekNum Which week
     * @param {'points' | 'wins'} metricName 'points'
     */
    dataAttribute(username, weekNum, metricName) {
      const res = {};
      const attributeName = `${metricName}-${weekNum}`;
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
      const playerStats = this.selectedSeason.rankings.find(player => player.username === username);
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
  },
};
</script>

<style scoped>
#stats-wrapper * {
  font-family: 'PT Serif', serif !important;
}
#stats-wrapper h1 {
  background: linear-gradient(
    268.89deg,
    rgba(98, 2, 238, 0.87) 73.76%,
    rgba(253, 98, 34, 0.87) 99.59%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
#upper-surface {
  background-color: #f3f3f3;
}
.filter-select {
  width: 50%;
}
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
