<template>
  <BaseDialog
    id="five-discard-dialog"
    :model-value="true"
    :title="title"
  >
    <template #body>
      <p class="mb-4">
        {{ dialog }}
      </p>
      <!-- Cards in hand -->
      <div v-if="player.hand" class="d-flex flex-wrap card-container justify-center">
        <GameCard
          v-for="(card, index) in player.hand"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-discard-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': selectedCard === card.id }"
          @click="selectCard(index)"
        />
      </div>
    </template>
    <template #actions>
      <v-btn
        color="surface-1"
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
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';

const { t }  = useI18n();
const gameStore = useGameStore();
const { player } = storeToRefs(gameStore);

const selectedCard = ref();
const emit = defineEmits([ 'resolve-five' ]);

const disableButton = computed(() => !!player.value.hand.length && !selectedCard.value);
const title = computed(() => t(player.value.hand.length ? 'game.dialogs.five.discardAndDraw' : 'game.dialogs.five.nice'));
const dialog = computed(() => t(player.value.hand.length ? 'game.dialogs.five.resolveFive' : 'game.dialogs.five.resolveFiveNoCards'));
const buttonText = computed(() => t(player.value.hand.length ? 'game.dialogs.five.discardAndDraw' : 'rules.draw'));

const selectCard = (index) => {
  selectedCard.value = player.value.hand[index].id;
};

function resolveFive() {
  emit('resolve-five', selectedCard.value);
  selectedCard.value = null;
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
