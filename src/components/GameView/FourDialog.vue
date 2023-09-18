<template>
  <base-dialog id="four-discard-dialog" v-model="show" title="Discard Two Cards">
    <template #body>
      <p class="mb-4">
        Your Opponent has resolved a Four One-Off. You must discard two cards. Click to select cards to
        discard.
      </p>
      <!-- Cards in hand -->
      <div class="d-flex flex-wrap card-container">
        <game-card
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
        :disabled="!readyToDiscard"
        @click="discard"
      >
        Discard
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import BaseDialog from '@/components/Global/BaseDialog.vue';
import GameCard from '@/components/GameView/GameCard.vue';

export default {
  name: 'FourDialog',
  components: {
    BaseDialog,
    GameCard,
  },
  props: {
    modelValue: {
      required: true,
      type: Boolean,
    },
  },
  emits: ['discard'],
  data() {
    return {
      selectedIds: [],
    };
  },
  computed: {
    ...mapStores(useGameStore),
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
    hand() {
      return this.gameStore.players[this.gameStore.myPNum].hand;
    },
    readyToDiscard() {
      return this.selectedIds.length === 2 || (this.selectedIds.length === 1 && this.hand.length === 1);
    },
  },
  methods: {
    selectCard(handIndex) {
      const cardId = this.hand[handIndex].id;
      // If already selected, deselect
      if (this.selectedIds.includes(cardId)) {
        this.selectedIds.splice(this.selectedIds.indexOf(cardId), 1);
      } else {
        this.selectedIds.push(cardId);
        // If three cards are selected, deselect 1st selection
        if (this.selectedIds.length > 2) {
          this.selectedIds.splice(0, 1);
        }
      }
    },
    discard() {
      if (this.readyToDiscard) {
        this.$emit('discard', [...this.selectedIds]);
        this.selectedIds = [];
      }
    },
  },
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
