<template>
  <BaseDialog
    id="four-choose-discard-dialog"
    v-model="show"
    :title="t('game.dialogs.fourDiscard.title')"
    minimizable
  >
    <template #body>
      <p class="mb-4">
        {{ t('game.dialogs.fourDiscard.body', { opponentUsername: gameStore.opponentUsername }) }}
      </p>
      <!-- Cards the opponent revealed -->
      <div class="d-flex flex-wrap card-container">
        <GameCard
          v-for="card in fourRevealedCards"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-four-discard-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': isSelected(card.id) }"
          @click="selectCard(card.id)"
        />
      </div>
    </template>
    <template #actions>
      <v-btn
        color="base-dark"
        variant="flat"
        data-cy="submit-four-discard-dialog"
        :disabled="!readyToDiscard"
        @click="discard"
      >
        {{ t('game.dialogs.fourDiscard.discard') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';
import { useSelectCards } from '@/composables/useSelectCards';

const DISCARD_COUNT = 2;

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean,
  },
});

const emit = defineEmits([ 'discard' ]);

const { t } = useI18n();
const gameStore = useGameStore();
const { fourRevealedCards } = storeToRefs(gameStore);

const show = computed({
  get: () => props.modelValue,
  set: () => {},
});

const {
  selectedIds,
  isSelected,
  ready: readyToDiscard,
  selectCard,
  clear,
} = useSelectCards(DISCARD_COUNT);

function discard() {
  if (readyToDiscard.value) {
    emit('discard', [ ...selectedIds.value ]);
    clear();
  }
}
</script>

<style lang="scss" scoped>
.is-selected {
  border: 3px solid rgba(var(--v-theme-error));
}

.card-container {
  row-gap: 0.5rem;
}
</style>
