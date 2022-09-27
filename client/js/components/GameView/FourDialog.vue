<template>
  <v-dialog v-model="show" persistent>
    <v-card id="four-discard-dialog">
      <v-card-title>Discard Two Cards</v-card-title>
      <v-card-text>
        <p>
          Your Opponent has resolved a Four One-Off. You must discard two cards. Click to select cards to
          discard.
        </p>
        <!-- Cards in hand -->
        <div class="d-flex flex-wrap">
          <card
            v-for="(card, index) in hand"
            :key="card.id"
            :suit="card.suit"
            :rank="card.rank"
            :data-discard-card="`${card.rank}-${card.suit}`"
            :class="{ 'is-selected': selectedIds.includes(card.id) }"
            @click="selectCard(index)"
          />
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" data-cy="submit-four-dialog" :disabled="!readyToDiscard" @click="discard">
          Discard
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Card from '@/components/GameView/Card.vue';

export default {
  name: 'FourDialog',
  components: {
    Card,
  },
  props: {
    value: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      selectedIds: [],
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
    hand() {
      return this.$store.state.game.players[this.$store.state.game.myPNum].hand;
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
  border: 3px solid var(--v-error-base);
}
</style>
