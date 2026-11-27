<!--
  Legacy dialog: fours discard two cards at random as of rules 3.0.0, so no live game can
  enter the four-discard phase. Retained because replaying a stored pre-3.0.0 game renders
  dialogs from the historical phase.
-->
<template>
  <BaseDialog
    id="four-discard-dialog"
    v-model="show"
    :title="t('game.dialogs.four.discardTwoCards')"
    minimizable
  >
    <template #body>
      <p class="mb-4">
        {{ t('game.dialogs.four.opponentHasResolved') }}
      </p>
      <!-- Cards in hand -->
      <div class="d-flex flex-wrap card-container">
        <GameCard
          v-for="card in hand"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-discard-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': isSelected(card.id) }"
          @click="selectCard(card.id)"
        />
      </div>
    </template>
    <template #actions>
      <v-btn
        color="base-dark"
        variant="flat"
        data-cy="submit-four-dialog"
        :disabled="!readyToDiscard"
        @click="discard"
      >
        {{ t('game.dialogs.four.discard') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';
import { useSelectCards } from '@/composables/useSelectCards';

defineOptions({ name: 'FourDialog' });

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits([ 'discard' ]);
const { t } = useI18n();
const gameStore = useGameStore();

const {
  selectedIds,
  isSelected,
  ready,
  selectCard,
  clear,
} = useSelectCards(2);

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    // do nothing - parent controls whether dialog is open
  },
});
const hand = computed(() => gameStore.player.hand);
// Normally two cards, but one is enough when only one card is in hand
const readyToDiscard = computed(
  () => ready.value || (selectedIds.value.length === 1 && hand.value.length === 1),
);

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
