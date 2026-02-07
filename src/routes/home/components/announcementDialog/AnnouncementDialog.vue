<template>
  <BaseDialog
    v-if="announcementIsActive"
    id="announcement-dialog"
    v-model="show"
    variant="dark"
    :opacity="1"
    data-cy="announcement-dialog"
    scrollable
    :persistent="false"
    :max-width="750"
    :title="t(announcementData.title)"
  >
    <template #activator>
      <v-btn
        color="casual"
        rounded="0"
        block
      >
        {{ t(announcementData.activatorText) }}
      </v-btn>
    </template>
    <template #body>
      <div v-if="announcementData.displayCards.length" class="cards d-flex justify-center my-4">
        <GameCard
          v-for="card in announcementData.displayCards"
          :key="card.suit + card.rank"
          :suit="card.suit"
          :rank="card.rank"
          class="card mb-10"
          :high-elevation="true"
        />
      </div>
      <div v-if="announcementData.imgSrc" class="d-flex justify-center mb-4 bg-game-card rounded">
        <img class="w-75 mb-4" :src="announcementData.imgSrc">
      </div>
      <div v-for="(text, i) in announcementData.announcementText" :key="i" class="mb-4">
        <BaseParagraph :heading="text.heading" :paragraph="text.paragraph" />
      </div>  
    </template>
    <template #actions>
      <v-btn
        data-cy="announcement-dialog-close"
        color="game-board"
        variant="flat"
        @click="close"
      >
        {{ t('global.close') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { getLocalStorage, setLocalStorage } from '_/utils/local-storage-utils.js';
import { announcementData } from './data/announcementData';
import BaseDialog from '@/components/BaseDialog.vue';
import BaseParagraph from '@/components/BaseParagraph.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

const { t } = useI18n();
const show = ref(false);
const preferenceSaved= ref(false);

const announcementIsActive = computed(() => {
  const isAfterStartTime = announcementData.startTime ? dayjs().isAfter(dayjs(announcementData.startTime)) : true;
  const isBeforeEndTime = announcementData.endTime ? dayjs().isBefore(dayjs(announcementData.endTime)) : true;

  return isAfterStartTime && isBeforeEndTime;
});

const close = () => {
  if (!preferenceSaved.value) {
    setLocalStorage('announcement', announcementData.id);
  }
  show.value = false;
  preferenceSaved.value = true;
};

if (getLocalStorage('announcement') !== announcementData.id) {
  show.value = true;
}
</script>

<style scoped>
.card:nth-child(n+2){
  margin-left: -9% !important;
}

:deep(.player-card) {
    max-height: inherit;
  }
</style>
