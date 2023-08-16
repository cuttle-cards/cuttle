<template>
  <template v-if="loadingData">
    <v-skeleton-loader class="px-4 pa-2 mb-6 mx-auto border mb-2 mt-4" type="heading" />
    <v-skeleton-loader
      class="mx-auto border"
      type="table-heading, table-row-divider, table-row, table-tbody,table-tfoot"
    />
  </template>
  <template v-else>
    <div id="stats-wrapper">
      <!-- Upper Service -->
      <section id="upper-surface" class="px-8 pt-8 mb-6">
        <v-select
          v-model="selectedSeason"
          :items="seasons"
          item-title="name"
          return-object
          label="Select Season"
          data-cy="season-select"
        >
          <template #selection="{ item }">
            <h1 class="text-h2" data-cy="selected-season-header">
              {{ item.title }}
            </h1>
          </template>
        </v-select>
        <h4 v-if="selectedSeason" class="text-h4">
          <span data-cy="season-start-date">{{ seasonStartFormatted }}</span>
          -
          <span data-cy="season-end-date"> {{ seasonEndFormatted }} </span>
        </h4>
      </section>
      <section class="px-8">
        <!-- Season Champions -->
        <div class="mb-10">
          <h2 v-if="showSeasonChampions" class="text-h2 mb-4">Season Champions</h2>
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
            <a :href="selectedSeason.bracketLink" target="_blank" data-cy="tournament-bracket-link">
              here to see the official tournament bracket
            </a>
          </p>
          <p v-if="selectedSeason && selectedSeason.footageLink" class="text-body-1">
            Click
            <a :href="selectedSeason.footageLink" target="_blank" data-cy="tournament-footage-link">
              here to watch the official tournament footage
            </a>
            with play-by-play commentary.
          </p>
        </div>
        <!-- Rankings Table -->
        <template v-if="weeklyRanking">
          <h2 class="text-h2 mb-4">
            Weekly Rankings
            <stats-scoring-dialog />
          </h2>
          <stats-leaderboard :loading="loadingData" :season="selectedSeason" />
        </template>

        <!-- Usage stats -->
        <div id="usage-stats-section">
          <h2 class="text-h2 mt-8 mb-4">Site Usage</h2>
          <base-line-chart :data="gameCounts" :key="selectedSeason.id" />
        </div>
        <!-- Error display -->
        <div v-if="error" class="d-flex flex-column align-center text-center">
          <h3 class="text-h3">Oops!</h3>
          <p class="text-body-1">There was a problem loading the leaderboard. Refresh the page to try again.</p>
          <v-img
            alt="Dead cuttle logo"
            src="/img/logo-dead.svg"
            :width="200"
            class="mt-4"
          />
        </div>
      </section>
    </div>
  </template>
</template>

<script>
import dayjs from 'dayjs';
import { io } from '@/plugins/sails.js';
import AwardCard from '@/components/AwardCard.vue';
import StatsLeaderboard from '@/components/StatsLeaderboard.vue';
import StatsScoringDialog from '@/components/StatsScoringDialog.vue';
import BaseLineChart from '@/components/BaseLineChart.vue';

export default {
  name: 'StatsView',
  components: {
    AwardCard,
    StatsLeaderboard,
    StatsScoringDialog,
    BaseLineChart,
  },
  data() {
    return {
      loadingData: true,
      selectedSeason: null,
      seasons: [],
      error: false,
    };
  },
  watch: {
    selectedSeason() {
      this.selectedSeason
        ? this.$router.replace({ name: 'StatsBySeason', params: { seasonId: this.selectedSeason.id } })
        : null;
    },
  },
  computed: {
    weeklyRanking() {
      return this.selectedSeason && this.selectedSeason.rankings && this.selectedSeason.rankings.length > 0;
    },
    seasonStartFormatted() {
      return !this.selectedSeason ? '' : dayjs(this.selectedSeason.startTime).format('YYYY/MM/DD');
    },
    seasonEndFormatted() {
      return !this.selectedSeason ? '' : dayjs(this.selectedSeason.endTime).format('YYYY/MM/DD');
    },
    showSeasonChampions() {
      return (
        this.selectedSeason &&
        (this.selectedSeason.bracketLink ||
          this.selectedSeason.firstPlace ||
          this.selectedSeason.secondPlace ||
          this.selectedSeason.thirdPlace)
      );
    },
    seasonDropdownOptions() {
      return this.seasons.map((season) => {
        return {
          title: season.name,
          value: season,
        };
      });
    },
    gameCounts() {
      return this.selectedSeason.gameCounts;
    },
  },
  methods: {
    checkAndSelectSeason(seasonId) {
      const requestedSeason = this.seasons.find(({ id }) => id === seasonId);
      this.selectedSeason = requestedSeason || this.seasons[0];
    },
  },
  created() {
    io.socket.get('/stats', (res) => {
      this.loadingData = false;
      if (!res?.length) {
        this.error = true;
        return;
      }
      this.seasons = res;
      const seasonId = parseInt(this.$route.params.seasonId);
      this.checkAndSelectSeason(seasonId);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.loadingData = true;
    const seasonId = parseInt(to.params.seasonId);
    this.checkAndSelectSeason(seasonId);
    this.loadingData = false;
    next();
  },
};
</script>

<style scoped>
#stats-wrapper h1 {
  background: linear-gradient(268.89deg, rgba(98, 2, 238, 0.87) 73.76%, rgba(253, 98, 34, 0.87) 99.59%);
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
