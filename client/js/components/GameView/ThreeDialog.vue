<template>
  <v-dialog v-model="show" persistent max-width="750" scrollable>
    <v-card v-if="oneOff" id="three-dialog">
      <v-card-title>Select a Card from Scrap</v-card-title>
      <v-card-text>
        <div class="d-flex flex-wrap justify-center align-center my-8">
          <card-list-sortable
            :cards="scrap"
            data-selector-prefix="three-dialog"
            :selected-ids="selectedIds"
            @click="selectCard($event)"
          />
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          data-cy="three-resolve"
          color="primary"
          :disabled="selectedCard === null"
          outlined
          @click="moveToHand"
        >
          Resolve
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import CardListSortable from '@/components/GameView/CardListSortable.vue';

export default {
  name: 'ThreeDialog',
  components: {
    CardListSortable,
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
    // list of card objects for available twos
    scrap: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      choseToCounter: false,
      selectedCard: null,
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
