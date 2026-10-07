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
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);
</script>

<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { Line as LineChart } from 'vue-chartjs';

defineOptions({
  name: 'BarChart',
});

const props = defineProps({
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
});

const vuetifyTheme = useTheme();

const theme = computed(() => vuetifyTheme.themes.value.cuttleTheme.colors);

const backgroundColor = computed(() => {
  const hex = theme.value['table-row'];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, 0.7)`;
});

const chartData = computed(() => {
  return {
    labels: props.labels,
    datasets: props.dataSets,
  };
});

const chartOptions = computed(() => {
  return {
    responsive: true,
    scales: {
      x: {
        grid: {
          color: theme.value['base-light'],           // color of the grid lines
          borderColor: theme.value['base-light'],     // color of the outer axis line
        },
        ticks: {
          color: theme.value['base-light'],           // color of tick labels on the x-axis
        },
      },
      y: {
        grid: {
          color: theme.value['base-light'],
          borderColor: theme.value['base-light'],
        },
        ticks: {
          color: theme.value['base-light'],
        },
      },
    },
    plugins: {
      title: {
        text: props.title,
        display: !!props.title,
        color: theme.value['base-light'],
      },
    },
    color: theme.value['base-light'],
    backgroundColor: backgroundColor.value,
  };
});
</script>

<style scoped>
.chart-container {
  background-color: rgba(var(--v-theme-table-row), 0.7);
}
</style>
