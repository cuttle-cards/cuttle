<template>
  <div id="stats-page-wrapper" class="text-game-card">
    <template v-if="loadingData">
      <v-skeleton-loader class="px-4 pa-2 mb-6 mx-auto border mb-2 mt-4" type="heading" />
      <v-skeleton-loader
        class="mx-auto border"
        type="table-heading, table-row-divider, table-row, table-tbody,table-tfoot"
      />
    </template>
    <template v-else>
      <div id="stats-wrapper d-flex flex-column">
        <!-- Upper Service -->
        <section id="upper-surface" class="px-8 pt-8 mb-6">
          <v-select
            v-model="selectedSeason"
            :items="seasons"
            item-title="name"
            return-object
            variant="underlined"
            :label="t('stats.season.select')"
            :list-props="{ bgColor: 'game-card', baseColor: 'game-board', color: 'primary' }"
            data-cy="season-select"
          >
            <template #selection="{ item }">
              <h1 class="text-h1" data-cy="selected-season-header">
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
        <section class="px-8 d-flex flex-column">
          <!-- Season Champions -->
          <div class="mb-10 d-flex flex-column">
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
            <p v-if="selectedSeason && selectedSeason.bracketLink" class="text-body-1 text-center mt-2 mb-8">
              {{ t('global.click') }}
              <a
                :href="selectedSeason.bracketLink"
                target="_blank"
                class="link"
                data-cy="tournament-bracket-link"
              >
                {{ t('stats.season.tournamentBracket') }}
              </a>
            </p>
            <div
              v-if="selectedSeason && selectedSeason.footageLink"
              id="tournament-video"
              class="d-flex flex-column align-items-center"
            >
              <h3 class="text-h3 text-center mt-4">
                Tournament Video
              </h3>
              <BaseVideo :source="selectedSeason.footageLink" data-cy="tournament-video" />
            </div>
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
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { io } from '@/plugins/sails.js';
import { useI18n } from 'vue-i18n';
import AwardCard from '@/components/AwardCard.vue';
import BaseVideo from '@/components/BaseVideo.vue';
import StatsScoringDialog from '@/components/StatsScoringDialog.vue';
import StatsLeaderboard from '@/routes/stats/components/StatsLeaderboard.vue';
import StatsUsageChart from '@/routes/stats/components/StatsUsageChart.vue';

export default {
  name: 'StatsView',
  components: {
    AwardCard,
    BaseVideo,
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
#stats-page-wrapper {
  background: url('/img/game/board-background.webp') repeat-y;
  background-size: 100% auto;
  background-attachment: fixed; /* Optional: keeps background fixed during scroll */
}

.text-h1 {
  font-family: 'Luckiest Guy', serif;
}

.text-h2 {
  font-family: 'Luckiest Guy', serif;
  font-size: 64px;
  line-height: 64px;
}

.text-h3 {
  font-family: 'Luckiest Guy', serif;
  font-size: 48px;
  line-height: 52px;
}

.text-body-1 {
  font-size: 24px !important;
  line-height: 32px;
  font-weight: bold;
}

.link {
  color: #006064;
}

#tournament-video {
  width: 50%;
  align-self: center;
}

.filter-select {
  width: 50%;
}
</style>
