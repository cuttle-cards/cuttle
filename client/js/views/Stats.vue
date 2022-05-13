<template>
  <div id="stats-wrapper">
    <!-- Upper Service -->
    <section id="upper-surface" class="pa-8 mb-6">
      <h1 class="text-h2">
        Clubs 2022
      </h1>
    </section>
    <section class="px-8">
      <!-- Season Champions -->
      <div class="mb-10">
        <h2 class="text-h3 mb-4">
          Season Champions
        </h2>
        <div class="d-flex justify-space-between flex-wrap">
          <award-card username="fooey" :place="1" class="mb-4" />
          <award-card username="booey" :place="2" class="mb-4" />
          <award-card username="gluey" :place="3" class="mb-4" />
        </div>
      </div>
      <!-- Rankings Table -->
      <h2 class="text-h3 my-4">
        Weekly Rankings
      </h2>
      <v-data-table :items="tableRows" :headers="tableColumns">
        <!-- Customize win count -->
        <template v-for="week in weekNums" #[`item.${week}_wins`]="{item, value}">
          <v-chip
            :color="colorForScore(item[`${week}_points`])"
            :key="`${item.username}_week_${week}_wins`"
            dark
            :outlined="['primary', 'secondary'].includes(colorForScore(item[`${week}_points`]))"
          >
            {{ value }}
          </v-chip>
        </template>
      </v-data-table>
    </section>
  </div>
</template>

<script>
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
      seasonIndex: 0,
      seasons: [
        {
          name: 'Clubs 2022',
          startTime: 1642642200,
          endTime: 1643247000,
          fistPlace: 1,
          secondPlace: 2,
          thirdPlace: 3,
          fourthPlace: 4,
          rankings: [
            // Player 1
            {
              username: 'Player 1',
              matches: {
                // Player 1 Week 1
                1: [
                  {
                    opponent: 'Player 2',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 3',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 4',
                    result: Result.WON,
                  },
                ],
                // Player 1 Week 2
                2: [
                  {
                    opponent: 'Player 2',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 3',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 4',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 5',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 6',
                    result: Result.LOST,
                  },
                ],
              },
            },
            // Player 2
            {
              username: 'Player 2',
              matches: {
                // Player 2 Week 1
                1: [
                  {
                    opponent: 'Player 1',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 3',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 4',
                    result: Result.WON,
                  },
                ],
                // Player 2 Week 2
                2: [
                  {
                    opponent: 'Player 1',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 3',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 4',
                    result: Result.WON,
                  },
                ],
              },
            },
            // Player 3
            {
              username: 'Player 3',
              matches: {
                // Player 3 Week 1
                1: [
                  {
                    opponent: 'Player 1',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 2',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 4',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 5',
                    result: Result.LOST,
                  },
                ],
                // Player 3 Week 2
                2: [
                  {
                    opponent: 'Player 1',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 2',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 4',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 5',
                    result: Result.LOST,
                  },
                ],
              },
            },
            // Player 4
            {
              username: 'Player 4',
              matches: {
                // Player 4 Week 1
                1: [
                  {
                    opponent: 'Player 1',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 2',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 3',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 5',
                    result: Result.LOST,
                  },
                ],
                // Player 4 Week 2
                2: [
                  {
                    opponent: 'Player 1',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 2',
                    result: Result.LOST,
                  },
                  {
                    opponent: 'Player 3',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 5',
                    result: Result.LOST,
                  },
                ],
              },
            },
            // Player 5
            {
              username: 'Player 5',
              matches: {
                1: [
                  {
                    opponent: 'Player 3',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 4',
                    result: Result.WON,
                  },
                ],
                2: [
                  {
                    opponent: 'Player 1',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 3',
                    result: Result.WON,
                  },
                  {
                    opponent: 'Player 4',
                    result: Result.WON,
                  },
                ],
              },
            },
            // Player 6
            {
              username: 'Player 6',
              matches: {
                1: [],
                2: [{ opponent: 'Player 1', result: Result.WON }],
              },
            },
          ],
        },
      ],
    };
  },
  computed: {
    selectedSeason() {
      return this.seasons[this.seasonIndex];
    },
    weekNums() {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    },
    tableColumns() {
      const res = [{ text: 'User', value: 'username' }];
      for (const weekNum in this.selectedSeason.rankings[0].matches) {
        res.push({
          text: `Week ${weekNum} Wins`,
          value: `${weekNum}_wins`,
        });
        res.push({
          text: `Week ${weekNum} Points`,
          value: `${weekNum}_points`,
        });
      }
      return res;
    },
    tableRows() {
      return this.selectedSeason.rankings.map((playerStats, index) => {
        const res = { username: playerStats.username };
        const playerWins = this.playerWins[index];
        const playerScores = this.playerScores[index];
        for (const weekNum in playerStats.matches) {
          res[`${weekNum}_wins`] = playerWins[weekNum];
          res[`${weekNum}_points`] = playerScores[weekNum];
        }
        return res;
      });
    },
    playerWins() {
      return this.selectedSeason.rankings.map(playerStats => {
        const res = {};
        for (const weekNum in playerStats.matches) {
          const week = playerStats.matches[weekNum];
          const wins = week.filter(match => match.result === Result.WON);
          // res[`${weekNum}_wins`] = wins.map(match => match.opponent).join(', ');
          res[weekNum] = wins.length;
        }
        return res;
      });
    },
    playerScores() {
      return this.playerWins.map(playerWins => {
        const res = {};
        for (const weekNum in playerWins) {
          if (playerWins[weekNum] === this.topScoresPerWeek[weekNum].first) {
            res[weekNum] = 5;
          } else if (playerWins[weekNum] === this.topScoresPerWeek[weekNum].second) {
            res[weekNum] = 4;
          } else if (playerWins[weekNum] === this.topScoresPerWeek[weekNum].third) {
            res[weekNum] = 3;
          } else if (playerWins[weekNum] > 0) {
            res[weekNum] = 1;
          } else {
            res[weekNum] = 0;
          }
        }
        return res;
      });
    },
    topScoresPerWeek() {
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
          return 'secondary';
      }
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
</style>
