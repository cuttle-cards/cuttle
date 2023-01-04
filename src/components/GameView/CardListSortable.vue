<template>
  <div class="mt-4">
    <div id="select-wrapper">
      <v-select
        id="scrap-sort-dropdown"
        v-model="sortByRank"
        :data-cy="`${dataSelectorPrefix}-sort-dropdown`"
        :items="sortOptions"
        :menu-props="{ contentClass: `${dataSelectorPrefix}-sort-menu` }"
        label="Sort"
        variant="outlined"
        hide-details
      />
    </div>
    <div class="d-flex flex-wrap justify-center align-center mb-4 mt-2">
      <!-- Empty Placeholder -->
      <template v-if="cards.length === 0">
        <div class="d-flex flex-column">
          <p>{{ emptyText }}</p>
          <v-icon icon="mdi-cancel" size="x-large" />
        </div>
      </template>
      <!-- Cards in the scrap -->
      <game-card
        v-for="card in sortedCards"
        :key="card.id"
        class="mx-1 my-1 sortable-list-card"
        :suit="card.suit"
        :rank="card.rank"
        v-bind="dataSelectorObject(card)"
        :is-selected="selectedIds.includes(card.id)"
        @click="$emit('click', card)"
      />
    </div>
  </div>
</template>

<script>
import GameCard from '@/components/GameView/GameCard.vue';
import { sortBy } from 'lodash';

export default {
  name: 'CardListSortable',
  components: {
    GameCard,
  },
  props: {
    cards: {
      type: Array,
      required: true,
    },
    emptyText: {
      type: String,
      default: 'No Cards Yet',
    },
    /**
     * Prefix used to identify where this card is in UI
     * Used to generate data-* selectors for e2e testing
     * @example 'scrap-dialog' for this prop
     * results in labeling cards like
     *     data-scrap-dialog-card="<suite>-<rank>"
     */
    dataSelectorPrefix: {
      type: String,
      default: '',
    },
    /**
     * List of ids of cards in list that are selected
     */
    selectedIds: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      sortByRank: true,
      sortOptions: [
        { text: 'Chronologically', value: false },
        { text: 'By Rank', value: true },
      ],
    };
  },
  computed: {
    sortedCards() {
      return this.sortByRank ? sortBy(this.cards, 'rank') : [...this.cards];
    },
    // Used to dynamically generate data-cy selectors for each card
    dataSelectorName() {
      return `data-${this.dataSelectorPrefix}-card`;
    },
  },
  methods: {
    /**
     * Format data selector for a specific card into object for v-bind
     * @example result: {'data-scrap-dialog-card': '1-3'}
     * ^^^ the ace of spades in the scrap dialog
     **/
    dataSelectorObject(card) {
      const res = {};
      res[this.dataSelectorName] = `${card.rank}-${card.suit}`;
      return res;
    },
  },
};
</script>

<style lang="scss" scoped>
.sortable-list-card {
  width: 9.5rem;
}

#select-wrapper {
  max-width: 300px;
}
</style>
