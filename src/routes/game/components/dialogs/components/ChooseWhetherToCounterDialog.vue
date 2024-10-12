<template>
  <BaseDialog id="counter-dialog" v-model="show" :title="t('game.dialogs.counterDialogs.counterTitle')">
    <template #body>
      <div v-if="!opponentLastTwo" class="my-2">
        {{ t('game.dialogs.counterDialogs.opponentPlayed') }}
        <GameCardName :card-name="oneOff.name" />
        {{ t('game.dialogs.counterDialogs.oneOff') }}
        <span v-if="target" class="test">
          {{ `${t('game.dialogs.counterDialogs.target')} ${t('global.your')}` }}
          <GameCardName :card-name="target.name" />
        </span>
      </div>
      <div v-else class="my-2">
        {{ t('game.dialogs.counterDialogs.opponentPlayed') }}
        <GameCardName :card-name="opponentLastTwo.name" />

        {{ t('game.dialogs.counterDialogs.toCounter') }}
        <span v-if="playerLastTwo">
          {{ t('global.your') }}
          <GameCardName :card-name="playerLastTwo.name" />
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
              size="x-large"
              color="red"
              icon="mdi-target"
              aria-hidden="true"
            />
          </span>
          <GameCard :suit="target.suit" :rank="target.rank" />
        </div>
      </div>
      {{ t('game.dialogs.counterDialogs.playTwo') }}
    </template>

    <template #actions>
      <v-btn
        data-cy="counter"
        color="newPrimary"
        variant="flat"
        @click="$emit('choose-to-counter')"
      >
        {{ t('game.dialogs.counterDialogs.counter') }}
      </v-btn>
      <v-btn
        data-cy="decline-counter-resolve"
        color="surface-1"
        variant="flat"
        class="ml-4"
        @click="resolve"
      >
        {{ t('game.resolve') }}
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
  name: 'ChooseWhetherToCounterDialog',
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
      required: true,
    },
    target: {
      type: Object,
      default: null,
    },
    twosPlayed: {
      type: Array,
      required: true,
    },
  },
  emits: [ 'choose-to-counter', 'resolve' ],
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
    thereAreTwos() {
      return this.twosPlayed && this.twosPlayed.length > 0;
    },
    opponentLastTwo() {
      return this.thereAreTwos
        ? this.twosPlayed[this.twosPlayed.length - 1]
        : null;
    },
    playerLastTwo() {
      return this.thereAreTwos
        ? this.twosPlayed[this.twosPlayed.length - 2]
        : null;
    },
  },
  methods: {
    resolve() {
      this.$emit('resolve');
    },
  },
};
</script>

<style lang="scss" scoped>
#target-wrapper {
  position: relative;
  & #target-icon-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
</style>
