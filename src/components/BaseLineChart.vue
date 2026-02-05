<template>
  <div class="chart-container">
    <LineChart
      :id="id"
      :options="chartOptions"
      :data="chartData"
    />
  </div>
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
    theme() {
      return this.$vuetify.theme.themes.cuttleTheme.colors;
    },
    tableRowBackground() {
      const hex = this.theme['table-row'];
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.7)`;
    },
    chartData() {
      return {
        labels: this.labels,
        datasets: this.dataSets,
      };
    },
    chartOptions() {
      return {
        responsive: true,
        scales: {
          x: {
            grid: {
              color: this.theme['game-card'],           // color of the grid lines
              borderColor: this.theme['game-card'],     // color of the outer axis line
            },
            ticks: {
              color: this.theme['game-card'],           // color of tick labels on the x-axis
            },
          },
          y: {
            grid: {
              color: this.theme['game-card'],
              borderColor: this.theme['game-card'],
            },
            ticks: {
              color: this.theme['game-card'],
            },
          },
        },
        plugins: {
          title: {
            text: this.title,
            display: !!this.title,
            color: this.theme['game-card'],
          },
        },
        color: this.theme['game-card'],
        backgroundColor: this.tableRowBackground,
      };
    },
  },
};
</script>

<style scoped>
.chart-container {
  background-color: rgba(var(--v-theme-table-row), 0.7);
}
</style>
