<template>
  <v-dialog v-model="show" persistent max-width="750">
    <v-card id="seven-double-jacks-dialog">
      <v-card-title>Select a Card</v-card-title>
      <v-card-text>
        <span>Oops, seems you cannot make a move. Select one of the jacks to scrap.</span>
        <div class="d-flex flex-wrap justify-center align-center my-8">
          <template v-if="topCard">
            <card
              class="mx-4 my-1"
              :suit="topCard.suit"
              :rank="topCard.rank"
              :is-selected="selectedJack && topCard.id === selectedJack.id"
              :data-seven-double-jacks-dialog-card="`${topCard.rank}-${topCard.suit}`"
              @click="selectCard(topCard.id)"
            />
          </template>
          <template v-if="secondCard">
            <card
              class="mx-4 my-1"
              :suit="secondCard.suit"
              :rank="secondCard.rank"
              :is-selected="selectedJack && secondCard.id === selectedJack.id"
              :data-seven-double-jacks-dialog-card="`${secondCard.rank}-${secondCard.suit}`"
              @click="selectCard(secondCard.id)"
            />
          </template>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          data-cy="seven-double-jacks-resolve"
          color="primary"
          :disabled="selectedJack === null"
          outlined
          @click="moveToScrap"
        >
          Resolve
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Card from '@/components/GameView/Card.vue';

export default {
  name: 'SevenDoubleJacksDialog',
  components: {
    Card,
  },
  props: {
    value: {
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
  data() {
    return {
      selectedCardId: null,
    };
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
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
