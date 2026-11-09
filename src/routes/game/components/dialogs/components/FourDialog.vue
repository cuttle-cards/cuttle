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
          v-for="(card, index) in hand"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-discard-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': selectedIds.includes(card.id) }"
          @click="selectCard(index)"
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

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

const selectedIds = ref([]);

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    // do nothing - parent controls whether dialog is open
  },
});
const hand = computed(() => gameStore.player.hand);
const readyToDiscard = computed(
  () => selectedIds.value.length === 2 || (selectedIds.value.length === 1 && hand.value.length === 1),
);

function selectCard(handIndex) {
  const cardId = hand.value[handIndex].id;
  // If already selected, deselect
  if (selectedIds.value.includes(cardId)) {
    selectedIds.value.splice(selectedIds.value.indexOf(cardId), 1);
  } else {
    selectedIds.value.push(cardId);
    // If three cards are selected, deselect 1st selection
    if (selectedIds.value.length > 2) {
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
