<template>
  <LineChart
    :id="id"
    :options="chartOptions"
    :data="chartData"
  />
</template>

<script>
import { Line as LineChart } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

export default {
  name: 'BarChart',
  components: { LineChart },
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    // Array of string labels for the X axis
    labels: {
      type: Array,
      required: true,
    },
    // Array of dataset objects for chartjs
    // https://www.chartjs.org/docs/latest/general/data-structures.html#primitive
    dataSets: {
      type: Array,
      required: true,
    },
  },
  computed: {
    chartData() {
      return {
        labels: this.labels,
        datasets: this.dataSets,
      };
    },
    chartOptions() {
      return {
        responsive: true,
        plugins: {
          title: {
            text: this.title,
            display: !!this.title,
          },
        },
      };
    },
  },
};
</script>
