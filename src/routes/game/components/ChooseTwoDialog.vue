<template>
  <base-dialog
    v-if="oneOff"
    id="choose-two-dialog"
    v-model="show"
    title="Choose Two"
  >
    <template #body>
      <p class="mb-4">
        Which Two would you like to counter with? (Click the card)
      </p>
      <div id="twos-in-hand" class="d-flex justify-center mb-4">
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
      <v-btn
        variant="text"
        color="surface-1"
        data-cy="cancel-counter"
        @click="resolve"
      >
        Cancel
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import GameCard from '~routes/game/components/GameCard.vue';
import BaseDialog from '~core/components/BaseDialog.vue';

export default {
  name: 'ChooseTwoDialog',
  components: {
    BaseDialog,
    GameCard,
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
  emits: ['counter', 'resolve'],
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
    counter(two) {
      this.$emit('counter', two.id);
    },
    resolve() {
      this.$emit('resolve');
    },
  },
};
</script>
