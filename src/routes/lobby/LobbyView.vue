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
              color="primary"
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
                  @keydown.enter.stop="(e) => e.target.click()"
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
                color="game-card"
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
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import { playAudio } from '@/util/audio.js';
import PlayerReadyIndicator from '@/components/PlayerReadyIndicator.vue';
import TheLanguageSelector from '@/components/TheLanguageSelector.vue';
import { ROUTE_NAME_GAME } from '_/src/router';

// Deps
const { t } = useI18n();
const router = useRouter();

// Audio
const joinAudio = new Audio('/sounds/lobby/enter-lobby.mp3');
const leaveAudio = new Audio('/sounds/lobby/leave-lobby.mp3');

// Stores
const authStore = useAuthStore();
const gameStore = useGameStore();
const snackbarStore = useSnackbarStore();

// Refs
const readying = ref(false);
const gameStarted = ref(false);

// Computed Props
const gameName = computed(() => gameStore.name);

const iAmReady = computed(() => {
  return gameStore.myPNum === 0 ? gameStore.p0Ready : gameStore.p1Ready;
});

const readyButtonText = computed(() => t(iAmReady.value ? 'lobby.unready' : 'lobby.ready'));

const rankedIcon = computed(() => (gameStore.isRanked ? 'sword-cross' : 'coffee'));

const opponentUsername = computed(() => gameStore.opponentUsername);


// Methods
async function ready() {
  readying.value = true;
  try {
    await gameStore.requestReady();
  } catch (err) {
    // If game has already started; navigate to GameView
    if (err?.code === 'CONFLICT') {
      router.push({
        name: ROUTE_NAME_GAME,
        params: {
          gameId: err.gameId,
        },
      });
    } else {
      const key = err?.message;
      snackbarStore.alert(t(key));
    }
  }
  readying.value = false;
}

async function setIsRanked() {
  await gameStore.requestSetIsRanked({
    isRanked: gameStore.isRanked,
  });
}

async function leave() {
  await gameStore.requestLeaveLobby();
  snackbarStore.clear();
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
  color: rgba(var(--v-theme-game-card));
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
  color: rgba(var(--v-theme-game-card));
  font-family: 'Luckiest Guy', serif !important;
  font-weight: 400;
  line-height: 5rem;
  margin: auto auto 16px auto;
}

#lobby-wrapper {
  color: rgba(var(--v-theme-game-card));
  min-width: 100vw;
  min-height: 100vh;
  text-align: center;
  background: rgba(var(--v-theme-game-board));
  box-shadow: inset 0 0 700px -1px rgb(var(--v-theme-shadow));
}

h5 {
  font-size: 3rem;
  color: rgba(var(--v-theme-game-card));
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
