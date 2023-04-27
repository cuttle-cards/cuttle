<template>
  <choose-whether-to-counter-dialog
    v-if="oneOff"
    :model-value="show && !choseToCounter"
    :one-off="oneOff"
    :twos-in-hand="twosInHand"
    :twos-played="twosPlayed"
    :target="target"
    @choose-to-counter="choseToCounter = true"
    @resolve="resolve"
  />

  <choose-two-dialog
    v-if="oneOff"
    :model-value="show && choseToCounter"
    :one-off="oneOff"
    :twos-in-hand="twosInHand"
    :twos-played="twosPlayed"
    @counter="counter($event)"
    @resolve="resolve"
  />
</template>

<script>
import ChooseWhetherToCounterDialog from './ChooseWhetherToCounterDialog.vue';
import ChooseTwoDialog from './ChooseTwoDialog.vue';

export default {
  name: 'CounterDialog',
  components: {
    ChooseWhetherToCounterDialog,
    ChooseTwoDialog,
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
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
  },
  methods: {
    counter(twoId) {
      this.$emit('counter', twoId);
      this.choseToCounter = false;
    },
    resolve() {
      this.$emit('resolve');
      this.choseToCounter = false;
    },
  },
};
</script>
