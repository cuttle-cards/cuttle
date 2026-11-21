<template>
  <BaseDialog
    id="discard-to-hand-limit-dialog"
    v-model="show"
    :title="t('game.dialogs.discardToHandLimit.title')"
    minimizable
  >
    <template #body>
      <p class="mb-4">
        {{ t('game.dialogs.discardToHandLimit.body', {handLimit: HAND_LIMIT}) }}
      </p>
      <!-- Cards in hand -->
      <div class="d-flex flex-wrap card-container">
        <GameCard
          v-for="card in hand"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-discard-hand-limit-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': isSelected(card.id) }"
          @click="selectCard(card.id)"
        />
      </div>
    </template>
    <template #actions>
      <v-btn
        color="base-dark"
        variant="flat"
        data-cy="submit-discard-to-hand-limit-dialog"
        :disabled="!readyToDiscard"
        @click="discard"
      >
        {{ t('game.dialogs.discardToHandLimit.discard') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore, HAND_LIMIT } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';
import { useSelectCards } from '@/composables/useSelectCards';

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean,
  },
});

const emit = defineEmits([ 'discard' ]);

const { t } = useI18n();
const gameStore = useGameStore();
const { player } = storeToRefs(gameStore);

const show = computed({
  get: () => props.modelValue,
  set: () => {},
});

const hand = computed(() => player.value.hand);
const discardCount = computed(() => Math.max(0, hand.value.length - HAND_LIMIT));
const {
  selectedIds,
  isSelected,
  ready: readyToDiscard,
  selectCard,
  clear,
} = useSelectCards(discardCount);

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
