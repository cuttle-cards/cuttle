<template>
  <BaseMenu
    v-if="points"
    v-model="showMenu"
    :title="`${username} ${menuHeader} ${t('stats.results')}`"
    :data-cy="`player-${playerRow.username}-week-${week}-results`"
  >
    <template #activator="{ props }">
      <v-chip
        :color="colorForScore"
        :variant="variant"
        class="pointer"
        :class="colorForScore === 'base-light' ? 'text-base-dark' : 'text-base-light'"
        rounded="sm"
        :data-cy="`week-${week}-points-${playerRow.username}`"
        v-bind="{
          ...props,
        }"
      >
        {{ points }}
      </v-chip>
    </template>
    <template #body="{ listProps }">
      <v-list v-bind="listProps" class="text-base-dark">
        <v-list-item :title="t('stats.wins')" :data-players-beaten="`${username}-week-${week}`" v-bind="listProps">
          {{ playersBeatenText }}
        </v-list-item>
        <v-list-item :title="t('stats.losses')" :data-players-lost-to="`${username}-week-${week}`" v-bind="listProps">
          {{ playersLostToText }}
        </v-list-item>
        <v-list-item :title="t('stats.winRate')" :data-win-rate="`${username}-week-${week}`" v-bind="listProps">
          {{ winRateText }}
        </v-list-item>
      </v-list>
    </template>
  </BaseMenu>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import BaseMenu from '@/components/BaseMenu.vue';

defineOptions({
  name: 'StatsLeaderboardCell',
});

const props = defineProps({
  playerRow: {
    type: Object,
    required: true,
  },
  week: {
    type: [ Number, String ],
    required: true,
    validator: (val) => [ 'total', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ].includes(val),
  },
  playersBeaten: {
    type: String,
    default: '',
  },
  playersLostTo: {
    type: String,
    default: '',
  },
  topTotalScores: {
    type: Object,
    required: true,
  },
  seasonName: {
    type: String,
    default: '',
  },
});

const { t } = useI18n();
const vuetifyTheme = useTheme();
const showMenu = ref(false);

const theme = computed(() => {
  return vuetifyTheme.themes.value.cuttleTheme.colors;
});

const username = computed(() => {
  return props.playerRow.username;
});

const wins = computed(() => {
  return props.playerRow[`week_${props.week}_wins`];
});

const points = computed(() => {
  return props.playerRow[`week_${props.week}_points`];
});

const weekCount = computed(() => {
  return props.playerRow[`week_${props.week}_count`];
});

const colorForScore = computed(() => {
  return props.week === 'total' ? colorForTotalScore.value : colorForWeeklyScore.value;
});

const colorForTotalScore = computed(() => {
  if (points.value === props.topTotalScores.first) {
    return theme.value.firstPlace;
  }
  if (points.value === props.topTotalScores.second) {
    return theme.value.secondPlace;
  }
  if (points.value === props.topTotalScores.third) {
    return 'base-light';
  }
  return '#000';
});

const colorForWeeklyScore = computed(() => {
  switch (points.value) {
    case 5:
      return theme.value.firstPlace;
    case 4:
      return theme.value.secondPlace;
    case 3:
      return 'base-light';
    case 2:
    case 1:
    default:
      return '#000';
  }
});

const variant = computed(() => {
  switch (colorForScore.value) {
    case theme.value.firstPlace:
    case theme.value.secondPlace:
    case 'base-light':
      return 'flat';
    default:
      return 'outlined';
  }
});

const winRatePercentage = computed(() => {
  const winRate = Math.floor((wins.value / weekCount.value) * 100);
  return `${winRate}%`;
});

const losses = computed(() => {
  return weekCount.value - wins.value;
});

const winRateText = computed(() => {
  return `${winRatePercentage.value} (${wins.value} Won, ${losses.value} Lost, ${weekCount.value} Total)`;
});

const menuHeader = computed(() => {
  return props.week === 'total' ? props.seasonName : `Week ${props.week}`;
});

const playersBeatenText = computed(() => {
  return props.playersBeaten !== '' ? props.playersBeaten : 'None';
});

const playersLostToText = computed(() => {
  return props.playersLostTo !== '' ? props.playersLostTo : 'None';
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
