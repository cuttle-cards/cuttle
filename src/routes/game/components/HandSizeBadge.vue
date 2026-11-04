<template>
  <div
    class="hand-size-badge"
    :class="{ 'at-limit': isAtLimit }"
    role="status"
    data-cy="hand-size-badge"
    :aria-label="t('game.handSize', { handSize, handLimit: HAND_LIMIT })"
  >
    <v-icon :icon="isAtLimit ? 'mdi-alert-outline' : 'mdi-cards-outline'" size="small" aria-hidden="true" />
    <span aria-hidden="true">{{ handSize }}/{{ HAND_LIMIT }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore, HAND_LIMIT } from '@/stores/game';

const { t } = useI18n();
const gameStore = useGameStore();

const handSize = computed(() => gameStore.player.hand.length);
const isAtLimit = computed(() => handSize.value >= HAND_LIMIT);
</script>

<style lang="scss" scoped>
.hand-size-badge {
  position: absolute;
  right: 8px;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 2px solid rgba(var(--v-theme-base-light));
  border-radius: 12px;
  background: rgba(74, 36, 22, 0.92);
  color: rgba(var(--v-theme-base-light));
  font-weight: bold;
  pointer-events: none;
  z-index: 1;

  &.at-limit {
    background: rgb(var(--v-theme-forfeit));
    border-color: rgb(var(--v-theme-base-dark));
    color: rgb(var(--v-theme-base-dark));
  }
}
</style>
