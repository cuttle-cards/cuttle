<template>
  <v-dialog v-model="show" persistent max-width="750">
    <v-card v-if="oneOff && !choseToCounter" id="counter-dialog">
      <v-card-title>Chance to Counter</v-card-title>
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
              <v-icon x-large color="red">mdi-target</v-icon>
            </span>
            <card :suit="target.suit" :rank="target.rank" />
          </div>
        </div>
        Would you like to play a two to counter?
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn data-cy="decline-counter-resolve" color="primary" outlined @click="resolve"> Resolve </v-btn>
        <v-btn data-cy="counter" color="primary" depressed @click="choseToCounter = true"> Counter </v-btn>
      </v-card-actions>
    </v-card>
    <!-- Choose which two to use to counter -->
    <v-card v-if="oneOff && choseToCounter" id="choose-two-dialog">
      <v-card-title>Choose Two</v-card-title>
      <v-card-text>
        <p>Which Two would you like to counter with? (Click the card)</p>
        <div id="twos-in-hand" class="d-flex justify-center">
          <card
            v-for="two in twosInHand"
            :key="two.id"
            :suit="two.suit"
            :rank="two.rank"
            :data-counter-dialog-card="`${two.rank}-${two.suit}`"
            @click="counter(two)"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn text color="primary" data-cy="cancel-counter" @click="resolve"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Card from '@/components/GameView/Card.vue';

export default {
  name: 'CounterDialog',
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
    // list of card objects for available twos
    twosInHand: {
      type: Array,
      required: true,
    },
    twosPlayed: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      choseToCounter: false,
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
  methods: {
    counter(two) {
      this.$emit('counter', two.id);
      this.choseToCounter = false;
    },
    resolve() {
      this.choseToCounter = false;
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
