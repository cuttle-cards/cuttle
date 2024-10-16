<template>
  <BaseDialog
    id="seven-double-jacks-dialog"
    v-model="show"
    :title="t('game.dialogs.sevenDoubleJacksDialog.title')"
  >
    <template #body>
      <span>{{ t('game.dialogs.sevenDoubleJacksDialog.cannotMove') }}</span>
      <div class="d-flex flex-wrap justify-center align-center my-8">
        <template v-if="topCard">
          <GameCard
            class="mx-4 my-1"
            :suit="topCard.suit"
            :rank="topCard.rank"
            :is-selected="selectedJack && topCard.id === selectedJack.id"
            :data-seven-double-jacks-dialog-card="`${topCard.rank}-${topCard.suit}`"
            @click="selectCard(topCard.id)"
          />
        </template>
        <template v-if="secondCard">
          <GameCard
            class="mx-4 my-1"
            :suit="secondCard.suit"
            :rank="secondCard.rank"
            :is-selected="selectedJack && secondCard.id === selectedJack.id"
            :data-seven-double-jacks-dialog-card="`${secondCard.rank}-${secondCard.suit}`"
            @click="selectCard(secondCard.id)"
          />
        </template>
      </div>
    </template>

    <template #actions>
      <v-btn
        data-cy="seven-double-jacks-resolve"
        :disabled="selectedJack === null"
        color="surface-2"
        variant="flat"
        @click="moveToScrap"
      >
        {{ t('game.dialogs.sevenDoubleJacksDialog.resolve') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

export default {
  name: 'SevenDoubleJacksDialog',
  components: {
    BaseDialog,
    GameCard,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    topCard: {
      type: Object,
      default: null,
    },
    secondCard: {
      type: Object,
      default: null,
    },
  },
  emits: [ 'resolveSevenDoubleJacks' ],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      selectedCardId: null,
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
    selectedJack() {
      if (this.selectedCardId === null) {
        return null;
      }
      return this.selectedCardId === this.topCard.id ? this.topCard : this.secondCard;
    },
  },
  methods: {
    moveToScrap() {
      const index = this.selectedJack.id === this.topCard.id ? 0 : 1;
      const card = this.selectedJack;
      this.$emit('resolveSevenDoubleJacks', {
        cardId: card.id,
        index,
      });
      this.clearSelection();
    },
    selectCard(cardId) {
      if (cardId === this.selectedCardId) {
        this.clearSelection();
      } else {
        this.selectedCardId = cardId;
      }
    },
    clearSelection() {
      this.selectedCardId = null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
