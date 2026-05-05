<template>
  <BaseDialog
    id="discard-to-hand-limit-dialog"
    v-model="show"
    :title="t('game.dialogs.discardToHandLimit.title')"
    minimizable
  >
    <template #body>
      <p class="mb-4">
        {{ t('game.dialogs.discardToHandLimit.body') }}
      </p>
      <!-- Cards in hand -->
      <div class="d-flex flex-wrap card-container">
        <GameCard
          v-for="(card, index) in hand"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-discard-hand-limit-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': selectedIds.includes(card.id) }"
          @click="selectCard(index)"
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
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

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

const selectedIds = ref([]);

const show = computed({
  get: () => props.modelValue,
  set: () => {},
});

const hand = computed(() => player.value.hand);
const discardCount = computed(() => Math.max(0, hand.value.length - 8));
const readyToDiscard = computed(() => selectedIds.value.length === discardCount.value);

function selectCard(handIndex) {
  const cardId = hand.value[handIndex].id;
  const idx = selectedIds.value.indexOf(cardId);
  if (idx !== -1) {
    selectedIds.value.splice(idx, 1);
  } else {
    selectedIds.value.push(cardId);
    if (selectedIds.value.length > discardCount.value) {
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
