<template>
  <BaseDialog
    id="announcement-dialog"
    v-model="show"
    variant="light"
    :opacity="1"
    data-cy="announcement-dialog"
    scrollable
    :persistent="false"
    :max-width="750"
  >
    <template #activator>
      <v-btn
        color="newSecondary"
        rounded="0"
        block
      >
        {{ announcementData.activatorText }}
      </v-btn>
    </template>
    <template #title>
      <div color="primary" class="w-100">
        <div class="d-flex justify-center w-100">
          <h1 class="mb-4">
            {{ announcementData.title }}
          </h1>
        </div>
      </div>
    </template>
    <template #body>
      <div v-if="announcementData.displayCards.length" class="d-flex justify-center my-4">
        <GameCard
          v-for="card in announcementData.displayCards"
          :key="card.suit + card.rank"
          :suit="card.suit"
          :rank="card.rank"
          class="card mb-10"
          :high-elevation="true"
        />
      </div>
      <div v-if="announcementData.imgSrc" class="d-flex justify-center">
        <img class="w-50" :src="announcementData.imgSrc">
      </div>
      <div v-for="(text,i) in announcementData.announcementText" :key="i">  
        <h2 v-if="text.heading">
          {{ text.heading }}
        </h2>  
        <p> {{ text.paragraph }} </p>  
      </div>  
    </template>
    <template #actions>
      <v-btn
        data-cy="announcement-dialog-close"
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
import { announcementData } from '../../../data/announcementData';

const { t } = useI18n();
const show = ref(false);
const preferenceSaved= ref(false);

const close = () => {
  if (!preferenceSaved.value) {
    setLocalStorage('announcement', announcementData.id);
  }
  show.value = false;
  preferenceSaved.value = true;
};

onMounted(() => {
  if (getLocalStorage('announcement') !== announcementData.id) {
    show.value = true;
  }
});
</script>

<style scoped>
  .card:nth-child(n+2){
    margin-left: -9% !important;
  }


</style>
