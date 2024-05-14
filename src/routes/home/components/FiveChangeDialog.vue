<template>
  <BaseDialog
    id="five-change-dialog"
    v-model="show"
    variant="light"
    :opacity="1"
    data-cy="five-change-dialog"
    scrollable
  >
    <template #activator>
      <v-btn
        color="newSecondary"
        width="full"
        rounded="0"
        block
      >
        {{ t('fiveChange.revisedFives') }}
        {{ t('fiveChange.revisedFivesAddition') }}
      </v-btn>
    </template>
    <template #title>
      <div color="primary" class="w-100">
        <div class="d-flex justify-space-between w-100">
          <h1 class="mb-4">
            {{ t('fiveChange.revisedFives') }}
            <span class="d-none d-sm-inline">({{ t('fiveChange.revisedFivesAddition') }})</span>
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
          v-for="card in fiveCards"
          :key="card.suit + card.rank"
          :suit="card.suit"
          :rank="card.rank"
          class="card mb-10"
          :high-elevation="true"
        />
      </div>

      <h2>{{ t('fiveChange.ruleInfoHeader') }}</h2>
      <p><strong class="text-newPrimary">{{ t('fiveChange.ruleInfo') }}</strong></p>


      <h3>{{ t('fiveChange.howLongHeader') }}</h3>
      <p>
        <strong class="text-newPrimary">
          {{ t('fiveChange.howLong') }}
        </strong>
        {{ t('fiveChange.howLong2') }}
      </p>


      <h3>{{ t('fiveChange.whyImplementHeader') }}</h3>
      <p>
        {{ t('fiveChange.whyImplement') }}
      </p>

      <h3>{{ t('fiveChange.previousBetaHeader') }}</h3>
      <p>{{ t('fiveChange.previousBeta') }}</p>

      <h3>{{ t('fiveChange.gameModesHeader') }}</h3>
      <p>
        {{ t('fiveChange.gameModes') }}
      </p>

      <h3>{{ t('fiveChange.learnMoreHeader') }}</h3>
      <p>
        {{ t('fiveChange.learnMore1') }}
        <a href="https://discord.gg/wK57MMu9GR" class="text-newSecondary">discord,</a>
        {{ t('fiveChange.learnMore2') }}
      </p>
    </template>
    <template #actions>
      <v-btn
        data-cy="five-change-dialog-okay"
        color="surface-1"
        variant="flat"
        @click="close"
      >
        close
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from '@/components/BaseDialog.vue';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import GameCard from '@/routes/game/components/GameCard.vue';
import { getLocalStorage, setLocalStorage} from '_/utils/local-storage-utils.js';

const { t } = useI18n();
const fiveCards = [{suit: 0, rank:5},{suit: 1, rank:5},{suit: 2, rank:5},{suit: 3, rank:5},];
const show = ref(false);
const preferenceSaved= ref(false);

const close = () => {
  if (!preferenceSaved.value) {
    setLocalStorage('fiveChangeBannerDismissed', true);
  }
  show.value = false;
  preferenceSaved.value = true;
};

onMounted(() => {
  if (!getLocalStorage('fiveChangeBannerDismissed')) {
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
