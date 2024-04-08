<template>
  <BaseDialog
    id="cta-banner"
    v-model="show"
    variant="light"
    :opacity="1"
    data-cy="create-game-dialog"
    scrollable
  >
    <template #activator>
      <v-btn
        color="newSecondary"
        width="full"
        rounded="0"
        block
      >
        {{ t('callToAction.betaTestTitle') }}
        <span class="d-none d-sm-block ml-1">{{ t('callToAction.betaTestAddition') }}</span>
      </v-btn>
    </template>
    <template #title>
      <div color="primary">
        <h1 class="mb-4">
          {{ t('callToAction.revisedFives') }}
          <span class="d-none d-sm-inline">({{ t('callToAction.revisedFivesAddition') }})</span> 
        </h1>
        <p>
          {{ t('callToAction.testDates') }} 8-20 <span
            class="
            beta
            ml-2"
          >{{ t('callToAction.betaTest') }}</span>
        </p>
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
      <h2>{{ t('callToAction.ruleInfoHeader') }}</h2>
      <p><strong class="text-newPrimary">{{ t('callToAction.ruleInfo') }}</strong></p>
      <h3>{{ t('callToAction.whyImplementHeader') }}</h3>
      <p>
        {{ t('callToAction.whyImplement') }}
      </p>
      <h3>
        {{ t('callToAction.howLongHeader') }}
      </h3>
      <p>
        <strong class="text-newPrimary">{{ t('callToAction.howLongPt1') }}</strong>{{ t('callToAction.howLongPt2') }}
        <a href="https://forms.gle/9bK7pP3mTN4SWwwG7">{{ t('callToAction.here') }}.</a>
      </p>
      <h3>{{ t('callToAction.optedInHeader') }}</h3>
      <p>
        {{ t('callToAction.optedIn') }}
      </p>
      <h3>{{ t('callToAction.gameModesHeader') }}</h3>
      <p>
        {{ t('callToAction.gameModes') }}
      </p>
      <h3>{{ t('callToAction.learnMoreHeader') }}</h3>
      <p>
        {{ t('callToAction.learnMore') }}
      </p>
    </template>
    <template #actions>
      <v-btn
        data-cy="cta-banner-okay"
        color="surface-1"
        variant="flat"
        class="text-surface-2"
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
    setLocalStorage('bannerDismissed', true);
  }
  show.value = false;
  preferenceSaved.value = true;
};

onMounted(() => {
  if (!getLocalStorage('bannerDismissed')) {
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

  .beta{
    padding: 2px 10px;
    background-color:#FFCCE0;
    color: #E1306C;
    border-radius: 35px;
  }
</style>