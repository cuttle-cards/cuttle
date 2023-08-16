<template>
  <base-line-chart :data-sets="dataSets" :labels="labels" :key="season.id" />
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
    gameCounts() {
      return this.season.gameCounts;
    },
    dataSets() {
      return [
        {
          label: 'Games played',
          data: this.gameCounts,
          borderColor: this.theme.newPrimary,
        },
      ];
    }
  },
};
</script>