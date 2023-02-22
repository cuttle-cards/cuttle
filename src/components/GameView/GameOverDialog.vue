<template>
  <v-dialog v-model="show" persistent max-width="650">
    <v-card id="game-over-dialog">
      <div class="d-flex">
        <v-card-title :data-cy="headingDataAttr" class="mt-8">
          <h1>{{ heading }}</h1>
        </v-card-title>
        <v-card-text class="d-flex justify-end mr-4 mt-4">
          <v-img
            :src="logoSrc"
            :data-cy="logoDataAttr"
            class="logo-image"
          />
        </v-card-text>
      </div>
      <v-card-text v-if="currentMatch" data-cy="match-result-section">
        Match against {{ opponent.username }}
        <span>: {{currentMatchWinner ? "Finished" : "In Progress"}}</span>
      </v-card-text>
      <v-card-text v-if="currentMatchWinner" data-cy="match-winner-message">
        You {{ playerWinsMatch ? "won" :"lost" }} your game against {{opponent.username}}
      </v-card-text>
      <v-card-text data-cy="match-result-games">
        <div class="d-flex">
          <div
            class="d-flex flex-column align-center"
            v-for="(gameStatus, i) in matchGameStats"
            :key="i"
          >
            <v-icon size="x-large" color="black" :icon="iconFromGameStatus(gameStatus)" />
            <span>
              {{ gameStatus }}
            </span>
          </div> 
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" variant="flat" data-cy="gameover-go-home" @click="goHome">
          Go Home
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { mapState } from 'vuex';

export default {
  name: 'GameOverDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    playerWins: {
      type: Boolean,
      required: true,
    },
    stalemate: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
    ...mapState({
      playingFromDeck: ({ game }) => game.playingFromDeck,
      game: ({ game }) => game,
    }),
    ...mapGetters([
      'player',
      'opponent',
    ]),
    heading() {
      if (this.stalemate) {
        return 'Stalemate';
      }

      if (this.playerWins) {
        return 'You Win';
      }

      return 'You Lose';
    },
    headingDataAttr() {
      if (this.stalemate) {
        return 'stalemate-heading';
      }

      if (this.playerWins) {
        return 'victory-heading';
      }

      return 'loss-heading';
    },
    logoSrc() {
      if (this.stalemate) {
        return '/img/logo-stalemate.svg';
      }

      if (this.playerWins) {
        return '/img/logo-body-no-text.svg';
      }

      return '/img/logo-dead.svg';
    },
    logoDataAttr() {
      if (this.stalemate) {
        return 'stalemate-img';
      }

      if (this.playerWins) {
        return 'victory-img';
      }

      return 'loss-img';
    },
    currentMatch(){
      return this.game.currentMatch
    },
    matchGameStats(){
      if(!this.game.currentMatch?.games) return []
      const result= this.game.currentMatch.games.map(game=>{
        if (game.result === -1) return 'I'
        if(game.result === 0 || game.result === 1){
          if(game.p0 === this.player.id) return 'W'
          return 'L'
        }
        return 'D'
      })
      return result
    },
    currentMatchWinner() {
      return this.game.currentMatch?.winner
    },
    playerWinsMatch(){
      return this.game.currentMatch?.winner === this.player.id
    }
  },
  methods: {
    goHome() {
      this.$store.dispatch('requestUnsubscribeFromGame').then(() => {
        this.$router.push('/');
        this.$store.commit('setGameOver', {
          gameOver: false,
          conceded: false,
          winner: null,
        });
      });
    },
    iconFromGameStatus(gameStatus){
      switch (gameStatus){
        case 'W':
          return 'mdi-trophy'
        case 'L':
          return 'mdi-close-thick'
        case 'I':
          return 'mdi-account-clock'
        case 'D':
          return 'mdi-handshake-outline'
      }
    }
  },
};
</script>

<style scoped lang="scss">
.logo-image {
  height: auto;
  max-width: 180px;
}

h1 {
  font-family: 'PT Serif', serif !important;
}
</style>
