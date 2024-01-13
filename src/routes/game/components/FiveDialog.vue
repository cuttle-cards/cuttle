<template>
  <BaseDialog id="five-discard-dialog" v-model="gameStore.discardingTwo" :title="title">
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
        data-cy="submit-four-dialog"
        :disabled="!selectedCard"
        @click="emit('resolve-five', selectedCard)"
      >
        discard
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

const gameStore = useGameStore();
const { player } = storeToRefs(gameStore);

const selectedCard = ref();
const emit = defineEmits(['resolve-five']);


const title = computed(() => player.value.hand.length ? 'Discard a Card' : 'Nice!');
const dialog = computed(() => player.value.hand.length ? 'You have resolved a 5 one-off. Choose a card to discard and then you will draw 3 cards' : 'You have Resolved a 5 one-off, but have no cards in your hand to discard. You draw 3 cards without discarding. Sweet!');

const selectCard = (index) => {
  selectedCard.value = player.value.hand[index].id;
};
</script>

<style lang="scss" scoped>
.is-selected {
  border: 3px solid rgba(var(--v-theme-error));
}

.card-container {
  row-gap: 0.5rem;
}
</style>