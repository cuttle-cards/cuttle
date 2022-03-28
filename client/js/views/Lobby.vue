<template>
  <v-container id="lobby-wrapper">
    <v-row>
      <v-col sm="3" md="1" class="my-auto">
        <img id="logo" alt="Cuttle logo" src="../img/logo.png" />
      </v-col>
      <v-col md="8" class="my-auto">
        <h1>Lobby for {{ gameName }}</h1>
      </v-col>
    </v-row>
    <!-- Usernames -->
    <v-row>
      <v-col offset="1">
        <lobby-player-indicator
          :player-username="$store.state.auth.username"
          :player-ready="iAmReady"
          data-cy="my-indicator"
        />
      </v-col>
      <v-col offset="1">
        <lobby-player-indicator
          :player-username="opponentName"
          :player-ready="opponentIsReady"
          data-cy="opponent-indicator"
        />
      </v-col>
    </v-row>
    <!-- Buttons -->
    <v-row class="mt-4">
      <v-spacer />
      <v-col cols="3" offset="1">
        <v-btn outlined color="primary" data-cy="exit-button" @click="leave">
          EXIT
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn contained color="primary" data-cy="ready-button" @click="ready">
          {{ readyButtonText }}
        </v-btn>
      </v-col>
      <v-spacer />
    </v-row>
  </v-container>
</template>
<script>
import LobbyPlayerIndicator from '../components/LobbyPlayerIndicator';
import { mapGetters } from 'vuex';

export default {
  name: 'Lobby',
  components: {
    LobbyPlayerIndicator,
  },
  computed: {
    ...mapGetters(['opponentName', 'opponentIsReady']),
    gameId() {
      return this.$store.state.game.id;
    },
    gameName() {
      return this.$store.state.game.name;
    },
    iAmReady() {
      return this.$store.state.game.myPNum === 0
        ? this.$store.state.game.p0Ready
        : this.$store.state.game.p1Ready;
    },
    readyButtonText() {
      return this.iAmReady ? 'UNREADY' : 'READY';
    },
  },
  mounted() {
    this.$store.dispatch('requestLobbyData');
  },
  methods: {
    ready() {
      this.$store.dispatch('requestReady');
    },
    leave() {
      this.$store
        .dispatch('requestLeaveLobby')
        .then(() => {
          this.$router.push('/');
        })
        .catch(err => {
          console.log(err);
        });
    },
  },
};
</script>

<style scoped lang="scss">
#logo {
  height: 10vh;
  min-height: 64px;
  margin: 0 auto;
}
</style>
