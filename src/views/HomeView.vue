<template>
  <div
    class="home pa-4"
    :class="{
      home: $vuetify.display.lgAndUp,
    }"
  >
    <v-container>
      <v-row v-if="$vuetify.display.mdAndDown">
        <img id="logo" alt="Cuttle logo" src="/img/logo.png" height="20vh" class="mb-4" />
      </v-row>
      <div id="game-list-card">
        <v-row>
          <v-col :cols="$vuetify.display.mdAndDown ? 12 : 9">
            <div id="card-content-header" class="mb-4">
              <h1 id="home-card-title">Games</h1>
              <v-row class="create-game-btn">
                <create-game-dialog @error="handleError" />
              </v-row>
            </div>
            <div id="game-list">
              <p v-if="gameList.length === 0" data-cy="text-if-no-game">No Active Games</p>
              <div v-for="game in gameList" :key="game.id">
                <game-list-item
                  :name="game.name"
                  :p0ready="game.p0Ready ? 1 : 0"
                  :p1ready="game.p1Ready ? 1 : 0"
                  :game-id="game.id"
                  :status="game.status"
                  :num-players="game.numPlayers"
                  :is-ranked="game.isRanked"
                />
              </div>
            </div>
          </v-col>
          <v-col id="side-nav" :cols="$vuetify.display.mdAndDown ? 12 : 3">
            <img v-if="$vuetify.display.lgAndUp" id="logo" alt="Vue logo" src="/img/logo.png" />
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
            <h6 class="text-h6 mt-4">Looking to Play?</h6>
            <p class="mt-0">Our weekly play sessions are open to everyone!</p>
            <ul>
              <li>Wednesday Nights at 8:30pm EST</li>
              <li>Thursdays at 12pm EST</li>
            </ul>
            <p>
              Can't find a match?
              <v-btn variant="text" href="https://discord.gg/9vrAZ8xGyh">Join our discord</v-btn>
              to see who's around to play!
            </p>
          </v-col>
        </v-row>
      </div>
    </v-container>
    <v-snackbar
      v-model="showSnackBar"
      color="error"
      data-cy="newgame-snackbar"
    >
      {{ snackBarMessage }}
      <template #actions>
        <v-btn data-cy="close-snackbar" icon variant="text" @click="clearSnackBar">
          <v-icon icon="mdi-close" />
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import GameListItem from '@/components/GameListItem.vue';
import CreateGameDialog from '../components/CreateGameDialog.vue';

export default {
  name: 'HomeView',
  components: {
    GameListItem,
    CreateGameDialog,
  },
  data() {
    return {
      showSnackBar: false,
      snackBarMessage: '',
    };
  },
  computed: {
    ...mapState({
      gameList: ({ gameList }) => gameList.games,
    }),
    buttonSize() {
      return this.$vuetify.display.mdAndDown ? 'small' : 'medium';
    },
  },
  async mounted() {
    // Leave any existing lobbies before getting the game list
    // Need to make sure we do these in order so the order of operations is:
    //     leave -> list
    try {
      await this.$store.dispatch('requestLeaveLobby');
    } catch (err) {
      // A user may not actually be in a lobby, so we need to
      // swallow this error so the component doesn't error out
      // TODO: Improve this logic with an isInLobby helper
    }
    await this.$store.dispatch('requestGameList');
  },
  methods: {
    clearSnackBar() {
      this.snackMessage = '';
      this.showSnackBar = false;
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
  border: 1px solid #fd6222;
  background: #efefef;
  border-radius: 10px;
  min-height: 55vh;
  display: flex;
  min-width: 100%;
  flex-direction: column;
  padding: 0.25rem;

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
    border-radius: 15px;
    overflow: auto;
    padding: 1.25rem 0.5rem;
  }

  .create-game-btn {
    margin-right: 0.5rem;
  }
}
</style>
