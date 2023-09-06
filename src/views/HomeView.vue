<template>
  <div
    class="home pa-4"
    :class="{
      home: $vuetify.display.lgAndUp,
    }"
  >
    <v-container>
      <v-row v-if="$vuetify.display.mdAndDown">
        <img
          id="logo"
          alt="Cuttle logo"
          src="/img/logo.png"
          height="20vh"
          class="mb-4"
        >
      </v-row>
      <div id="game-list-card">
        <v-row>
          <v-col :cols="$vuetify.display.mdAndDown ? 12 : 9">
            <div id="card-content-header" class="mb-4">
              <h1 id="home-card-title">
                Games
              </h1>
              <v-row class="create-game-btn">
                <create-game-dialog @error="handleError" />
              </v-row>
            </div>
            <div id="game-list">
              <v-tabs v-model="tab" bg-color="primary" fixed-tabs>
                <v-tab :value="TABS.PLAY" data-cy-game-list-selector="play">
                  Play
                </v-tab>
                <v-tab :value="TABS.SPECTATE" data-cy-game-list-selector="spectate">
                  Spectate
                </v-tab>
              </v-tabs>
              <v-window v-model="tab" class="pa-4">
                <v-window-item :value="TABS.PLAY">
                  <p v-if="playableGameList.length === 0" data-cy="text-if-no-game">
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
                  <p v-if="specateGameList.length === 0" data-cy="no-spectate-game-text">
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
          <v-col id="side-nav" :cols="$vuetify.display.mdAndDown ? 12 : 3">
            <img
              v-if="$vuetify.display.lgAndUp"
              id="logo"
              alt="Cuttle logo"
              src="/img/logo.png"
            >
            <v-btn
              variant="outlined"
              color="primary"
              class="mt-4"
              to="/rules"
              data-cy="rules-link"
              :size="buttonSize"
            >
              Rules
            </v-btn>
            <v-btn
              variant="outlined"
              color="secondary"
              class="mt-4"
              href="https://human-ai-interaction.github.io/cuttle-bot/"
              target="_blank"
              data-cy="ai-link"
              :size="buttonSize"
            >
              Play with AI
            </v-btn>
            <v-btn
              variant="outlined"
              class="mt-4"
              href="https://discord.gg/9vrAZ8xGyh"
              target="_blank"
              :size="buttonSize"
            >
              Discord
            </v-btn>
            <h6 class="text-h6 mt-4">
              Looking to Play?
            </h6>
            <p class="mt-0">
              Our weekly play sessions are open to everyone!
            </p>
            <ul>
              <li>Wednesday Nights at 8:30pm EST</li>
              <li>Thursdays at 12pm EST</li>
            </ul>
            <p>
              Can't find a match?
              <v-btn variant="text" href="https://discord.gg/9vrAZ8xGyh">
                Join our discord
              </v-btn>
              to see who's around to play!
            </p>
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
import { mapState } from 'vuex';
import GameListItem from '@/components/HomeView/GameListItem.vue';
import CreateGameDialog from '@/components/HomeView/CreateGameDialog.vue';
import BaseSnackbar from '@/components/Global/BaseSnackbar.vue';
import GameStatus from '../../utils/GameStatus.json';

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
h1 {
  background: linear-gradient(268.89deg, rgba(98, 2, 238, 0.87) 73.76%, rgba(253, 98, 34, 0.87) 99.59%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  background: #cdd1d4;
  border-radius: 8px;
  min-height: 55vh;
  display: flex;
  min-width: 100%;
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
  font-size: 2em;
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
