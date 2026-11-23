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
          @select-card="(card) => selectCard(card.id)"
        />
      </div>
    </template>

    <template #actions>
      <v-btn
        data-cy="three-resolve"
        color="base-light"
        :disabled="!ready"
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
import { useSelectCards } from '@/composables/useSelectCards';

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
const scrapWithoutThrees = computed(() => props.scrap.filter((card) => card.rank !== 3));

function moveToHand() {
  emit('resolveThree', selectedIds.value[0]);
  clear();
}
</script>

<style lang="scss" scoped></style>
