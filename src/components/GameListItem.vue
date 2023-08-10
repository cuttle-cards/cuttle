<template>
  <div>
    <v-row class="list-item" data-cy="game-list-item">
      <v-col v-if="$vuetify.display.lgAndUp" sm="2" lg="3">
        <v-img
          src="/img/logo-head.svg"
          class="my-1"
          cover
          :width="62"
        />
      </v-col>
      <v-col sm="7" lg="6" class="list-item__inner-text">
        <p class="game-name" data-cy="game-list-item-name">
          {{ name }}
        </p>
        <p v-if="!isSpectatable">{{ readyText }} players</p>
      </v-col>
      <v-col cols="3" class="list-item__button">
        <!-- Join Button -->
        <v-btn
          v-if="!isSpectatable"
          v-bind="buttonAttrs"
          :disabled="!status === 1"
          :data-cy-join-game="gameId"
          @click="subscribeToGame"
        >
          <v-icon
            v-if="isRanked"
            class="mr-4"
            size="medium"
            icon="mdi-trophy"
          />
          {{ joinButtonText }}
        </v-btn>
        <!-- Spectate Button -->
        <v-btn
          v-else
          v-bind="buttonAttrs"
          :data-cy-spectate-game="gameId"
          :data-cy-join-game="gameId"
          :disabled="disableSpectate"
          @click="spectateGame"
        >
          <v-icon class="mr-4" size="medium" icon="mdi-eye" />
          Spectate
        </v-btn>
      </v-col>
    </v-row>
    <v-divider class="mb-4" />
  </div>
</template>

<script>
export default {
  name: 'GameListItem',
  emits: ['error'],
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
      type: Number,
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
    isSpectatable: {
      type: Boolean,
      default: false,
    },
    disableSpectate: {
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
    joinButtonText() {
      return this.isRanked ? 'Play Ranked' : 'Play';
    },
    buttonAttrs() {
      return {
        color: 'primary',
        rounded: true,
        variant: 'outlined',
        minWidth: '200',
        loading: this.joiningGame,
      };
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
        .catch((error) => {
          this.joiningGame = false;
          this.$emit('error', error);
        });
    },
    spectateGame() {
      this.joiningGame = true;
      this.$store
        .dispatch('requestSpectate', this.gameId)
        .then(() => {
          this.joiningGame = false;
          this.$router.push(`/spectate/${this.gameId}`);
        })
        .catch((error) => {
          this.joiningGame = false;
          this.$emit('error', error);
          this.$store.commit('gameFinished', this.gameId);
        });
    },
  },
};
</script>
<style scoped lang="scss">
.list-item {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.5rem;
  word-break: break-all;
  & .game-name {
    font-weight: 600;
    font-size: 1.1em;
    text-align: left;
    width: 60%;
    padding-right: 1rem;
  }
  & p {
    line-height: 1;
    margin: 3px auto;
  }
  &__inner-text {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
    padding-top: 0.25rem;
  }
  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    padding-top: 0.5rem;
  }
}

@media (min-width: 1264px) {
  .list-item {
    max-width: 95%;
    flex-direction: row;
    padding: 0;
    & .game-name {
      font-size: 1rem;
      margin-bottom: 1rem;
      width: 100%;
    }
    &__inner-text {
      display: block;
      padding: 0;
    }
  }
}
</style>
