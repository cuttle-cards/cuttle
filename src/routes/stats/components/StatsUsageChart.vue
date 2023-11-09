<template>
  <BaseLineChart
    id="usage-stats-chart"
    :title="title"
    :data-sets="dataSets"
    :labels="labels"
  />
</template>

<script>
import BaseLineChart from '@/components/BaseLineChart.vue';

export default {
  name: 'StatsUsageChart',
  components: {
    BaseLineChart,
  },
  props: {
    season: {
      type: Object,
      required: true,
    },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes.cuttleTheme.colors;
    },
    labels() {
      return this.season.gameCounts.map((_el, index) => `Week ${index + 1}`);
    },
    title() {
      return `Amount of Cuttle Played in ${this.season.name}`;
    },
    gameCounts() {
      return this.season.gameCounts;
    },
    uniquePlayers() {
      return this.season.uniquePlayersPerWeek;
    },
    dataSets() {
      return [
        {
          label: 'Games played',
          data: this.gameCounts,
          borderColor: this.theme.newPrimary,
        },
        {
          label: 'Unique players',
          data: this.uniquePlayers,
          borderColor: this.theme.newSecondary,
        },
      ];
    },
  },
};
</script>
