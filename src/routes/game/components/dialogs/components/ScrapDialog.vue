<template>
  <BaseDialog
    id="scrap-dialog"
    v-model="show"
    :scrollable="true"
    :persistent="false"
  >
    <template #activator="{ props }">
      <span v-bind="props">
        <slot name="activator" />
      </span>
    </template>
    <template #title>
      <div class="d-flex justify-space-between align-center w-100">
        <h1>{{ t('game.dialogs.scrapDialog.scrapPile') }}</h1>
        <v-btn 
          icon
          color="surface-2"
          variant="text"
          data-cy="close-scrap-dialog-x"
          aria-label="Close scrap dialog" 
          @click="show = false"
        >
          <v-icon
            icon="mdi-close"
            size="large" 
            aria-hidden="true"          
          />
        </v-btn>
      </div>
    </template>
    <template #body>
      <div class="mt-4">
        <CardListSortable
          :cards="scrap"
          :empty-text="t('game.dialogs.scrapDialog.noCards')"
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
        {{ t('global.close') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { useI18n } from 'vue-i18n';
import CardListSortable from '@/routes/game/components/CardListSortable.vue';
import BaseDialog from '@/components/BaseDialog.vue';

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
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      show: false,
    };
  },
};
</script>

<style lang="scss" scoped></style>
