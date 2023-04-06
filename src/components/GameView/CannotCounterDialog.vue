<template>
  <v-dialog v-model="show" persistent max-width="650">
    <v-card v-if="oneOff" id="cannot-counter-dialog">
      <div id="cannot-counter-wrapper">
        <v-card-title>Cannot Counter</v-card-title>
        <v-card-text>
          <span v-if="!opponentLastTwo">
            Your opponent has played the {{ oneOff.name }} as a one-off
            <span v-if="target"> targeting your {{ target.name }}</span>
          </span>
          <span v-else>
            Your opponent has played <strong class="card-name">{{ opponentLastTwo.name }}</strong> to Counter<span v-if="playerLastTwo">
              your {{ playerLastTwo.name }}</span
            >.
          </span>
          <div class="d-flex justify-center align-center my-8">
            <game-card :suit="oneOff.suit" :rank="oneOff.rank" />
            <p class="ml-8">
              {{ oneOff.ruleText }}
            </p>
            <div v-if="target" id="target-wrapper">
              <span id="target-icon-wrapper" class="d-flex justify-center align-center">
                <v-icon id="target-icon" size="x-large" color="red" icon="mdi-target" />
              </span>
              <game-card :suit="target.suit" :rank="target.rank" />
            </div>
          </div>
          You cannot Counter, because {{ reason }}.
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn data-cy="cannot-counter-resolve" color="primary" variant="flat" @click="$emit('resolve')">
            Resolve
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import GameCard from '@/components/GameView/GameCard.vue';

export default {
  name: 'CannotCounterDialog',
  components: {
    GameCard,
  },
  emits: ['resolve'],
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    oneOff: {
      type: Object,
      default: null,
    },
    target: {
      type: Object,
      default: null,
    },
    opponentQueenCount: {
      type: Number,
      default: 0,
    },
    playerTwoCount: {
      type: Number,
      default: 0,
    },
    twosPlayed: {
      type: Array,
      default: null,
    },
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
    reason() {
      let reason = '';
      const OPPONENT_HAS_QUEEN = 'your opponent has a queen';
      const PLAYER_HAS_NO_TWOS = 'you do not have a two';
      if (this.opponentQueenCount > 0) {
        reason += OPPONENT_HAS_QUEEN;
      }
      if (this.playerTwoCount > 0) {
        reason += (reason ? 'and ' : '') + PLAYER_HAS_NO_TWOS;
      }
      return reason || PLAYER_HAS_NO_TWOS;
    },
    opponentLastTwo() {
      return this.twosPlayed && this.twosPlayed.length > 0
        ? this.twosPlayed[this.twosPlayed.length - 1]
        : null;
    },
    playerLastTwo() {
      return this.twosPlayed && this.twosPlayed.length > 1
        ? this.twosPlayed[this.twosPlayed.length - 2]
        : null;
    },
  },
};
</script>

<style lang="scss" scoped>
#cannot-counter-dialog {
  padding: 8px;
  opacity: .95;
  color: #FFF4D7;
}
#cannot-counter-wrapper {
  border: 4px solid #FFF4D7;
  border-radius: 8px;
}
#target-wrapper {
  display: inline-block;
  position: relative;

  & #target-icon-wrapper {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}

.card-name {
  background: #FFF4D7;
  color: #4A2416;
  padding-right: 8px;
  padding-left: 8px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-radius: 8px;
  margin-right: 4px;
  margin-left: 4px;
}
</style>
