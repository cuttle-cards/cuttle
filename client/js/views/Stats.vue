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
      <h4 v-if="selectedSeason" class="text-h4">
        <span data-cy="season-start-date">{{ seasonStartString }}</span>
        -
        <span data-cy="season-end-date"> {{ seasonEndString }} </span>
      </h4>
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
          class="text-h2 mb-4"
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
        <p v-if="selectedSeason && selectedSeason.bracketLink" class="text-body-1">
          Click
          <a :href="selectedSeason.bracketLink" data-cy="tournament-bracket-link">
            here to see the official tournament bracket
          </a>
        </p>
        <p v-if="selectedSeason && selectedSeason.footageLink" class="text-body-1">
          Click
          <a :href="selectedSeason.footageLink" data-cy="tournament-footage-link">
            here to watch the official tournament footage
          </a>
          with play-by-play commentary.
        </p>
      </div>
      <!-- Rankings Table -->
      <h2 class="text-h2 my-4">
        Weekly Rankings
      </h2>
      <stats-leaderboard :loading="loadingData" :season="selectedSeason" />
    </section>
  </div>
</template>

<script>
import { io } from '@/plugins/sails.js';
import AwardCard from '@/components/AwardCard.vue';
import StatsLeaderboard from '@/components/StatsLeaderboard.vue';
const dayjs = require('dayjs');

export default {
  name: 'Stats',
  components: {
    AwardCard,
    StatsLeaderboard,
  },
  data() {
    return {
      loadingData: false,
      selectedSeason: null,
      seasons: [],
    };
  },
  computed: {
    seasonStartString() {
      if (this.selectedSeason) {
        return dayjs(this.selectedSeason.startTime).format('YYYY/MM/DD');
      }
      return '';
    },
    seasonEndString() {
      if (this.selectedSeason) {
        return dayjs(this.selectedSeason.endTime).format('YYYY/MM/DD');
      }
      return '';
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
</style>
