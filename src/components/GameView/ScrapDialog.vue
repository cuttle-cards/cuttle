<template>
  <base-dialog
    id="scrap-dialog"
    v-model="show"
    scrollable="true"
    :persistent="false"
  >
    <template #activator="{ props }">
      <span v-bind="props">
        <slot name="activator" />
      </span>
    </template>
    <template #title>
      <div class="d-flex justify-space-between align-center w-100">
        <h1>Scrap Pile</h1>
        <v-btn 
          icon
          color="surface-1"
          elevation="0"
          data-cy="close-scrap-dialog-x" 
          @click="show = false"
        >
          <v-icon
            icon="mdi-close"
            size="large" 
            aria-label="close icon"
            aria-hidden="false"
            role="img"           
          />
        </v-btn>
      </div>
    </template>
    <template #body>
      <div class="mt-4">
        <card-list-sortable
          :cards="scrap"
          empty-text="There are no cards in the scrap pile."
          data-selector-prefix="scrap-dialog"
        />
      </div>
    </template>
    <template #actions>
      <v-btn
        data-cy="close-scrap-dialog-button"
        color="surface-1"
        variant="flat"
        @click="show = false"
      >
        Close
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import CardListSortable from '@/components/GameView/CardListSortable.vue';
import BaseDialog from '@/components/Global/BaseDialog.vue';

export default {
  name: 'ScrapDialog',
  components: {
    CardListSortable,
    BaseDialog,
  },
  props: {
    scrap: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      show: false,
    };
  },
};
</script>

<style lang="scss" scoped></style>