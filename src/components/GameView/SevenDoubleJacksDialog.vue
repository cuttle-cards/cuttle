<template>
  <base-dialog
    id="seven-double-jacks-dialog"
    v-model="show"
    title="Select a Card"
  >
    <template #body>
      <span>Oops, seems you cannot make a move. Select one of the jacks to scrap.</span>
      <div class="d-flex flex-wrap justify-center align-center my-8">
        <template v-if="topCard">
          <game-card
            class="mx-4 my-1"
            :suit="topCard.suit"
            :rank="topCard.rank"
            :is-selected="selectedJack && topCard.id === selectedJack.id"
            :data-seven-double-jacks-dialog-card="`${topCard.rank}-${topCard.suit}`"
            @click="selectCard(topCard.id)"
          />
        </template>
        <template v-if="secondCard">
          <game-card
            class="mx-4 my-1"
            :suit="secondCard.suit"
            :rank="secondCard.rank"
            :is-selected="selectedJack && secondCard.id === selectedJack.id"
            :data-seven-double-jacks-dialog-card="`${secondCard.rank}-${secondCard.suit}`"
            @click="selectCard(secondCard.id)"
          />
        </template>
      </div>
    </template>

    <template #actions>
      <v-btn
        data-cy="seven-double-jacks-resolve"
        :disabled="selectedJack === null"
        color="surface-2"
        variant="flat"
        @click="moveToScrap"
      >
        Resolve
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import BaseDialog from '@/components/Global/BaseDialog.vue';
import GameCard from '@/components/GameView/GameCard.vue';

export default {
  name: 'SevenDoubleJacksDialog',
  components: {
    BaseDialog,
    GameCard,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    topCard: {
      type: Object,
      default: null,
    },
    secondCard: {
      type: Object,
      default: null,
    },
  },
  emits: ['resolveSevenDoubleJacks'],
  data() {
    return {
      selectedCardId: null,
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
    selectedJack() {
      if (this.selectedCardId === null) return null;
      return this.selectedCardId === this.topCard.id ? this.topCard : this.secondCard;
    },
  },
  methods: {
    moveToScrap() {
      const index = this.selectedJack.id === this.topCard.id ? 0 : 1;
      const card = this.selectedJack;
      this.$emit('resolveSevenDoubleJacks', {
        cardId: card.id,
        index,
      });
      this.clearSelection();
    },
    selectCard(cardId) {
      if (cardId === this.selectedCardId) {
        this.clearSelection();
      } else {
        this.selectedCardId = cardId;
      }
    },
    clearSelection() {
      this.selectedCardId = null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
