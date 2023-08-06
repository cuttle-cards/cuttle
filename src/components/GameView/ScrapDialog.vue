<template>
  <v-dialog v-model="show" max-width="650" scrollable>
    <template #activator="{ props }">
      <span v-bind="props">
        <slot name="activator" />
      </span>
    </template>
  </v-dialog>
  <base-dialog 
    v-if="scrap" 
    v-model="show"
    title="Scrap Pile" 
    id="scrap-pile-dialog">
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
      <v-btn data-cy="close-scrap-dialog-button" color="surface-1" variant="flat" @click="show = false">
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
