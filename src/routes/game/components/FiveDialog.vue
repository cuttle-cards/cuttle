<template>
  <BaseDialog id="five-discard-dialog" v-model="show" :title="title">
    <template #body>
      <p class="mb-4">
        {{ dialog }}
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
        color="surface-1"
        variant="flat"
        data-cy="submit-four-dialog"
        :disabled="!selectedCard"
        @click="emit('discard', [...selectedCard])"
      >
        {{ t('game.dialogs.four.discard') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from '@/components/BaseDialog.vue';
import  { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game.js';

const gameStore = useGameStore();
const { player } = storeToRefs(gameStore);
const { hand } = player;

const selectedCard = ref(null);
const emit = defineEmits(['discard']);

const title = computed(() => player.hand?.length ? 'Discard a Card' : 'Nice!');
const dialog = computed(() => player.hand?.length ? 'You have resolved a 5 one-off. Choose a card to discard and then you will draw 3 cards' : 'You have Resolved a 5 one-off, but have no cards in your hand to discard. You draw 3 cards without discarding. Sweet!');
const show = computed(() => true);

const selectCard = (index) => {
  selectedCard.value = hand[index].id;
};


</script>