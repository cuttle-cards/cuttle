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
          :label="t('stats.season.select')"
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
          <h2 v-if="showSeasonChampions" class="text-h2 mb-4">
            {{ t('stats.season.champions') }}
          </h2>
          <div class="d-flex justify-space-around flex-wrap">
            <AwardCard
              v-if="selectedSeason && selectedSeason.firstPlace"
              :username="selectedSeason.firstPlace"
              :place="1"
              class="mb-4"
            />
            <AwardCard
              v-if="selectedSeason && selectedSeason.secondPlace"
              :username="selectedSeason.secondPlace"
              :place="2"
              class="mb-4"
            />
            <AwardCard
              v-if="selectedSeason && selectedSeason.thirdPlace"
              :username="selectedSeason.thirdPlace"
              :place="3"
              class="mb-4"
            />
          </div>
          <p v-if="selectedSeason && selectedSeason.bracketLink" class="text-body-1">
            {{ t('global.click') }}
            <a :href="selectedSeason.bracketLink" target="_blank" data-cy="tournament-bracket-link">
              {{ t('stats.season.tournamentBracket') }}
            </a>
          </p>
          <p v-if="selectedSeason && selectedSeason.footageLink" class="text-body-1">
            {{ t('global.click') }}
            <a :href="selectedSeason.footageLink" target="_blank" data-cy="tournament-footage-link">
              {{ t('stats.season.tournamentFootage') }}
            </a>
            {{ t('stats.season.playByPlay') }}
          </p>
        </div>
        <!-- Rankings Table -->
        <template v-if="weeklyRanking">
          <h2 class="text-h2 mb-4">
            {{ t('stats.weeklyRankings') }}
            <StatsScoringDialog />
          </h2>
          <StatsLeaderboard :loading="loadingData" :season="selectedSeason" />
        </template>

        <!-- Usage stats -->
        <div v-if="selectedSeason" id="usage-stats-section">
          <h2 class="text-h2 mt-8 mb-4">
            {{ t('stats.siteUsage') }}
          </h2>
          <StatsUsageChart v-if="showStatsUsageChart" :season="selectedSeason" />
        </div>
        <!-- Error display -->
        <div v-if="error" class="d-flex flex-column align-center text-center">
          <h3 class="text-h3">
            {{ t('stats.error.oops') }}
          </h3>
          <p class="text-body-1">
            {{ t('stats.error.message') }}
          </p>
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
import { useI18n } from 'vue-i18n';
import AwardCard from '@/components/AwardCard.vue';
import StatsScoringDialog from '@/components/StatsScoringDialog.vue';
import StatsLeaderboard from '@/routes/stats/components/StatsLeaderboard.vue';
import StatsUsageChart from '@/routes/stats/components/StatsUsageChart.vue';

export default {
  name: 'StatsView',
  components: {
    AwardCard,
    StatsLeaderboard,
    StatsScoringDialog,
    StatsUsageChart,
  },
  beforeRouteUpdate(to, from, next) {
    this.loadingData = true;
    const seasonId = parseInt(to.params.seasonId);
    if (seasonId) {
      this.checkAndSelectSeason(seasonId);
      this.loadingData = false;
      return next();
    }
    [ this.selectedSeason ] = this.seasons;
    this.loadingData = false;
    next();
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      loadingData: true,
      selectedSeason: null,
      seasons: [],
      error: false,
    };
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
    showStatsUsageChart() {
      const gameCounts = this.selectedSeason.gameCounts || []; // Handle potential undefined value
      return gameCounts.length > 0 && !gameCounts.every((count) => count === 0);
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
  },
  watch: {
    selectedSeason() {
      this.selectedSeason
        ? this.$router.replace({ name: 'Stats', params: { seasonId: this.selectedSeason.id } })
        : null;
    },
  },
  created() {
    io.socket.get('/api/stats/seasons/current', (res) => {
      if (!res?.length) {
        this.loadingData = false;
        this.error = true;
        return;
      }
      this.seasons = res;

      const seasonId = parseInt(this.$route.params.seasonId);
      if (seasonId) {
        this.checkAndSelectSeason(seasonId);
        return;
      }
      this.loadingData = false;
      [ this.selectedSeason ] = this.seasons;
    });
  },
  methods: {
    checkAndSelectSeason(seasonId) {
      this.loadingData = true;
      const requestedSeason = this.seasons.find(({ id }) => id === seasonId);

      // if rankings are already downloaded, we're done
      if (requestedSeason?.rankings?.length) {
        this.loadingData = false;
        this.selectedSeason = requestedSeason;
        return;
      }

      // otherwise download rankings for selected season
      io.socket.get(`/api/stats/seasons/${seasonId}`, ({ gameCounts,rankings, uniquePlayersPerWeek }) => {
        if (!rankings) {
          this.error = true;
          this.selectedSeason = null;
          this.loadingData = false;
          return;
        }

        this.selectedSeason = { ...requestedSeason, gameCounts, rankings, uniquePlayersPerWeek };
        this.loadingData = false;
      });

    },
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
