<template>
  <BaseDialog
    v-if="oneOff"
    id="choose-two-dialog"
    v-model="show"
    :title="t('game.dialogs.counterDialogs.chooseTwoTitle')"
  >
    <template #body>
      <p class="mb-4">
        {{ t('game.dialogs.counterDialogs.selectCard') }}
      </p>
      <div id="twos-in-hand" class="d-flex justify-center mb-4">
        <GameCard
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
        {{ t('global.cancel') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import GameCard from '@/routes/game/components/GameCard.vue';
import BaseDialog from '@/components/BaseDialog.vue';
import { useI18n } from 'vue-i18n';

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
  emits: [ 'counter', 'resolve' ],
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
