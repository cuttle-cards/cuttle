<template>
  <BaseDialog
    v-if="oneOff"
    id="cannot-counter-dialog"
    v-model="show"
    title="Cannot Counter"
  >
    <template #body>
      <div v-if="!opponentLastTwo" class="my-2">
        Your opponent has played the 
        <GameCardName :card-name="oneOff.name" />
        as a one-off
        <span v-if="target">
          targeting your
          <GameCardName :card-name="target.name" />
        </span>
      </div>
      <div v-else class="my-2">
        Your opponent has played 
        <GameCardName :card-name="opponentLastTwo.name" />
        to Counter
        <span v-if="playerLastTwo">
          your 
          <GameCardName :card-name="playerLastTwo.name" />.
        </span>
      </div>
      <div class="d-flex justify-center align-center my-8">
        <GameCard :suit="oneOff.suit" :rank="oneOff.rank" />
        <p class="ml-8">
          {{ t(`game.moves.effects[${oneOff.rank}]`) }}
        </p>
        <div v-if="target" id="target-wrapper">
          <span id="target-icon-wrapper" class="d-flex justify-center align-center">
            <v-icon
              id="target-icon"
              size="x-large"
              color="red"
              icon="mdi-target"
              aria-hidden="true"
            />
          </span>
          <GameCard :suit="target.suit" :rank="target.rank" />
        </div>
      </div>
      You cannot Counter, because {{ reason }}.
    </template>

    <template #actions>
      <v-btn
        data-cy="cannot-counter-resolve"
        color="surface-1"
        variant="flat"
        @click="$emit('resolve')"
      >
        Resolve
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { useI18n } from 'vue-i18n';
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
  emits: ['resolve'],
  setup() {
    const { t } = useI18n();
    return { t };
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
