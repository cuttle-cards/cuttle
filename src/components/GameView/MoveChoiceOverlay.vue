<template>
  <v-overlay
    id="move-choice-overlay"
    class="d-flex flex-column justify-center align-center"
    :modelValue="modelValue"
    @click="$emit('cancel')"
  >
    <!-- Cancel button -->
    <div id="close-wrapper" class="d-flex justify-end my-4">
      <v-btn
        icon
        variant="text"
        color="white"
        size="x-large"
        data-cy="cancel-move"
        @click="$emit('cancel')"
      >
        <v-icon icon="mdi-close" size="x-large" />
      </v-btn>
    </div>
    <div v-if="selectedCard" class="d-flex justify-center">
      <game-card
        :suit="selectedCard.suit"
        :rank="selectedCard.rank"
        :data-player-overlay-card="`${selectedCard.rank}-${selectedCard.suit}`"
        :is-frozen="frozenId === selectedCard.id"
      />
    </div>
    <!-- Move choices -->
    <div id="options-wrapper" class="d-flex justify-space-between my-4">
      <move-choice-card
        v-for="move in moveChoices"
        :key="move.displayName"
        :move-name="move.displayName"
        :move-description="move.moveDescription"
        :event-name="move.eventName"
        :disabled="move.disabled"
        :disabled-explanation="move.disabledExplanation"
        :card-width="cardWidth"
        @choose-move="$emit(move.eventName, move)"
      />
    </div>
  </v-overlay>
</template>

<script>
import MoveChoiceCard from '@/components/GameView/MoveChoiceCard.vue';
import GameCard from '@/components/GameView/GameCard.vue';

export default {
  name: 'MoveChoiceOverlay',
  components: {
    MoveChoiceCard,
    GameCard,
  },
  emits: ['points', 'faceCard', 'scuttle', 'jack', 'oneOff', 'targetedOneOff', 'cancel'],
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    selectedCard: {
      type: Object,
      required: true,
    },
    isPlayersTurn: {
      type: Boolean,
      required: true,
    },
    opponentQueenCount: {
      type: Number,
      required: true,
    },
    frozenId: {
      type: Number,
      default: null,
    },
    playingFromDeck: {
      type: Boolean,
      required: true,
    },
    cardSelectedFromDeck: {
      type: Object,
      default: null,
    },
  },
  computed: {
    // Determines if any moves are available
    allMovesAreDisabled() {
      return (
        !this.isPlayersTurn ||
        this.frozenId === this.selectedCard.id ||
        (this.playingFromDeck && !this.cardSelectedFromDeck)
      );
    },
    // Determines which disabled text to display
    disabledText() {
      if (this.playingFromDeck && !this.cardSelectedFromDeck) {
        return 'You must play one of the top two cards from the deck';
      } else if (this.allMovesAreDisabled) {
        return !this.isPlayersTurn ? "It's not your turn" : 'This card is frozen';
      }
      return '';
    },
    pointsMove() {
      const pointsDescription =
        `Gain ${this.selectedCard.rank} point` + (this.selectedCard.rank === 1 ? '' : 's');
      return {
        displayName: 'Points',
        eventName: 'points',
        moveDescription: pointsDescription,
        disabled: this.allMovesAreDisabled,
        disabledExplanation: this.disabledText,
      };
    },
    scuttleMove() {
      const scuttleDisabled = this.allMovesAreDisabled || !this.hasValidScuttleTarget;
      let scuttleDisabledExplanation = 'You can only scuttle smaller point cards';
      if (this.$store.getters.opponent.points.length === 0) {
        scuttleDisabledExplanation = 'Your opponent has no point cards to scuttle';
      }
      if (this.allMovesAreDisabled) {
        scuttleDisabledExplanation = this.disabledText;
      }
      return {
        displayName: 'Scuttle',
        eventName: 'scuttle',
        moveDescription: 'Scrap a lower point card',
        disabled: scuttleDisabled,
        disabledExplanation: scuttleDisabledExplanation,
      };
    },
    oneOffMove() {
      let oneOffDisabled = this.allMovesAreDisabled;
      let oneOffDisabledExplanation = this.disabledText;
      //Check deck while playing 7s
      if (this.selectedCard.rank === 7) {
        const noTopCard = !this.$store.state.game.topCard;
        const playingTopCard = this.selectedCard?.id === this.$store.state.game.topCard?.id;
        const noSecondCard = !this.$store.state.game.secondCard;
        if (noTopCard || (playingTopCard && noSecondCard)) {
          oneOffDisabled = true;
          oneOffDisabledExplanation = "Can't be played with empty deck";
        }
      }
      return {
        displayName: 'One-Off',
        eventName: 'oneOff',
        moveDescription: this.selectedCard.ruleText,
        disabled: oneOffDisabled,
        disabledExplanation: oneOffDisabledExplanation,
      };
    },

    targetedOneOffMove() {
      let oneOffDisabled = this.allMovesAreDisabled;
      let oneOffDisabledExplanation = this.disabledText;
      if (!this.allMovesAreDisabled) {
        if (this.opponentQueenCount >= 2) {
          oneOffDisabled = true;
          oneOffDisabledExplanation = `You can't play a ${this.selectedCard.rank} while your opponent has two or more queens`;
        } else {
          let validTargetExists;
          // Twos
          if (this.selectedCard.rank === 2) {
            const numOpFaceCards = this.$store.getters.opponent.faceCards.length;
            const numOpJacks = this.$store.getters.opponent.points.reduce((jackCount, pointCard) => {
              return jackCount + pointCard.attachments.length;
            }, 0);
            const numTotalTargets = numOpFaceCards + numOpJacks;
            validTargetExists = numTotalTargets >= 1;
            if (!validTargetExists) {
              oneOffDisabled = true;
              oneOffDisabledExplanation = 'There are no Royals to target';
            }
          } else {
            const numValidTargets =
              this.$store.getters.opponent.points.length + this.$store.getters.opponent.faceCards.length;
            if (numValidTargets === 0) {
              oneOffDisabled = true;
              oneOffDisabledExplanation = 'There are no point cards or Royals to target';
            }
          }
        }
      }
      return {
        displayName: 'One-Off',
        eventName: 'targetedOneOff',
        moveDescription: this.selectedCard.ruleText,
        disabled: oneOffDisabled,
        disabledExplanation: oneOffDisabledExplanation,
      };
    },
    jackMove() {
      let ableToJack = false;
      let disabledExplanation = '';
      if (!this.allMovesAreDisabled) {
        ableToJack = this.opponentQueenCount === 0;
        disabledExplanation = "You cannot jack your opponent's points while they have a queen";
      } else {
        disabledExplanation = this.disabledText;
      }
      return {
        displayName: 'Royal',
        eventName: 'jack',
        moveDescription: "Steal an opponent's point card",
        disabled: !ableToJack || this.allMovesAreDisabled,
        disabledExplanation,
      };
    },

    /**
     * Returns list of objects representing the available moves,
     * based on the selected card
     */
    moveChoices() {
      switch (this.selectedCard.rank) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          return [this.pointsMove, this.scuttleMove, this.oneOffMove];
        case 2:
        case 9:
          return [this.pointsMove, this.scuttleMove, this.targetedOneOffMove];
        case 8:
          return [
            this.pointsMove,
            this.scuttleMove,
            // Glasses
            {
              displayName: 'Glasses',
              eventName: 'faceCard',
              moveDescription: 'Your opponent plays open handed',
              disabled: this.allMovesAreDisabled,
              disabledExplanation: this.disabledText,
            },
          ];
        case 10:
          return [this.pointsMove, this.scuttleMove];
        case 11:
          return [this.jackMove];
        case 12:
        case 13:
          return [
            {
              displayName: 'Royal',
              eventName: 'faceCard',
              moveDescription: this.selectedCard.ruleText,
              disabled: this.allMovesAreDisabled,
              disabledExplanation: this.disabledText,
            },
          ];
      }
      return [];
    },
    /**
     * @return boolean whether there is a legal scuttle using selected card
     */
    hasValidScuttleTarget() {
      // Can't scuttle with a royal
      if (this.selectedCard.rank >= 11) return false;
      // Return true iff at least one opponent point card is scuttleable w/ selected card
      return this.$store.getters.opponent.points.some((opponentPointCard) => {
        return (
          this.selectedCard.rank > opponentPointCard.rank ||
          (this.selectedCard.rank === opponentPointCard.rank &&
            this.selectedCard.suit > opponentPointCard.suit)
        );
      });
    },
    cardWidth() {
      if (this.$vuetify.display.xs) {
        return '100%';
      }
      switch (this.moveChoices.length) {
        case 1:
          return '100%';
        case 2:
          return '50%';
        case 3:
        default:
          return '30%';
      }
    },
  }, // End computed{}
};
</script>

<style scoped lang="scss">
#move-choice-overlay {
  & #close-wrapper {
    width: 85%;
  }
}
@media (max-width: 600px) {
  #options-wrapper {
    flex-direction: column;
    align-items: center;
  }
}
</style>
