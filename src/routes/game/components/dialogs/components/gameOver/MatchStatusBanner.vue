<template>
  <section class="match-status-banner" :class="isRanked ? 'ranked' : 'casual'" data-cy="continue-match-banner">
    <div class="d-flex align-center">
      <v-icon :icon="matchStatusIcon" color="surface-2" :data-cy="matchStatusIconDataCy" />
      <h2 class="banner-h2">
        Continue Match?
      </h2>
      <v-icon :icon="matchStatusIcon" color="surface-2" :data-cy="matchStatusIconDataCy" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isRanked: {
    type: Boolean,
    required: true,
  },
  // Username of winner
  matchWinner: {
    type: String,
    default: '',
  },
});

const matchStatusIcon = computed(() => props.isRanked ? 'mdi-sword-cross' : 'mdi-coffee-outline');
const matchStatusIconDataCy = computed(() => props.isRanked ? 'ranked-icon' : 'casual-icon');
</script>

<style scoped lang="scss">
.match-status-banner {
  margin: -24px -24px 16px -24px;
  padding: 8px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &.ranked {
    background-color: rgba(var(--v-theme-newPrimary));
  }
  &.casual {
    background-color: rgba(var(--v-theme-newSecondary));
  }

  & .banner-h2 {
    text-align: center;
    font-size: 32px;
    font-style: normal;
    font-weight: 700;
    line-height: 32px;
    margin: 8px;
  }
}
</style>