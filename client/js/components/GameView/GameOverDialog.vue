<template>
  <v-dialog v-model="show" persistent>
    <v-card id="game-over-dialog">
      <v-card-title v-if="stalemate" data-cy="stalemate-heading">
        <h1>Stalemate</h1>
      </v-card-title>
      <v-card-title v-else-if="playerWins" data-cy="victory-heading">
        <h1>You Win</h1>
      </v-card-title>
      <v-card-title v-else data-cy="loss-heading">
        <h1>You Lose</h1>
      </v-card-title>
      <v-card-text class="d-flex justify-center">
        <v-img
          v-if="stalemate"
          :src="require('../../img/logo_stalemate.svg')"
          max-width="250"
          data-cy="stalemate-img"
        />
        <v-img
          v-else-if="playerWins"
          :src="require('../../img/logo_body_no_text.svg')"
          :max-width="logoWidth"
          data-cy="victory-img"
        />
        <v-img v-else :src="require('../../img/logo_dead.svg')" :max-width="logoWidth" data-cy="loss-img" />
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" depressed data-cy="gameover-go-home" @click="goHome"> Go Home </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'GameOverDialog',
  props: {
    value: {
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
        return this.value;
      },
      set(newValue) {
        this.$emit('input', newValue);
      },
    },
    logoWidth() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return '180';
        default:
          return '300';
      }
    },
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
  },
};
</script>
