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
      <div v-if="announcementData.imgSrc" class="d-flex justify-center mb-4 bg-base-light rounded">
        <!-- Links out to the full bracket when the announcement supplies a url -->
        <a
          v-if="announcementData.imgHref"
          :href="announcementData.imgHref"
          target="_blank"
          class="d-block w-75 mb-4"
        >
          <img class="w-100" :src="announcementData.imgSrc" :alt="t(announcementData.title)">
        </a>
        <img
          v-else
          class="w-75 mb-4"
          :src="announcementData.imgSrc"
          :alt="t(announcementData.title)"
        >
      </div>
      <div v-for="(text, i) in announcementData.announcementText" :key="i" class="mb-4">
        <BaseParagraph :heading="text.heading" :paragraph="text.paragraph" />
      </div>  
    </template>
    <template #actions>
      <v-btn
        data-cy="announcement-dialog-close"
        color="base-dark"
        variant="flat"
        @click="close"
      >
        {{ t('global.close') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { getLocalStorage, setLocalStorage, LS_ANNOUNCEMENT } from '_/utils/local-storage-utils.js';
import { isAnnouncementActive } from '@/util/announcement';
import { useAuthStore } from '@/stores/auth';
import BaseDialog from '@/components/BaseDialog.vue';
import BaseParagraph from '@/components/BaseParagraph.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

const props = defineProps({
  // The announcement to show; see ./data/announcementData.js for its shape
  announcement: {
    type: Object,
    required: true,
  },
});

const announcementData = toRef(props, 'announcement');

const { t } = useI18n();
const authStore = useAuthStore();
const show = ref(false);
const preferenceSaved= ref(false);

const announcementIsActive = computed(() =>
  isAnnouncementActive(announcementData.value, { userId: authStore.userId }),
);

const close = () => {
  if (!preferenceSaved.value) {
    setLocalStorage(LS_ANNOUNCEMENT, announcementData.value.id);
  }
  show.value = false;
  preferenceSaved.value = true;
};

if (getLocalStorage(LS_ANNOUNCEMENT) !== announcementData.value.id) {
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
