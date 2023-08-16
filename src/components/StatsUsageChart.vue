<template>
  <base-line-chart :data="gameCounts" :key="season.id" />
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
    }
  },
};
</script>