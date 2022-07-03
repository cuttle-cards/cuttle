<template>
  <v-dialog v-model="show" persistent max-width="750">
    <v-card v-if="oneOff" id="cannot-counter-dialog">
      <v-card-title>Cannot Counter</v-card-title>
      <v-card-text>
        <span v-if="!opponentLastTwo">
          Your opponent has played the {{ oneOff.name }} as a one-off
          <span v-if="target"> targeting your {{ target.name }}</span>
        </span>
        <span v-else>
          Your opponent has played {{ opponentLastTwo.name }} to Counter<span v-if="playerLastTwo">
            your {{ playerLastTwo.name }}</span
          >.
        </span>
        <div class="d-flex justify-center align-center my-8">
          <card :suit="oneOff.suit" :rank="oneOff.rank" />
          <p class="ml-8">
            {{ oneOff.ruleText }}
          </p>
          <div v-if="target" id="target-wrapper">
            <span id="target-icon-wrapper" class="d-flex justify-center align-center">
              <v-icon id="target-icon" x-large color="red">mdi-target</v-icon>
            </span>
            <card :suit="target.suit" :rank="target.rank" />
          </div>
        </div>
        You cannot Counter, because {{ reason }}.
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn data-cy="cannot-counter-resolve" color="primary" depressed @click="$emit('resolve')">
          Resolve
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Card from '@/components/GameView/Card.vue';

export default {
  name: 'CannotCounterDialog',
  components: {
    Card,
  },
  props: {
    value: {
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
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
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
</style>
