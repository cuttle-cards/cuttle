<template>
  <BaseDialog
    v-if="oneOff"
    id="three-dialog"
    v-model="show"
    title="Select a Card from Scrap"
    scrollable
  >
    <template #body>
      <div class="d-flex flex-wrap justify-center align-center my-8">
        <CardListSortable
          :cards="scrap"
          data-selector-prefix="three-dialog"
          :selected-ids="selectedIds"
          @select-card="selectCard"
        />
      </div>
    </template>

    <template #actions>
      <v-btn
        data-cy="three-resolve"
        color="surface-2"
        :disabled="selectedCard === null"
        variant="flat"
        @click="moveToHand"
      >
        Resolve
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Global/BaseDialog.vue';
import CardListSortable from '@/components/GameView/CardListSortable.vue';

export default {
  name: 'ThreeDialog',
  components: {
    BaseDialog,
    CardListSortable,
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
    // list of card objects for available twos
    scrap: {
      type: Array,
      required: true,
    },
  },
  emits: ['resolveThree'],
  data() {
    return {
      choseToCounter: false,
      selectedCard: null,
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
    selectedIds() {
      const res = [];
      if (this.selectedCard) {
        res.push(this.selectedCard.id);
      }
      return res;
    },
  },
  methods: {
    moveToHand() {
      this.$emit('resolveThree', this.selectedCard.id);
      this.clearSelection();
    },
    selectCard(card) {
      if (this.selectedCard && card.id === this.selectedCard.id) {
        this.clearSelection();
      } else {
        this.selectedCard = card;
      }
    },
    clearSelection() {
      this.selectedCard = null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
