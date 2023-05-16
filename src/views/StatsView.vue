<template>
  <div id="stats-wrapper">
    <!-- Upper Service -->
    <section id="upper-surface" class="pa-8 mb-6">
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
    </section>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { io } from '@/plugins/sails.js';
import AwardCard from '@/components/AwardCard.vue';
import StatsLeaderboard from '@/components/StatsLeaderboard.vue';
import StatsScoringDialog from '@/components/StatsScoringDialog.vue';

export default {
  name: 'StatsView',
  components: {
    AwardCard,
    StatsLeaderboard,
    StatsScoringDialog,
  },
  data() {
    return {
      loadingData: true,
      selectedSeason: null,
      seasons: [],
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
  },
  methods: {
    checkAndSelectSeason(seasonId) {
      const requestedSeason = this.seasons.find(({ id }) => id === seasonId);
      this.selectedSeason = requestedSeason || this.seasons[0];
    },
  },
  created() {
    try {
      io.socket.get('/stats', (res) => {
        if (!res.length) {
          return;
        }
        this.seasons = res;
        const seasonId = parseInt(this.$route.params.seasonId);
        this.checkAndSelectSeason(seasonId);
      });
    } catch (err) {
      if (err) console.error(err);
    } finally {
      this.loadingData = false;
    }
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
