<template>
  <Line
    :id="id"
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
    id: {
      type: String,
      default: 'Line Chart',
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
  data() {
    return {
      chartOptions: {
        responsive: true,
        plugins: {
          title: {
            text: this.title,
            display: !!this.title,
          },
        },
      },
    };
  },
  computed: {
    chartData() {
      return {
        labels: this.labels,
        datasets: this.dataSets,
      };
    },
  },
};
</script>
