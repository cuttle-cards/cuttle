<template>
  <v-dialog v-model="show" persistent max-width="650">
    <v-card id="game-over-dialog">
      <v-card-title :data-cy="headingDataAttr">
        <h1>{{ heading }}</h1>
      </v-card-title>
      <v-card-text class="d-flex justify-center">
        <v-img
          :src="logoSrc"
          :data-cy="logoDataAttr"
          class="logo-image"
        />
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

<style scoped lang="scss">
.logo-image {
  height: auto;
  max-width: 180px;

  // TODO: replace with an actual css variable for breakpoint width
  // https://github.com/vuetifyjs/vuetify/blob/v3.1.3/packages/vuetify/src/styles/settings/_variables.scss#L95
  @media(min-width: 601px) {
    max-width: 300px;
  }

}
</style>
