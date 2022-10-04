<template>
  <v-card max-width="350" data-cy="game-list-item">
    <v-card-title class="d-flex justify-start align-center">
      <img
        :src="require('../img/logo_head.svg')"
        class="mr-8"
        contain
        :height="$vuetify.breakpoint.smAndUp ? 64 : 32"
      />
      <span>
        <h5 class="text-h5">{{ name }}</h5>
        <p class="mb-0 text-subtitle-1">{{ readyText }}</p>
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
        <v-icon v-if="isRanked" class="mr-4" medium>mdi-trophy</v-icon>
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
<style scoped lang="scss"></style>
