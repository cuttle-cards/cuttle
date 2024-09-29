<template>
  <AnnouncementDialog />
  <div class="h-100 bg-surface-1">
    <v-container id="home-container" class="container">
      <h1 id="home-card-title">
        {{ t('home.gameFinder') }}
      </h1>
      <v-row>
        <v-col class="home-card-games" :cols="$vuetify.display.mdAndUp ? 8 : 12">
          <div id="game-list" class="mx-auto homeContent">
            <div class="py-3 d-flex mx-auto text-surface-1">
              <v-btn-toggle
                v-model="tab"
                rounded="0"
                color="#4a2416"
                variant="text"
                mandatory
              >
                <v-btn :value="TABS.PLAY" data-cy-game-list-selector="play">
                  {{ t('global.play') }}
                </v-btn>

                <v-btn :value="TABS.SPECTATE" data-cy-game-list-selector="spectate">
                  {{ t('home.spectate') }}
                </v-btn>
              </v-btn-toggle>
            </div>
            <v-divider v-if="$vuetify.display.mdAndDown" color="surface-1" class="border-opacity-100" />
            <div v-if="loadingData" class="mx-3">
              <v-row v-for="i in 2" :key="`gamelistSkeleton${i}`" class="list-item py-2 ma-0 align-center">
                <v-col lg="6" cols="12" class="list-item__inner-text pb-0 ma-0 mb-2 mb-lg-3">
                  <v-skeleton-loader
                    class="pa-0"
                    type="text"
                    :max-width="160"
                    color="surface-2"
                    height="30"
                  />
                  <v-skeleton-loader
                    class="pa-0"
                    type="text"
                    :max-width="130"
                    color="surface-2"
                    height="30"
                  />
                </v-col>
                <v-col lg="6" cols="12" class="list-item__button mx-auto pa-0">
                  <v-skeleton-loader
                    class="py-0 pl-0 pr-2 mx-auto"
                    type="heading"
                    color="surface-2"
                  />
                </v-col>
                <v-divider color="surface-1" class="border-opacity-25" />
              </v-row>
            </div>
            <v-window v-else v-model="tab" class="pa-4 overflow-y-auto">
              <v-window-item :value="TABS.PLAY">
                <p v-if="playableGameList.length === 0" data-cy="text-if-no-game" class="text-surface-1">
                  {{ t('home.noGameslist') }}
                </p>
                <div v-for="game in playableGameList" :key="game.id">
                  <GameListItem
                    :name="game.name"
                    :p0ready="game.p0Ready ? 1 : 0"
                    :p1ready="game.p1Ready ? 1 : 0"
                    :game-id="game.id"
                    :status="game.status"
                    :num-players="game.numPlayers"
                    :is-ranked="game.isRanked"
                    @error="handleSubscribeError(game.id, $event)"
                  />
                </div>
              </v-window-item>
              <v-window-item :value="TABS.SPECTATE">
                <p
                  v-if="spectateGameList.length === 0"
                  data-cy="no-spectate-game-text"
                  class="text-surface-1"
                >
                  {{ t('home.noSpectatelist') }}
                </p>
                <div v-for="game in spectateGameList" :key="game.id">
                  <GameListItem
                    :name="game.name"
                    :p0ready="game.p0Ready ? 1 : 0"
                    :p1ready="game.p1Ready ? 1 : 0"
                    :game-id="game.id"
                    :status="game.status"
                    :num-players="game.numPlayers"
                    :is-ranked="game.isRanked"
                    :is-spectatable="true"
                    :disable-spectate="game.isOver"
                    @error="handleError"
                  />
                </div>
              </v-window-item>
            </v-window>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="home-card-games" :cols="$vuetify.display.mdAndUp ? 8 : 12">
          <div class="mx-auto my-4 my-xl-2 homeContent">
            <CreateGameDialog @error="handleError" />
            <div class="d-flex flex-row justify-md-space-between justify-space-evenly align-center my-4">
              <v-btn
                v-if="!$vuetify.display.smAndUp"
                variant="text"
                color="surface-2"
                class="px-2"
                href="https://discord.gg/9vrAZ8xGyh"
                target="_blank"
                size="x-large"
              >
                <img class="discord" src="/img/loginView/logo-discord-cream.svg">
              </v-btn>
              <v-btn
                v-else
                variant="outlined"
                class="text-subtitle-1 px-xl-16"
                color="surface-2"
                href="https://discord.gg/9vrAZ8xGyh"
                target="_blank"
                size="x-large"
              >
                <img class="discord" src="/img/loginView/logo-discord-cream.svg">
                <span v-if="$vuetify.display.smAndUp">
                  {{ t('login.joinDiscord') }}
                </span>
              </v-btn>
              <HowItWorksDialog />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <BaseSnackbar
      v-model="showSnackBar"
      :message="snackBarMessage"
      data-cy="newgame-snackbar"
      @clear="clearSnackBar"
    />
  </div>
</template>
<script>
import { mapStores } from 'pinia';
import { useGameListStore } from '@/stores/gameList';
import { useI18n } from 'vue-i18n';
import GameListItem from '@/routes/home/components/GameListItem.vue';
import CreateGameDialog from '@/routes/home/components/CreateGameDialog.vue';
import BaseSnackbar from '@/components/BaseSnackbar.vue';
import HowItWorksDialog from '@/routes/home/components/HowItWorksDialog.vue';
import GameStatus from '_/utils/GameStatus.json';
import AnnouncementDialog from './components/announcementDialog/AnnouncementDialog.vue';

const TABS = {
  PLAY: 'play',
  SPECTATE: 'spectate',
};

export default {
  name: 'HomeView',
  components: {
    GameListItem,
    CreateGameDialog,
    BaseSnackbar,
    HowItWorksDialog,
    AnnouncementDialog,
  },
  setup() {
    // Vuetify has its own translation layer that isn't very good
    // It seems to conflict with the namespace of vue-i18n so we need to import it at the component
    // level and utilize it this way with a composable. There may be another more global way but
    // I haven't found anything just yet
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      TABS,
      tab: TABS.PLAY,
      showSnackBar: false,
      snackBarMessage: '',
      loadingData: true,
    };
  },
  computed: {
    ...mapStores(useGameListStore),
    playableGameList() {
      return this.gameListStore.openGames;
    },
    spectateGameList() {
      return this.gameListStore.spectateGames;
    },
    buttonSize() {
      return this.$vuetify.display.mdAndDown ? 'small' : 'medium';
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        if (this.$route.query?.error) {
          this.handleSubscribeError(Number(this.$route.query.gameId), this.t(this.$route.query.error));
          this.$router.replace('/');
        }
      }
    }
  },
  async created() {
    await this.gameListStore.requestGameList();
    this.loadingData = false;
  },
  methods: {
    clearSnackBar() {
      this.snackMessage = '';
      this.showSnackBar = false;
    },
    handleSubscribeError(gameId, message) {
      this.gameListStore.updateGameStatus({ id: gameId, newStatus: GameStatus.STARTED });
      this.handleError(message);
    },
    handleError(message) {
      this.creatingGame = false;
      this.showSnackBar = true;
      this.snackBarMessage = message;
      this.showCreateGameDialog = false;
    },
    logout() {
      this.gameListStore
        .requestLogout()
        .then(() => {
          this.$router.push('/login');
        })
        .catch((err) => {
          if (err) {
            console.error(err);
          }
          console.log('Error logging out');
        });
    },
  },
};
</script>
<style scoped lang="scss">
// width
::-webkit-scrollbar {
  width: 5px;
}

// Track
::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-2));
  border-radius: 16px;
}

// Handle
::-webkit-scrollbar-thumb {
  background: #4a2416;
  border-radius: 16px;
}

.discord {
  max-height: 30px;
  margin-right: 18px;
}

h2 {
  font-size: 1.25rem;
}

ul {
  padding-inline-start: 40px;
}

p {
  margin-top: 1rem;
}

.container {
  width: 75%;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.page-title {
  margin: 0 auto;
  text-align: center;
}

#logo {
  height: 20vh;
  margin: 0 auto;
}

.home-card-games {
  padding: 0;
  max-width: 640px;
  margin: 0 auto;
}

.homeContent {
  max-width: 580px;
}

#side-nav {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#game-list-card {
  border-radius: 15px;
  margin-top: 0.5rem;
  padding: 0.25rem;
}

#game-list {
  box-sizing: border-box;
  background: rgba(var(--v-theme-surface-2));
  border-radius: 8px;
  min-height: 50vh;
  max-height: 50vh;
  display: flex;
  margin: auto;
  flex-direction: column;

  p {
    text-align: center;
  }
}

#add-new-game {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

#card-content-header {
  padding: 0;
  display: flex;
  align-items: center;
}

#home-card-title {
  font-size: 5rem;
  color: rgba(var(--v-theme-surface-2));
  font-family: 'Luckiest Guy', serif !important;
  font-weight: 400;
  line-height: 5rem;
  margin: 32px auto 16px auto;
}
#game-list :deep(.v-skeleton-loader__heading){
  height:34px;
  width:100%;
  border-radius: 4px;
}

@media (min-width: 1920px) {
  .homeContent {
    max-width: 100%;
  }
  .home-card-games {
    padding: 0;
    max-width: 100%;
    margin: 12px auto 5px auto;
  }
  #game-list {
    min-height: 60vh;
  }
}
@media (max-width: 844px) {
  #game-list {
    max-width: 100%;
  }
}
@media (max-width: 600px) {
  .discord {
    max-height: 40px;
    margin: 0;
  }
}
@media (max-width: 980px) {
  .container {
    width: 95%;
  }
  #home-card-title {
    font-size: 2rem;
  }
}

@media (min-width: 980px) {
  .container {
    .home & {
      height: auto;
      width: 80%;
      margin: 10vh auto;
      display: flex;
      justify-content: center;
      flex-direction: column;
    }
  }

  #game-list-card {
    padding: 0;
    margin: 0;
    line-height: 1.5;
  }

  #game-list {
    overflow: auto;
  }
}
</style>

