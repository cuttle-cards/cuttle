<template>
  <div>
    <!-- Upper Servicd -->
    <section id="upper-surface" class="pa-8 mb-6">
      <h1 class="text-h2">
        Clubs 2022
      </h1>
    </section>
    <section class="px-8">
      <h2 class="text-h3 mb-4">
        Season Champions
      </h2>
      <div class="d-flex justify-space-between flex-wrap">
        <award-card
          username="fooey"
          :place="1"
          class="mb-4"
        />
        <award-card username="booey" :place="2" class="mb-4"/>
        <award-card username="gluey" :place="3" class="mb-4"/>
      </div>
      <h2 class="text-h3 my-4">
        Weekly Rankings
      </h2>
      <v-data-table :items="tableRows" :headers="tableColumns" />
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
              rankings: {
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
                ],
              },
            },
            // Player 2
            {
              username: 'Player 2',
              rankings: {
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
              rankings: {
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
                ],
              },
            },
            // Player 4
            {
              username: 'Player 4',
              rankings: {
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
                ],
              },
            },
          ],
        },
      ],
    };
  },
  computed: {
    tableColumns() {
      const res = [{ text: 'User', value: 'username' }];
      for (const weekNum in this.seasons[0].rankings[0].rankings) {
        res.push({
          text: `Week ${weekNum}`,
          value: weekNum,
        });
      }
      return res;
    },
    tableRows() {
      return this.seasons[0].rankings.map(player => {
        const res = { username: player.username };
        for (const weekNum in player.rankings) {
          const week = player.rankings[weekNum];
          const wins = week.filter(match => match.result === Result.WON);
          // res[`${weekNum}_wins`] = wins.map(match => match.opponent).join(', ');
          res[weekNum] = wins.length;
        }
        return res;
      });
    },
    weeklyMaxes() {
      const res = {};
      for (const playerStats of this.tableRows) {
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
};
</script>

<style scoped>
h1 {
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
