<template>
  <Line
    id="my-chart-id"
    :options="chartOptions"
    :data="chartData"
  />
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

export default {
  name: 'BarChart',
  components: { Line },
  props: {
    labels: {
      type: Array,
      required: true,
    },
    dataSets: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      chartData: {
        labels: this.labels,
        datasets: this.dataSets
      },
      chartOptions: {
        responsive: true
      },
    };
  },
};
</script>