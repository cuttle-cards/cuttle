<template>
  <BaseDialog
    id="four-reveal-dialog"
    v-model="show"
    :title="t('game.dialogs.fourReveal.title')"
    minimizable
  >
    <template #body>
      <p class="mb-4">
        {{ t('game.dialogs.fourReveal.body', { opponentUsername: gameStore.opponentUsername }) }}
      </p>
      <!-- Cards in hand -->
      <div class="d-flex flex-wrap card-container">
        <GameCard
          v-for="card in player.hand"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-four-reveal-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': isSelected(card.id) }"
          @click="selectCard(card.id)"
        />
      </div>
    </template>
    <template #actions>
      <v-btn
        color="base-dark"
        variant="flat"
        data-cy="submit-four-reveal-dialog"
        :disabled="!readyToReveal"
        @click="reveal"
      >
        {{ t('game.dialogs.fourReveal.reveal') }}
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

const REVEAL_COUNT = 3;

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean,
  },
});

const emit = defineEmits([ 'reveal' ]);

const { t } = useI18n();
const gameStore = useGameStore();
const { player } = storeToRefs(gameStore);

const show = computed({
  get: () => props.modelValue,
  set: () => {},
});

const {
  selectedIds,
  isSelected,
  ready: readyToReveal,
  selectCard,
  clear,
} = useSelectCards(REVEAL_COUNT);

function reveal() {
  if (readyToReveal.value) {
    emit('reveal', [ ...selectedIds.value ]);
    clear();
  }
}
</script>

<style lang="scss" scoped>
.is-selected {
  border: 3px solid rgba(var(--v-theme-primary));
}

.card-container {
  row-gap: 0.5rem;
}
</style>
