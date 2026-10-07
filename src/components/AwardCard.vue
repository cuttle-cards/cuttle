<template>
  <v-card
    class="d-flex align-center pa-5"
    :color=" variant === 'dark' ? 'base-dark' : 'base-light'"
    :data-tournament="`${place}${suffix}`"
    min-width="224"
    variant="elevated"
  >
    <img :src="`/img/statsView/medal-${placeWithSuffix}-place.svg`" :alt="`Medal for ${placeWithSuffix} place`">
    <h3 class="mx-4" :class="variant === 'dark' ? 'text-base-light' : 'text-base-dark'">
      {{ username }}
    </h3>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';

defineOptions({
  name: 'AwardCard',
});

const props = defineProps({
  username: {
    type: String,
    default: '',
  },
  place: {
    type: Number,
    required: true,
  },
  variant: {
    type: String,
    default: 'dark',
    validator: (val) => [ 'light', 'dark' ].includes(val),
  },
});

const vuetifyTheme = useTheme();
const theme = computed(() => vuetifyTheme.themes.value.cuttleTheme.colors);
const _medalColor = computed(() => {
  switch (props.place) {
    case 1:
      return theme.value.firstPlace;
    case 2:
      return theme.value.secondPlace;
    case 3:
      return theme.value.thirdPlace;
    default:
      return '#000';
  }
});
const suffix = computed(() => {
  switch (props.place) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
});
const placeWithSuffix = computed(() => `${props.place}${suffix.value}`);
</script>

<style scoped>
.medal-icon {
  height: 100%;
}
.text {
  height: 100%;
}
</style>
