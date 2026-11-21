<template>
  <BaseDialog
    id="seven-double-jacks-dialog"
    v-model="show"
    :title="t('game.dialogs.sevenDoubleJacksDialog.title')"
    minimizable
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
        color="base-light"
        variant="flat"
        @click="moveToScrap"
      >
        {{ t('game.dialogs.sevenDoubleJacksDialog.resolve') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';
import { useSelectCards } from '@/composables/useSelectCards';

defineOptions({ name: 'SevenDoubleJacksDialog' });

const props = defineProps({
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
});
const emit = defineEmits([ 'resolveSevenDoubleJacks' ]);
const { t } = useI18n();

const {
  selectedIds,
  ready,
  selectCard,
  clear,
} = useSelectCards(1);

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    // do nothing - parent controls whether dialog is open
  },
});
const selectedJack = computed(() => {
  if (!ready.value) {
    return null;
  }
  return selectedIds.value[0] === props.topCard.id ? props.topCard : props.secondCard;
});

function moveToScrap() {
  const index = selectedJack.value.id === props.topCard.id ? 0 : 1;
  const card = selectedJack.value;
  emit('resolveSevenDoubleJacks', {
    cardId: card.id,
    index,
  });
  clear();
}
</script>

<style lang="scss" scoped></style>
