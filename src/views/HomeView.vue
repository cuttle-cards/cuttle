<template>
  <div
    :class="[$vuetify.display.lgAndUp ?? 'home', 'h-100 bg-surface-1']"
  >
    <v-container>
      <div id="game-list-card">
        <v-row>
          <v-col>
            <div id="card-content-header" class="mb-4">
              <h1 id="home-card-title">
                Game Finder
              </h1>
            </div>
            <div id="game-list">
              <div class="py-md-5 py-3 d-flex mx-auto text-surface-1">
                <v-btn
                  class="px-md-16 px-4 mx-2"
                  rounded="0"
                  :elevation="0"
                  :color="tab === TABS.PLAY ? 'surface-1' : 'surface-2'"
                  text-color="white"
                  data-cy-game-list-selector="play"
                  @click="tab = TABS.PLAY"
                >
                  PLAY
                </v-btn>
                <v-btn
                  class="px-md-16 px-4 mx-md-2"
                  rounded="0"
                  :elevation="0"
                  :color="tab === TABS.SPECTATE ? 'surface-1' : 'surface-2'"
                  text-color="white"
                  data-cy-game-list-selector="spectate"
                  @click="tab = TABS.SPECTATE"
                >
                  SPECTATE
                </v-btn>
              </div>
              <v-divider v-if="$vuetify.display.mdAndDown" color="surface-1" class="border-opacity-100" />
              <v-window v-model="tab" class="pa-4 overflow-y-auto">
                <v-window-item :value="TABS.PLAY">
                  <p v-if="playableGameList.length === 0" data-cy="text-if-no-game" class="text-surface-1">
                    No Active Games
                  </p>
                  <div v-for="game in playableGameList" :key="game.id">
                    <game-list-item
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
                  <p v-if="specateGameList.length === 0" data-cy="no-spectate-game-text" class="text-surface-1">
                    No Games Available to Spectate
                  </p>
                  <div v-for="game in specateGameList" :key="game.id">
                    <game-list-item
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
          <v-col class="game-list-btn">
            <create-game-dialog @error="handleError" />
          </v-col>
        </v-row>
        <v-row class="game-list-btn px-1">
          <v-col class="pa-0">
            <v-btn
              v-if="!$vuetify.display.smAndUp"
              variant="text"
              color="surface-2"
              class="pa-2"
              href="https://discord.gg/9vrAZ8xGyh"
              target="_blank"
              size="medium"
            >
              <img class="discord" src="/img/loginView/logo-discord-cream.svg">
            </v-btn>
            <v-btn
              v-else
              variant="outlined"
              color="surface-2"
              class="pa-2"
              href="https://discord.gg/9vrAZ8xGyh"
              target="_blank"
              size="medium"
            >
              <img class="discord" src="/img/loginView/logo-discord-cream.svg">
              <span v-if="$vuetify.display.smAndUp">{{ t('login.joinDiscord') }}</span>
            </v-btn>
          </v-col>
          <v-col class="d-flex justify-center align-center pa-0">    
            <how-it-works-dialog />
          </v-col>
        </v-row>
      </div>
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
import { useI18n } from 'vue-i18n';
import { mapState } from 'vuex';
import GameListItem from '@/components/GameListItem.vue';
import CreateGameDialog from '@/components/CreateGameDialog.vue';
import BaseSnackbar from '@/components/Global/BaseSnackbar.vue';
import GameStatus from '../../utils/GameStatus.json';
import HowItWorksDialog from '@/components/HowItWorksDialog.vue';

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
    HowItWorksDialog
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
    };
  },
  computed: {
    ...mapState({
      playableGameList: ({ gameList }) => gameList.openGames,
      specateGameList: ({ gameList }) => gameList.spectateGames,
    }),
    buttonSize() {
      return this.$vuetify.display.mdAndDown ? 'small' : 'medium';
    },
  },
  async created() {
    await this.$store.dispatch('requestGameList');
  },
  methods: {
    clearSnackBar() {
      this.snackMessage = '';
      this.showSnackBar = false;
    },
    handleSubscribeError(gameId, message) {
      this.$store.commit('updateGameStatus', {id: gameId, newStatus: GameStatus.STARTED});
      this.handleError(message);
    },
    handleError(message) {
      this.creatingGame = false;
      this.showSnackBar = true;
      this.snackBarMessage = message;
      this.showCreateGameDialog = false;
    },
    logout() {
      this.$store
        .dispatch('requestLogout')
        .then(() => {
          this.$router.push('/login');
        })
        .catch((err) => {
          if (err) console.error(err);
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
  background: #FFF4D7;
  border-radius: 16px;
}

// Handle
::-webkit-scrollbar-thumb {
  background: #4A2416;
  border-radius: 16px;
}


.discord {
  max-height: 48px;
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
  width: 95%;
  margin: 0 auto;
  max-height: 95vh;
}

.page-title {
  margin: 0 auto;
  text-align: center;
}

#logo {
  height: 20vh;
  margin: 0 auto;
}

.create-game-btn {
  display: flex;
  justify-content: flex-end;
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
  background: #FFF4D7;
  border-radius: 8px;
  min-height: 50vh;
  max-height: 50vh;
  display: flex;
  max-width: 50%;
  margin: auto;
  flex-direction: column;

  p {
    text-align: center;
  }
}
.game-list-btn {
  padding: 12px 8px;
    max-width: 50%;
  margin: 0 auto;
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
  color: #fff4d7;
  font-family: 'Luckiest Guy', serif !important;
  font-weight: 400;
  line-height: 5rem;
  margin: 0 auto;
}

@media (max-width: 844px) {
  #game-list {
  max-width: 100%;
}
.game-list-btn {
    max-width: 100%;
}
}
@media (max-width: 980px) {
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

  .create-game-btn {
    margin-right: 0.5rem;
  }
}
</style>
