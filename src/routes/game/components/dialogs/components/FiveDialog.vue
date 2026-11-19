<template>
  <BaseDialog
    id="five-discard-dialog"
    :model-value="true"
    :title="title"
    minimizable
  >
    <template #body>
      <p class="mb-4">
        {{ dialog }}
      </p>
      <!-- Cards in hand -->
      <div v-if="player.hand" class="d-flex flex-wrap card-container justify-center">
        <GameCard
          v-for="card in player.hand"
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
        data-cy="submit-five-dialog"
        :disabled="disableButton"
        @click="resolveFive"
      >
        {{ buttonText }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';
import { useSelectCards } from '@/composables/useSelectCards';

const { t }  = useI18n();
const gameStore = useGameStore();
const { player } = storeToRefs(gameStore);

const {
  selectedIds,
  isSelected,
  ready,
  selectCard,
  clear,
} = useSelectCards(1);
const emit = defineEmits([ 'resolve-five' ]);

const disableButton = computed(() => !!player.value.hand.length && !ready.value);
const title = computed(() => t(player.value.hand.length ? 'game.dialogs.five.discardAndDraw' : 'game.dialogs.five.nice'));
const dialog = computed(() => t(player.value.hand.length ? 'game.dialogs.five.resolveFive' : 'game.dialogs.five.resolveFiveNoCards'));
const buttonText = computed(() => t(player.value.hand.length ? 'game.dialogs.five.discardAndDraw' : 'rules.draw'));

function resolveFive() {
  emit('resolve-five', selectedIds.value[0]);
  clear();
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
