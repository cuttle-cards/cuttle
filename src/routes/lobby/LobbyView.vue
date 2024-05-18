<template>
  <div id="lobby-wrapper">
    <div class="langauge-selector">
      <TheLanguageSelector variant="light" />
    </div>
    <v-container>
      <div class="d-flex align-center">
        <h1>{{ t('lobby.lobbyFor') }}</h1>
      </div>
      <h5>{{ gameName }}</h5>
      <v-row>
        <v-col md="4" cols="12">
          <PlayerReadyIndicator
            :player-username="authStore.username"
            :player-ready="iAmReady"
            :game-started="gameStarted"
            data-cy="my-indicator"
          />
        </v-col>
        <v-col md="4" cols="12" class="d-flex align-center justify-center">
          <img src="/img/logo-stalemate.svg" class="vs-logo" alt="stalemate logo">
        </v-col>
        <v-col md="4" cols="12">
          <PlayerReadyIndicator
            :player-username="gameStore.opponentUsername"
            :player-ready="gameStore.opponentIsReady"
            :game-started="gameStarted"
            data-cy="opponent-indicator"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col class="home-card-games" :cols="$vuetify.display.mdAndUp ? 8 : 12">
          <div class="mx-auto my-4 my-xl-2 homeContent">
            <v-btn
              class="px-16 w-100"
              color="newPrimary"
              size="x-large"
              text-color="white"
              data-cy="ready-button"
              @click="ready"
            >
              {{ readyButtonText }}
              <v-icon
                class="ml-1"
                size="small"
                :icon="`mdi-${rankedIcon}`"
                :data-cy="`ready-button-${rankedIcon}-icon`"
              />
            </v-btn>
            <div class="d-flex flex-row justify-md-space-between justify-space-evenly align-center flex-wrap my-4">
              <div class="rank-switch">
                <v-switch
                  v-model="gameStore.isRanked"
                  variant="outlined"
                  class="mx-md-4 pl-2 flex-shrink-0"
                  :label="gameStore.isRanked ? t('global.ranked') : t('global.casual')"
                  data-cy="edit-game-ranked-switch"
                  color="primary"
                  hide-details
                  @update:model-value="setIsRanked"
                />
                <v-icon
                  class="mr-2 mr-md-4"
                  size="medium"
                  :icon="`mdi-${rankedIcon}`"
                  aria-hidden="true"
                />
              </div>
              <v-btn
                :disabled="readying"
                variant="text"
                class="w-50 px-16 py-2"
                color="surface-2"
                data-cy="exit-button"
                size="x-large"
                @click="leave"
              >
                {{ t('lobby.exit') }}
              </v-btn>
            </div>
          </div>
        </v-col>
        <v-spacer />
      </v-row>
    </v-container>
    <BaseSnackbar
      v-model="gameStore.showIsRankedChangedAlert"
      :timeout="2000"
      :message="`${t('lobby.rankedChangedAlert')} ${gameStore.isRanked ? t('global.ranked') : t('global.casual')
      }`"
      color="surface-1"
      data-cy="edit-snackbar"
      @clear="gameStore.showIsRankedChangedAlert = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import { playAudio } from '@/util/audio.js';
import PlayerReadyIndicator from '@/components/PlayerReadyIndicator.vue';
import BaseSnackbar from '@/components/BaseSnackbar.vue';
import TheLanguageSelector from '@/components/TheLanguageSelector.vue';

// Deps
const { t } = useI18n();
const router = useRouter();

// Audio
const joinAudio = new Audio('/sounds/lobby/enter-lobby.mp3');
const leaveAudio = new Audio('/sounds/lobby/leave-lobby.mp3');

// Stores
const authStore = useAuthStore();
const gameStore = useGameStore();

// Refs
const readying = ref(false);
const gameStarted = ref(false);

// Computed Props
const gameName = computed(() => gameStore.name);

const iAmReady = computed(() => {
  return gameStore.myPNum === 0 ? gameStore.p0Ready : gameStore.p1Ready;
});

const readyButtonText = computed(() => t(iAmReady.value ? 'lobby.unready' : 'lobby.ready'));

const rankedIcon = computed(() => gameStore.isRanked ? 'sword-cross' : 'coffee');

const opponentUsername = computed(() => gameStore.opponentUsername);

// Methods
async function ready() {
  readying.value = true;
  await gameStore.requestReady();
  readying.value = false;
}

async function setIsRanked() {
  await gameStore.requestSetIsRanked({
    isRanked: gameStore.isRanked,
  });
}

async function leave() {
  await gameStore.requestLeaveLobby();
  router.push('/');
}

// Watchers
watch(opponentUsername, (newVal) => {
  if (newVal) {
    playAudio(joinAudio);
  } else {
    playAudio(leaveAudio);
  }
});

// Lifecycle
onMounted(() => {
  playAudio(joinAudio);
});

// Router
onBeforeRouteLeave((to, from, next) => {
  if (to.name === 'Game') {
    gameStarted.value = true;
    playAudio(joinAudio);
    setTimeout(() => {
      next();
    }, 2000);
  } else {
    playAudio(leaveAudio);
    next();
  }
});
</script>

<style scoped lang="scss">
.langauge-selector {
  position: absolute;
  right: 0;
  top: 20px;
  width: min-content;
}

.rank-switch {
  border: 1px solid;
  display: flex;
  color: rgba(var(--v-theme-surface-2));
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  padding: 0 64px;
  width: 50%;
}

.vs-logo {
  width: 200px;
  height: 200px;
}

h1 {
  font-size: 5rem;
  color: rgba(var(--v-theme-surface-2));
  font-family: 'Luckiest Guy', serif !important;
  font-weight: 400;
  line-height: 5rem;
  margin: auto auto 16px auto;
}

#lobby-wrapper {
  color: rgba(var(--v-theme-surface-2));
  min-width: 100vw;
  min-height: 100vh;
  text-align: center;
  background: rgba(var(--v-theme-surface-1));
  box-shadow: inset 0 0 700px -1px #000000;
}

h5 {
  font-size: 3rem;
  color: rgba(var(--v-theme-surface-2));
  font-family: 'Luckiest Guy', serif !important;
  font-weight: 400;
  line-height: 5rem;
  margin: auto auto 16px auto;
}

@media (min-width: 980px) {
  .rank-switch {
    padding: 0;
  }
}

@media (max-width: 660px) {
  .rank-switch {
    padding: 0 3vw;
  }

  h1 {
    font-size: 2rem;
    margin: 0 auto 0 auto;
  }

  h5 {
    font-size: 2rem;
    line-height: 2rem;
    margin: 0 auto 16px auto;
  }

  .vs-logo {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 350px) {
  .rank-switch {
    width: 100%;
  }
}

#logo {
  height: 10vh;
  min-height: 64px;
  margin: 0 auto;
}

.lobby-ranked-text {
  color: var(--v-neutral-darken2);
}
</style>
