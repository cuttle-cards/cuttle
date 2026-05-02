<template>
  <BaseDialog
    id="discard-to-hand-limit-dialog"
    v-model="show"
    :title="t('game.dialogs.discardToHandLimit.title')"
    minimizable
  >
    <template #body>
      <p class="mb-4">
        {{ t('game.dialogs.discardToHandLimit.body') }}
      </p>
      <!-- Cards in hand -->
      <div class="d-flex flex-wrap card-container">
        <GameCard
          v-for="(card, index) in hand"
          :key="card.id"
          :suit="card.suit"
          :rank="card.rank"
          :data-discard-hand-limit-card="`${card.rank}-${card.suit}`"
          :class="{ 'is-selected': selectedIds.includes(card.id) }"
          @click="selectCard(index)"
        />
      </div>
    </template>
    <template #actions>
      <v-btn
        color="base-dark"
        variant="flat"
        data-cy="submit-discard-to-hand-limit-dialog"
        :disabled="!readyToDiscard"
        @click="discard"
      >
        {{ t('game.dialogs.discardToHandLimit.discard') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'DiscardToHandLimitDialog',
  components: {
    BaseDialog,
    GameCard,
  },
  props: {
    modelValue: {
      required: true,
      type: Boolean,
    },
  },
  emits: [ 'discard' ],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      selectedIds: [],
    };
  },
  computed: {
    ...mapStores(useGameStore),
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
    hand() {
      return this.gameStore.player.hand;
    },
    discardCount() {
      return Math.max(0, this.hand.length - 8);
    },
    readyToDiscard() {
      return this.selectedIds.length === this.discardCount;
    },
  },
  methods: {
    selectCard(handIndex) {
      const cardId = this.hand[handIndex].id;
      if (this.selectedIds.includes(cardId)) {
        this.selectedIds.splice(this.selectedIds.indexOf(cardId), 1);
      } else {
        this.selectedIds.push(cardId);
        if (this.selectedIds.length > this.discardCount) {
          this.selectedIds.splice(0, 1);
        }
      }
    },
    discard() {
      if (this.readyToDiscard) {
        this.$emit('discard', [ ...this.selectedIds ]);
        this.selectedIds = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.is-selected {
  border: 3px solid rgba(var(--v-theme-error));
}

.card-container {
  row-gap: 0.5rem;
}
</style>
