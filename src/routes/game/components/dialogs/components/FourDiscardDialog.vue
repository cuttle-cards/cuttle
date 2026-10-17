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
          v-for="card in revealedCards"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-four-discard-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': selectedIds.includes(card.id) }"
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
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

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
const { revealedCards } = storeToRefs(gameStore);

const selectedIds = ref([]);

const show = computed({
  get: () => props.modelValue,
  set: () => {},
});

const readyToDiscard = computed(() => selectedIds.value.length === DISCARD_COUNT);

function selectCard(cardId) {
  const idx = selectedIds.value.indexOf(cardId);
  if (idx !== -1) {
    selectedIds.value.splice(idx, 1);
  } else {
    selectedIds.value.push(cardId);
    if (selectedIds.value.length > DISCARD_COUNT) {
      selectedIds.value.splice(0, 1);
    }
  }
}

function discard() {
  if (readyToDiscard.value) {
    emit('discard', [ ...selectedIds.value ]);
    selectedIds.value = [];
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
