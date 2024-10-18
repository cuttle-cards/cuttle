<template>
  <BaseDialog
    v-if="oneOff"
    id="cannot-counter-dialog"
    v-model="show"
    :title="t('game.dialogs.counterDialogs.cannotCounterTitle')"
  >
    <template #body>
      <div v-if="!opponentLastTwo" class="my-2">
        {{ t(`game.dialogs.counterDialogs.opponentPlayed`) }}
        <GameCardName :card-name="oneOff.name" />
        {{ t(`game.dialogs.counterDialogs.oneOff`) }}
        <span v-if="target">
          {{ t(`game.dialogs.counterDialogs.target`) + t(`global.your`) }} 
          <GameCardName :card-name="target.name" />
        </span>
      </div>
      <div v-else class="my-2">
        {{ t(`game.dialogs.counterDialogs.opponentPlayed`) }}
        <GameCardName :card-name="opponentLastTwo.name" />
        {{ t(`game.dialogs.counterDialogs.toCounter`) }}
        <span v-if="playerLastTwo">
          {{ t(`global.your`) }}
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
      {{ t(`game.dialogs.counterDialogs.cannotCounter`) + reason }}.
    </template>

    <template #actions>
      <v-btn
        data-cy="cannot-counter-counter"
        variant="flat"
        disabled
      >
        {{ t('game.dialogs.counterDialogs.counter') }}
      </v-btn>
      <v-btn
        data-cy="cannot-counter-resolve"
        color="surface-1"
        class="ml-4"
        variant="flat"
        @click="$emit('resolve')"
      >
        {{ t(`game.resolve`) }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';
import GameCardName from '@/routes/game/components/GameCardName.vue';

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
  emits: [ 'resolve' ],
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
      const OPPONENT_HAS_QUEEN = this.$t('game.dialogs.counterDialogs.reasons.opponentWithQueen');
      const PLAYER_HAS_NO_TWOS = this.$t('game.dialogs.counterDialogs.reasons.noTwoPresent');
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
