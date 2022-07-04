<template>
  <v-dialog v-model="show" max-width="750" scrollable>
    <template #activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <slot name="activator" />
      </span>
    </template>
    <v-card id="scrap-dialog">
      <v-card-title class="d-flex justify-space-between">
        <h1>Scrap Pile</h1>
        <v-btn icon data-cy="close-scrap-dialog-x" @click="show = false">
          <v-icon large> mdi-close </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div class="mt-4">
          <card-list-sortable
            :cards="scrap"
            empty-text="There are no cards in the scrap pile."
            data-selector-prefix="scrap-dialog"
          />
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end my-2">
        <v-btn color="primary" outlined data-cy="close-scrap-dialog-button" @click="show = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import CardListSortable from '@/components/GameView/CardListSortable.vue';

export default {
  name: 'ScrapDialog',
  components: {
    CardListSortable,
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
