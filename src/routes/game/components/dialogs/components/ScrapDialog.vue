<template>
  <BaseDialog
    id="scrap-dialog"
    v-model="show"
    :scrollable="true"
    :persistent="false"
    :attach="false"
  >
    <template #activator="{ props }">
      <span
        v-bind="props"
        @click="onActivatorClick"
        @mousedown="isLongPressing = false"
        @touchstart="isLongPressing = false"
      >
        <slot name="activator" />
        <div id="scrap" ref="scrap" class="d-flex flex-column align-center">
          <!-- <Transition :name="threesTransition">
                  <GameCard
                    v-if="showScrapChoice"
                    :suit="gameStore.lastEventCardChosen.suit"
                    :rank="gameStore.lastEventCardChosen.rank"
                    class="gameCard"
                    data-cy="scrap-chosen-card"
                  />
                </Transition>  -->
          <GameCard
            v-for="(card, index) in scrapDisplay"
            :key="`scrap-card-${card.id}`"
            :suit="card.suit"
            :rank="card.rank"
            :custom-elevation="index > straightendIndex ? index : 0"
            data-cy="scrap-card"
            class="position-absolute scrap-card"
            :class="index > straightendIndex ? `scrap-card-${index % 10}` : ''"
          >
            <template v-if="index === scrapDisplay.length - 1" #overlay>
              <v-overlay
                :model-value="true"
                contained
                persistent
                scrim="surface-1"
                opacity=".46"
                class="d-flex flex-column justify-space-around align-center rounded-lg"
              >
                <h3 id="scrap-header">{{ $t('game.scrap') }}</h3>
                <p class="text-surface-2 text-center mb-4 mt-1">({{ scrap.length }})</p>
                <v-btn variant="outlined" color="surface-2">
                  View Scrap
                </v-btn>
              </v-overlay>
            </template>
          </GameCard>
          <div v-if="!scrap.length" id="empty-scrap-activator">
            <h3 id="scrap-header">{{ $t('game.scrap') }}</h3>
            <p class="text-surface-2 text-center mb-4 mt-1">({{ scrap.length }})</p>
            <v-btn variant="outlined" color="surface-2">
              View Scrap
            </v-btn>
          </div>
        </div>
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

<script setup>
import { ref, computed, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { onLongPress } from '@vueuse/core';
import CardListSortable from '@/routes/game/components/CardListSortable.vue';
import BaseDialog from '@/components/BaseDialog.vue';
import GameCard from '@/routes/game/components/GameCard.vue';

const props = defineProps({
  scrap: {
    type: Array,
    required: true,
  },
});

const { t } = useI18n();

const show = ref(false);
const lastStraightenedCardId = ref(null);
const scrapWrapper = useTemplateRef('scrap');
const isLongPressing = ref(false);

const scrapDisplay = computed(() => props.scrap.slice(-10));
const straightendIndex = computed(() => scrapDisplay.value.map(card => card.id).indexOf(lastStraightenedCardId.value));

// Straighten pile on long press; prevent opening dialog
onLongPress(scrapWrapper, () => {
  isLongPressing.value = true;
  lastStraightenedCardId.value = props.scrap[props.scrap.length -1].id;
}, {
  stop: true
});

// Prevent dialog on long press
function onActivatorClick(e) {
  if (isLongPressing.value) {
    e.preventDefault();
    e.stopPropagation();
    isLongPressing.value = false;
    return;
  }
  // Allow normal click
};
</script>

<style lang="scss" scoped>
#scrap {
    position: relative;
    margin: 10px;
    height: 29vh;
    width: calc(29vh / 1.3);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 0.3 ease-in-out;
    cursor: pointer;

    & #scrap-header {
      font-family: 'Luckiest Guy';
      color: rgba(var(--v-theme-surface-2));
      text-align: center;
      font-size: 40px;
      line-height: 40px;
    }

    & #empty-scrap-activator {
      height: 100%;
      width: 100%;
      background-color: rgba(var(--v-theme-surface-1), .46);
      padding: 16px;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
    }

    & .scrap-card {
      transition: transform .3s ease-in;
    }

    @for $i from 0 through 10 {
      & .scrap-card-#{$i} {
        $rotation: sin($i * 30) * 8deg; /* sin(degrees) returns -1 to 1 */
        $translateX: cos($i * 45) * 8px; /* cos(degrees) returns -1 to 1 */
        $translateY: sin($i * 60) * 5px;

        transform: translate($translateX, $translateY) rotate($rotation);
      }
    }
}

@media (max-width: 600px) {
  #scrap {
      height: 13vh;
      width: calc(13vh / 1.3);
    }
}
</style>
