<template>
  <BaseDialog
    v-if="oneOff"
    id="three-dialog"
    v-model="show"
    :title="t('game.dialogs.threeDialog.title')"
    scrollable
    minimizable
  >
    <template #body>
      <div class="d-flex flex-wrap justify-center align-center my-8">
        <CardListSortable
          :cards="scrapWithoutThrees"
          data-selector-prefix="three-dialog"
          :selected-ids="selectedIds"
          @select-card="selectCard"
        />
      </div>
    </template>

    <template #actions>
      <v-btn
        data-cy="three-resolve"
        color="base-light"
        :disabled="selectedCard === null"
        variant="flat"
        @click="moveToHand"
      >
        {{ t('game.resolve') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import CardListSortable from '@/routes/game/components/CardListSortable.vue';

defineOptions({ name: 'ThreeDialog' });

const props = defineProps({
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
});
const emit = defineEmits([ 'resolveThree' ]);
const { t } = useI18n();

// eslint-disable-next-line no-unused-vars -- Preserve the existing inactive state.
const choseToCounter = ref(false);
const selectedCard = ref(null);

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    // do nothing - parent controls whether dialog is open
  },
});
const scrapWithoutThrees = computed(() => props.scrap.filter((card) => card.rank !== 3));
const selectedIds = computed(() => {
  const res = [];
  if (selectedCard.value) {
    res.push(selectedCard.value.id);
  }
  return res;
});

function moveToHand() {
  emit('resolveThree', selectedCard.value.id);
  clearSelection();
}

function selectCard(card) {
  if (selectedCard.value && card.id === selectedCard.value.id) {
    clearSelection();
  } else {
    selectedCard.value = card;
  }
}

function clearSelection() {
  selectedCard.value = null;
}
</script>

<style lang="scss" scoped></style>
