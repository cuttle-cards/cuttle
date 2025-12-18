<template>
  <BaseDialog
    v-if="oneOff"
    id="three-dialog"
    v-model="show"
    scrollable
  >
    <template v-if="isMinimized" #activator>
      <v-fab
        color="primary"
        variant="flat"
        absolute
        location="center center"
        size="large"
        transition="scale-transition"
        data-cy="three-dialog-activator"
        @click="isMinimized = false"
      >
        {{ t('game.dialogs.threeDialog.title') }}
      </v-fab>
    </template>
    <template #title>
      <div class="d-flex justify-space-between align-center w-100">
        <h1>{{ t('game.dialogs.threeDialog.title') }}</h1>
        <v-btn
          icon="mdi-window-minimize"
          color="surface-2"
          variant="text"
          data-cy="close-three-dialog-x"
          aria-label="Close three dialog"
          @click="minimizeDialog"
        />
      </div>
    </template>
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
        {{ t('game.resolve') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import CardListSortable from '@/routes/game/components/CardListSortable.vue';

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
  emits: [ 'resolveThree' ],
  setup(props, { emit }) {
    const { t } = useI18n();
    const isMinimized = ref(false);
    const selectedCard = ref(null);

    // Dialog shows only when modelValue is true AND isMinimized is false
    const show = computed({
      get() {
        return props.modelValue && !isMinimized.value;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    });

    // Reset isMinimized when modelValue becomes true (dialog reopened via activator)
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        isMinimized.value = false;
      }
    });

    const minimizeDialog = () => {
      isMinimized.value = true;
    };

    const selectedIds = computed(() => {
      const res = [];
      if (selectedCard.value) {
        res.push(selectedCard.value.id);
      }
      return res;
    });

    const moveToHand = () => {
      emit('resolveThree', selectedCard.value.id);
      clearSelection();
    };

    const selectCard = (card) => {
      if (selectedCard.value && card.id === selectedCard.value.id) {
        clearSelection();
      } else {
        selectedCard.value = card;
      }
    };

    const clearSelection = () => {
      selectedCard.value = null;
    };

    return {
      t,
      show,
      isMinimized,
      selectedCard,
      selectedIds,
      minimizeDialog,
      moveToHand,
      selectCard,
      clearSelection,
    };
  },
};
</script>

<style lang="scss" scoped></style>
