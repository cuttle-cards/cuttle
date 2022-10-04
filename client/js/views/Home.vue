<template>
  <div class="home">
    <div class="container">
      <div id="game-list-card">
        <v-row>
          <v-col cols="9">
            <h1 class="gradient-text">Games</h1>
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
                  class="ma-4"
                />
              </div>
            </div>
          </v-col>
          <v-col id="side-nav" cols="3">
            <img id="logo" alt="Vue logo" src="../img/logo.png" />
            <v-btn
              outlined
              color="primary"
              class="mt-4"
              :small="$vuetify.breakpoint.mdAndDown ? true : false"
              to="rules"
              data-cy="rules-link"
            >
              Rules
            </v-btn>
            <v-btn
              outlined
              color="secondary"
              class="mt-4"
              :small="$vuetify.breakpoint.mdAndDown ? true : false"
              href="https://human-ai-interaction.github.io/cuttle-bot/"
              target="_blank"
              data-cy="ai-link"
            >
              Play with AI
            </v-btn>
            <v-btn
              outlined
              class="mt-4"
              :small="$vuetify.breakpoint.mdAndDown"
              href="https://discord.gg/9vrAZ8xGyh"
              target="_blank"
            >
              Discord
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-end mt-8">
          <create-game-dialog @error="handleError" />
        </v-row>
      </div>
    </div>
    <v-snackbar
      v-model="showSnackBar"
      color="error"
      content-class="d-flex justify-space-between align-center"
      data-cy="newgame-snackbar"
    >
      {{ snackBarMessage }}
      <v-icon data-cy="close-snackbar" @click="clearSnackBar"> mdi-close </v-icon>
    </v-snackbar>
  </div>
</template>
<script>
import GameListItem from '@/components/GameListItem.vue';
import CreateGameDialog from '../components/CreateGameDialog.vue';

export default {
  name: 'Home',
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
    gameList() {
      return this.$store.state.gameList.games;
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
.container {
  width: 90%;
  margin: 10vh auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

#logo {
  height: auto;
  width: 80%;
  margin: 20px auto;
}

.page-title {
  margin: 0 auto;
  text-align: center;
}

#game-list-card {
  border-radius: 15px;
  margin-top: 8px;
}

#card-content-header {
  display: flex;
  align-items: center;
}

#game-list {
  background: #efefef;
  border: 1px solid #fd6222;
  box-sizing: border-box;
  padding: 20px 10px;
  border-radius: 15px;
  min-height: 55vh;
  max-height: 80vh;
  overflow: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  p {
    text-align: center;
  }
}

#side-nav {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#home-card-title {
  font-size: 2em;
}

p {
  margin-top: 16px;
}

@media (max-width: 979px) and (orientation: landscape) {
  h2 {
    font-size: 1.25rem;
  }

  #logo {
    width: 64px;
    height: 64px;
  }

  .container {
    width: 95%;
    margin: 0 auto;
    max-height: 95vh;
  }

  #game-list-card {
    padding: 5px;
  }

  #card-content-header {
    padding: 0;
    display: flex;
    align-items: center;
  }
}
</style>
