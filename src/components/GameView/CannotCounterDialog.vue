<template>
  <base-dialog v-if="oneOff" v-model="show" title="Cannot Counter" id="cannot-counter-dialog">
    <template #body>
      <span v-if="!opponentLastTwo">
        Your opponent has played the 
        <game-card-name :card-name="oneOff.name" />
        as a one-off
        <span v-if="target"> targeting your 
          <game-card-name :card-name="target.name" />
        </span>
      </span>
      <span v-else>
        Your opponent has played 
        <game-card-name :card-name="opponentLastTwo.name" />
        to Counter
        <span v-if="playerLastTwo">
          your 
          <game-card-name :card-name="playerLastTwo.name" />.
        </span>
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
    </template>

    <template #actions>
      <v-btn
        data-cy="cannot-counter-resolve"
        color="surface-2"
        variant="flat" 
        @click="$emit('resolve')"
      >
        Resolve
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import BaseDialog from '@/components/Global/BaseDialog.vue';
import GameCard from '@/components/GameView/GameCard.vue';
import GameCardName from '@/components/GameView/GameCardName.vue';

export default {
  name: 'CannotCounterDialog',
  components: {
    BaseDialog,
    GameCard,
    GameCardName,
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
