<template>
  <BaseDialog
    id="scrap-dialog"
    v-model="showDialog"
    :scrollable="true"
    :persistent="false"
    :attach="false"
  >
    <template #activator="{ props: dialogProps }">
      <span
        v-bind="dialogProps"
        @click="openDialog"
        @mousedown="isLongPressing = false"
        @touchstart="isLongPressing = false"
      >
        <div id="scrap" ref="scrap" class="d-flex flex-column align-center">
          <TransitionGroup :name="threesTransition">
            <GameCard
              v-for="(card, index) in scrapDisplay"
              :key="`scrap-card-${card.id}`"
              :suit="card.suit"
              :rank="card.rank"
              :custom-elevation="index > straightendIndex ? index : 0"
              :data-scrap-card="`${card.rank}-${card.suit}`"
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
                  class="d-flex flex-column justify-space-around align-center"
                  :class="xs ? 'rounded-sm' : 'rounded-lg'"
                  content-class="d-flex flex-column align-center"
                >
                  <h3 v-if="!xs" id="scrap-header">{{ $t('game.scrap') }}</h3>
                  <p id="scrap-length" class="text-surface-2 text-center mb-4 mt-1 ">({{ scrap.length }})</p>
                  <v-btn v-if="!xs" variant="outlined" color="surface-2">
                    {{ $t('game.view') }}
                  </v-btn>
                </v-overlay>
              </template>
            </GameCard>
          </TransitionGroup>
          <Transition name="scrap-empty">
            <div v-if="!scrap.length" id="empty-scrap-activator">
              <h3 v-if="!xs" id="scrap-header">{{ $t('game.scrap') }}</h3>
              <p class="text-surface-2 text-center mb-4 mt-1">({{ scrap.length }})</p>
              <v-btn v-if="!xs" variant="outlined" color="surface-2">
                {{ $t('game.view') }}
              </v-btn>
            </div>
          </Transition>
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
          @click="showDialog = false"
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
        @click="showDialog = false"
      >
        {{ t('global.close') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, computed, useTemplateRef } from 'vue';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { onLongPress } from '@vueuse/core';
import { useGameStore } from '_/src/stores/game';
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
const { xs } = useDisplay();
const gameStore = useGameStore();

// Dialog
const showDialog = ref(false);

// Displayed Pile
const scrapDisplay = computed(() => props.scrap.slice(-10));
const threesTransition = computed(() => gameStore.lastEventPlayerChoosing ? `threes-player` : `threes-opponent`);

// Tidying + messing up pile
const scrapWrapper = useTemplateRef('scrap');
const lastStraightenedCardId = ref(null);
const straightendIndex = computed(
  () => scrapDisplay.value.findIndex(card => card.id === lastStraightenedCardId.value)
);
const isLongPressing = ref(false);

// Straighten pile on long press; prevent opening dialog
onLongPress(scrapWrapper, () => {
  isLongPressing.value = true;
  const topScrapCardId = props.scrap[props.scrap.length -1].id;
  if (lastStraightenedCardId.value === topScrapCardId) {
    lastStraightenedCardId.value = null;
  } else {
    lastStraightenedCardId.value = topScrapCardId;
  }
}, {
  stop: true
});

// Prevent dialog on long press
function openDialog(e) {
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
    transition: all 0.3 ease-in-out; // for tidying/messing up pile
    cursor: pointer;
    
    & #scrap-header {
      font-family: 'Luckiest Guy';
      color: rgba(var(--v-theme-surface-2));
      text-align: center;
      font-size: 40px;
      line-height: 40px;
    }

    & #scrap-length {
      font-family: 'Luckiest Guy';
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

    // Psuedo-random rotation+translation of cards in the pile
    @for $i from 0 through 10 {
      & .scrap-card-#{$i} {
        $rotation: sin($i * 30) * 8deg; /* sin(degrees) returns -1 to 1 */
        $translateX: cos($i * 45) * 8px; /* cos(degrees) returns -1 to 1 */
        $translateY: sin($i * 60) * 5px;

        transform: translate($translateX, $translateY) rotate($rotation);
      }
    }
}

///////////////////////////////
// Entering Scrap Transition //
///////////////////////////////
#scrap .scrap-card.threes-player-enter-active,
#scrap .scrap-card.threes-opponent-enter-active {
  transition: all .8s ease-out;
}

#scrap .scrap-card.threes-player-enter-from,
#scrap .scrap-card.threes-opponent-enter-from {
  opacity: 0;
  transform: rotate(0deg) translateX(100px);
}

//////////////////////////////
// Leaving Scrap Transition //
//////////////////////////////
#scrap .scrap-card.threes-player-leave-active,
#scrap .scrap-card.threes-opponent-leave-active {
  transition: all 1.2s ease-out;
}

// Leaving towards player hand
#scrap .scrap-card.threes-player-leave-to {
  opacity: 0;
  transform: translate(200px, 50px);
}

// Leaving towards opponent hand
#scrap .scrap-card.threes-opponent-leave-to {
  opacity: 0;
  transform: translate(200px, -200px);
}
////////////////////////////////////////
// Empty Pile dissapearing transition //
////////////////////////////////////////
#scrap .scrap-empty-enter-active,
#scrap .scrap-empty-leave-active {
  transition: all .5s ease-in;
}

#scrap .scrap-empty-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  #scrap {
    height: 13vh;
    width: calc(13vh / 1.3);
  }

  #scrap .scrap-card.threes-player-leave-to {
    opacity: 0;
    transform: translateY(200px);
  }
  
  #scrap .scrap-card.threes-opponent-leave-to {
    transform: translateY(-200px);
    opacity: 0;
  }

#scrap .scrap-card.threes-player-enter-from,
#scrap .scrap-card.threes-opponent-enter-from {
  transform: translateY(-200px);
  opacity: 0;
}
}
</style>
