const value = 1;
 
<template>
  <BaseDialog
    id="announcement-dialog"
    v-model="show"
    variant="light"
    :opacity="1"
    data-cy="announcement-dialog"
    scrollable
    :max-width="750"
  >
    <template #activator>
      <v-btn
        color="newSecondary"
        width="full"
        rounded="0"
        block
      >
        Announcement Header
      </v-btn>
    </template>
    <template #title>
      <div color="primary" class="w-100">
        <div class="d-flex justify-space-between w-100">
          <h1 class="mb-4">
            Generic Header
          </h1>
          <v-btn
            variant="text"
            icon
            size="x-large"
            @click="close"
          >
            <v-icon icon="mdi-close" />
          </v-btn>
        </div>
      </div>
    </template>
    <template #body>
      <div class="d-flex justify-center my-4">
        <GameCard
          v-for="card in displayCards"
          :key="card.suit + card.rank"
          :suit="card.suit"
          :rank="card.rank"
          class="card mb-10"
          :high-elevation="true"
        />
      </div>
      <p>Generic Announcement</p>
    </template>
    <template #actions>
      <v-btn
        data-cy="annoucement-dialog-okay"
        color="surface-1"
        variant="flat"
        @click="close"
      >
        {{ t('global.close') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from '@/components/BaseDialog.vue';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import GameCard from '@/routes/game/components/GameCard.vue';
import { getLocalStorage, setLocalStorage } from '_/utils/local-storage-utils.js';

const { t } = useI18n();
const displayCards = [{suit: 0, rank:5},{suit: 1, rank:4},{suit: 2, rank:10},{suit: 3, rank:2},];
const show = ref(false);
const preferenceSaved= ref(false);

const close = () => {
  if (!preferenceSaved.value) {
    setLocalStorage('announcement', 1);
  }
  show.value = false;
  preferenceSaved.value = true;
};

onMounted(() => {
  if (!getLocalStorage('announcement') === 1) {
    show.value = true;
  }
});
</script>

<style scoped>
  .card:nth-child(n+2){
    margin-left: -9% !important;
  }

  p:nth-child(n+3){
    margin-bottom: 3%;
  }

</style>
