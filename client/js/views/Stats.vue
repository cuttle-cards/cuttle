<template>
  <div>
    <!-- Upper Servicd -->
    <section id="upper-surface" class="pa-8 mb-6">
      <h1 class="text-h2">Clubs 2022</h1>
    </section>
    <section class="px-8">
      <h2 class="text-h3 mb-4">Season Champions</h2>
      <div class="d-flex justify-space-between flex-wrap">
        <award-card username="fooey" :place="1" class="mb-4"/>
        <award-card username="booey" :place="2" class="mb-4"/>
        <award-card username="gluey" :place="3" class="mb-4"/>
      </div>
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
          rankings: {
            // Player 1
            1: {
              // Player 1 Week 1
              1: [
                {
                  player: 'Player 1',
                  opponent: 'Player 2',
                  result: Result.WON,
                },
                {
                  player: 'Player 1',
                  opponent: 'Player 3',
                  result: Result.WON,
                },
                {
                  player: 'Player 1',
                  opponent: 'Player 4',
                  result: Result.WON,
                },
              ],
              // Player 1 Week 2
              2: [
                {
                  player: 'Player 1',
                  opponent: 'Player 2',
                  result: Result.LOST,
                },
                {
                  player: 'Player 1',
                  opponent: 'Player 3',
                  result: Result.WON,
                },
                {
                  player: 'Player 1',
                  opponent: 'Player 4',
                  result: Result.WON,
                },
              ],
            },
            // Player 2
            2: {
              // Player 2 Week 1
              1: [
                {
                  player: 'Player 2',
                  opponent: 'Player 1',
                  result: Result.LOST,
                },
                {
                  player: 'Player 2',
                  opponent: 'Player 3',
                  result: Result.WON,
                },
                {
                  player: 'Player 2',
                  opponent: 'Player 4',
                  result: Result.WON,
                },
              ],
              // Player 2 Week 2
              2: [
                {
                  player: 'Player 2',
                  opponent: 'Player 1',
                  result: Result.WON,
                },
                {
                  player: 'Player 2',
                  opponent: 'Player 3',
                  result: Result.WON,
                },
                {
                  player: 'Player 2',
                  opponent: 'Player 4',
                  result: Result.WON,
                },
              ],
            },
            // Player 3
            3: {
              // Player 3 Week 1
              1: [
                {
                  player: 'Player 3',
                  opponent: 'Player 1',
                  result: Result.LOST,
                },
                {
                  player: 'Player 3',
                  opponent: 'Player 2',
                  result: Result.LOST,
                },
                {
                  player: 'Player 3',
                  opponent: 'Player 4',
                  result: Result.WON,
                },
              ],
              // Player 3 Week 2
              2: [
                {
                  player: 'Player 3',
                  opponent: 'Player 1',
                  result: Result.LOST,
                },
                {
                  player: 'Player 3',
                  opponent: 'Player 2',
                  result: Result.LOST,
                },
                {
                  player: 'Player 3',
                  opponent: 'Player 4',
                  result: Result.LOST,
                },
              ],
            },
            // Player 4
            4: {
              // Player 4 Week 1
              1: [
                {
                  player: 'Player 4',
                  opponent: 'Player 1',
                  result: Result.LOST,
                },
                {
                  player: 'Player 4',
                  opponent: 'Player 2',
                  result: Result.LOST,
                },
                {
                  player: 'Player 4',
                  opponent: 'Player 3',
                  result: Result.LOST,
                },
              ],
              // Player 4 Week 2
              2: [
                {
                  player: 'Player 4',
                  opponent: 'Player 1',
                  result: Result.LOST,
                },
                {
                  player: 'Player 4',
                  opponent: 'Player 2',
                  result: Result.LOST,
                },
                {
                  player: 'Player 4',
                  opponent: 'Player 3',
                  result: Result.WON,
                },
              ],
            },
          },
        },
      ],
    };
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
  background-color: #F3F3F3;
}
</style>
