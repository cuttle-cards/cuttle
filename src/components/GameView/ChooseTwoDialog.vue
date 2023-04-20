<template>
  <base-dialog v-if="oneOff" v-model="show" id="choose-two-dialog" title="Choose Two">
    <template #body>
      <p>Which Two would you like to counter with? (Click the card)</p>
      <div id="twos-in-hand" class="d-flex justify-center">
        <game-card
          v-for="two in twosInHand"
          :key="two.id"
          :suit="two.suit"
          :rank="two.rank"
          :data-counter-dialog-card="`${two.rank}-${two.suit}`"
          @click="counter(two)"
        />
      </div>
    </template>
    <template #actions>
      <v-btn variant="text" color="primary" data-cy="cancel-counter" @click="resolve">
        Cancel
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import GameCard from '@/components/GameView/GameCard.vue';
import BaseDialog from '@/components/Global/BaseDialog.vue';

export default {
  name: 'ChooseTwoDialog',
  components: {
    BaseDialog,
    GameCard,
  },
  emits: ['counter', 'resolve'],
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    oneOff: {
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
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
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
      this.$emit('resolve');
      this.choseToCounter = false;
    },
  },
};
</script>
