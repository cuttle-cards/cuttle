<template>
  <v-overlay
    id="move-choice-overlay"
    class="d-flex flex-column justify-center align-center"
    :value="value"
    @click.native="$emit('cancel')"
  >
    <!-- Cancel button -->
    <div id="close-wrapper" class="d-flex justify-end my-4">
      <v-btn icon data-cy="cancel-move" @click="$emit('cancel')">
        <v-icon x-large> mdi-close </v-icon>
      </v-btn>
    </div>
    <div v-if="selectedCard" class="d-flex justify-center">
      <card
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
        class="mx-4"
        @click="$emit(move.eventName, move)"
      />
    </div>
  </v-overlay>
</template>

<script>
import MoveChoiceCard from '@/components/GameView/MoveChoiceCard.vue';
import Card from '@/components/GameView/Card.vue';

export default {
  name: 'MoveChoiceOverlay',
  components: {
    MoveChoiceCard,
    Card,
  },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    selectedCard: {
      type: Object,
      default: null,
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
      required: true,
    },
  },
  computed: {
    /**
     * Returns list of objects representing the available moves,
     * based on the selected card
     */
    moveChoices() {
      if (!this.selectedCard) return [];
      let res = [];
      let cardRank;
      if (this.resolvingSeven) {
        if (!this.cardSelectedFromDeck) return [];
        cardRank = this.cardSelectedFromDeck.rank;
      } else {
        if (!this.selectedCard) return [];
        cardRank = this.selectedCard.rank;
      }
      // Re-usable move-objects
      const allMovesAreDisabled = !this.isPlayersTurn || this.frozenId === this.selectedCard.id;
      const allMovesDisabledExplanation = !this.isPlayersTurn ? "It's not your turn" : 'This card is frozen';

      let disabledText;
      if (allMovesAreDisabled) {
        disabledText = allMovesDisabledExplanation;
      }

      // Points
      const pointsDescription = `Gain ${cardRank} point` + (cardRank === 1 ? '' : 's');
      const pointsMove = {
        displayName: 'Points',
        eventName: 'points',
        moveDescription: pointsDescription,
        disabled: allMovesAreDisabled,
        disabledExplanation: disabledText,
      };
      // Scuttling
      const scuttleDisabled = !this.isPlayersTurn || !this.hasValidScuttleTarget;
      let scuttleDisabledExplanation = 'You can only scuttle smaller point cards';
      if (this.$store.getters.opponent.points.length === 0) {
        scuttleDisabledExplanation = 'Your opponent has no point cards to scuttle';
      }
      if (allMovesAreDisabled) {
        scuttleDisabledExplanation = allMovesDisabledExplanation;
      }
      const scuttleMove = {
        displayName: 'Scuttle',
        eventName: 'scuttle',
        moveDescription: 'Scrap a lower point card',
        disabled: scuttleDisabled || allMovesAreDisabled,
        disabledExplanation: scuttleDisabledExplanation,
      };

      switch (cardRank) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          res = [
            pointsMove,
            scuttleMove,
            // One-Off
            {
              displayName: 'One-Off',
              eventName: 'oneOff',
              moveDescription: this.selectedCard.ruleText,
              disabled: allMovesAreDisabled,
              disabledExplanation: disabledText,
            },
          ];
          break;
        case 2:
        case 9:
          let oneOffDisabled = !this.isPlayersTurn;
          let oneOffDisabledExplanation = "It's not your turn";
          if (this.isPlayersTurn) {
            if (this.opponentQueenCount >= 2) {
              oneOffDisabled = true;
              oneOffDisabledExplanation = `You can't play a ${cardRank} while your opponent has two or more queens`;
            } else {
              let validTargetExists;
              // Twos
              if (cardRank === 2) {
                const numOpFaceCards = this.$store.getters.opponent.faceCards.length;
                const numOpJacks = this.$store.getters.opponent.points.reduce((jackCount, pointCard) => {
                  return jackCount + pointCard.attachments.length;
                }, 0);
                const numTotalTargets = numOpFaceCards + numOpJacks;
                validTargetExists = numTotalTargets >= 1;
                if (allMovesAreDisabled) {
                  oneOffDisabledExplanation = allMovesDisabledExplanation;
                } else if (!validTargetExists) {
                  oneOffDisabled = true;
                  oneOffDisabledExplanation = 'There are no Royals to target';
                }
                // Nines
              } else {
                const numValidTargets =
                  this.$store.getters.opponent.points.length + this.$store.getters.opponent.faceCards.length;
                if (allMovesAreDisabled) {
                  oneOffDisabledExplanation = allMovesDisabledExplanation;
                } else if (numValidTargets === 0) {
                  oneOffDisabled = true;
                  oneOffDisabledExplanation = 'There are no point cards or Royals to target';
                }
              }
            }
          }
          res = [
            pointsMove,
            scuttleMove,
            {
              displayName: 'One-Off',
              eventName: 'targetedOneOff',
              moveDescription: this.selectedCard.ruleText,
              disabled: oneOffDisabled || allMovesAreDisabled,
              disabledExplanation: oneOffDisabledExplanation,
            },
          ];
          break;
        case 8:
          res = [
            pointsMove,
            scuttleMove,
            // Glasses
            {
              displayName: 'Glasses',
              eventName: 'faceCard',
              moveDescription: 'Your opponent plays open handed',
              disabled: allMovesAreDisabled,
              disabledExplanation: disabledText,
            },
          ];
          break;
        case 10:
          res = [pointsMove, scuttleMove];
          break;
        case 11:
          let ableToJack = false;
          let disabledExplanation = '';
          if (this.isPlayersTurn && !allMovesAreDisabled) {
            ableToJack = this.opponentQueenCount === 0;
            disabledExplanation = "You cannot jack your opponent's points while they have a queen";
          } else {
            disabledExplanation = disabledText;
          }
          res = [
            {
              displayName: 'Royal',
              eventName: 'jack',
              moveDescription: "Steal an opponent's point card",
              disabled: !ableToJack || allMovesAreDisabled,
              disabledExplanation,
            },
          ];
          break;
        case 12:
        case 13:
          res = [
            {
              displayName: 'Royal',
              eventName: 'faceCard',
              moveDescription: this.selectedCard.ruleText,
              disabled: allMovesAreDisabled,
              disabledExplanation: disabledText,
            },
          ];
          break;
      }
      return res;
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
      if (this.$vuetify.breakpoint.xs) {
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
