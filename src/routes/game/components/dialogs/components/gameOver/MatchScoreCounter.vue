<template>
  <div class="outer-container">
    <div class="inner-container" data-cy-match-score-counter>
      <span class="individual-score selected">
        W: {{ wins }}
      </span>
      <span class="individual-score">
        L: {{ losses }}
      </span>
      <span class="individual-score">
        T: {{ stalemates }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  wins: {
      type: Number,
      default: 0,
    },
  losses: {
    type: Number,
    default: 0,
  },
  stalemates: {
    type: Number,
    default: 0,
  }
});
</script>

<style scoped lang="scss">
.outer-container {
  display: flex;
  justify-content: center;
}

.inner-container {
  display: flex;
  padding: 4px 8px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 800;
  background-color: rgba(var(--v-theme-surface-2));
  color: rgba(var(--v-theme-surface-1));
}

.individual-score {
  border-radius: 8px;
  margin: 8px;
  padding: 8px;

  &.selected {
    background-color: rgba(var(--v-theme-newPrimary));
    color: rgba(var(--v-theme-surface-2)); 
  }
}


</style>