<template>
  <base-dialog v-model="show" id="counter-dialog" title="Chance to Counter">
    <template #body>
      <div v-if="!opponentLastTwo" class="my-2">
        Your opponent has played the 
        <game-card-name :card-name="oneOff.name" />
        as a one-off
        <span v-if="target"> 
          targeting your 
          <game-card-name :card-name="target.name" />
        </span>
      </div>
      <div v-else class="my-2">
        Your opponent has played 
        <game-card-name :card-name="opponentLastTwo.name" />

        to Counter
        <span v-if="playerLastTwo">
          your 
          <game-card-name :card-name="playerLastTwo.name" />
        </span>
      </div>
      <div class="d-flex justify-center align-center my-8">
        <game-card :suit="oneOff.suit" :rank="oneOff.rank" />
        <p class="ml-8">
          {{ oneOff.ruleText }}
        </p>
        <div v-if="target" id="target-wrapper">
          <span id="target-icon-wrapper" class="d-flex justify-center align-center">
            <v-icon size="x-large" color="red" icon="mdi-target" />
          </span>
          <game-card :suit="target.suit" :rank="target.rank" />
        </div>
      </div>
      Would you like to play a two to counter?
    </template>

    <template #actions>
      <v-btn data-cy="decline-counter-resolve" color="surface-1" variant="outlined" @click="resolve" class="mr-4">
        Resolve
      </v-btn>
      <v-btn data-cy="counter" color="surface-1" variant="flat" @click="$emit('choose-to-counter')">
        Counter
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import BaseDialog from '@/components/Global/BaseDialog.vue';
import GameCard from '@/components/GameView/GameCard.vue';
import GameCardName from '@/components/GameView/GameCardName.vue';

export default {
  name: 'ChooseWhetherToCounterDialog',
  components: {
    BaseDialog,
    GameCard,
    GameCardName,
  },
  emits: ['choose-to-counter', 'resolve'],
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
