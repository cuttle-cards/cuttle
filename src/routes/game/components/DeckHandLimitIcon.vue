<template>
  <v-tooltip v-if="showIcon" location="top">
    <template #activator="{ props }">
      <div
        v-bind="props"
        class="deck-hand-limit-icon"
        role="img"
        data-cy="deck-hand-limit-icon"
        :aria-label="t('game.atHandLimit')"
      >
        <v-icon icon="mdi-alert-outline" size="small" aria-hidden="true" />
      </div>
    </template>
    {{ t('game.atHandLimit') }}
  </v-tooltip>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore, HAND_LIMIT } from '@/stores/game';

const { t } = useI18n();
const gameStore = useGameStore();

const showIcon = computed(() => gameStore.isPlayersTurn && gameStore.player.hand.length >= HAND_LIMIT);
</script>

<style lang="scss" scoped>
.deck-hand-limit-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border: 2px solid rgb(var(--v-theme-base-dark));
  border-radius: 12px;
  background: rgb(var(--v-theme-forfeit));
  color: rgb(var(--v-theme-base-dark));
  z-index: 1;
}
</style>
