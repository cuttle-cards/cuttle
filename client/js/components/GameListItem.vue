<template>
  <v-card max-width="350">
    <v-card-title class="d-flex justify-start align-center">
      <img
        :src="require('../img/logo_head.svg')"
        class="mr-8"
        contain
        :height="$vuetify.breakpoint.smAndUp ? 64 : 32"
      />
      <span>
        <h4>{{ name }}</h4>
        <p class="mb-0">{{ readyText }}</p>
      </span>
    </v-card-title>
    <v-card-actions>
      <v-btn
        block
        color="primary"
        rounded
        outlined
        min-width="200"
        :disabled="!status"
        :loading="joiningGame"
        @click="subscribeToGame"
      >
        {{ buttonText }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'GameListItem',
  props: {
    name: {
      type: String,
      default: '',
    },
    p0ready: {
      type: Number,
      default: 0,
    },
    p1ready: {
      type: Number,
      default: 0,
    },
    gameId: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    numPlayers: {
      type: Number,
      required: true,
    },
    isRanked: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      joiningGame: false,
    };
  },
  computed: {
    numPlayersReady() {
      return this.p0ready + this.p1ready;
    },
    readyText() {
      return `${this.numPlayers} / 2`;
    },
    buttonText() {
      return this.isRanked ? 'Play Ranked' : 'Play';
    },
  },
  methods: {
    subscribeToGame() {
      this.joiningGame = true;
      this.$store
        .dispatch('requestSubscribe', this.gameId)
        .then(() => {
          this.joiningGame = false;
          this.$router.push(`/lobby/${this.gameId}`);
        })
        .catch(() => {
          this.joiningGame = false;
        });
    },
  },
};
</script>
<style scoped lang="scss">
// .list-item {
//   margin-left: 0;
//   margin-right: 0;
//   text-align: left;
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
//   align-items: center;
//   & .game-name {
//     font-weight: 600;
//   }
// }
// .list-item-button {
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }
// @media (max-width: 979px) and (orientation: landscape) {
//   .list-item {
//     margin: 0;
//     & p {
//       line-height: 1rem;
//       margin: 3px auto;
//     }
//   }
// }
</style>
