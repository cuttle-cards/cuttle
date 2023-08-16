<template>
  <base-line-chart :data="gameCounts" :labels="labels" :key="season.id" />
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
    gameCounts() {
      return this.season.gameCounts;
    },
    labels() {
      return this.season.gameCounts.map((_el, index) => `Week ${index + 1}`);
    }
  },
};
</script>