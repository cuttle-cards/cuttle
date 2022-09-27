<template>
  <div>
    <v-row class="list-item" data-cy="game-list-item">
      <v-col v-if="$vuetify.breakpoint.lgAndUp" sm="2" lg="3">
        <v-img
          :src="require('../img/logo_head.svg')"
          class="my-1"
          contain
          :height="$vuetify.breakpoint.smAndUp ? 62 : 32"
        />
      </v-col>
      <v-col sm="7" lg="6" class="list-item__inner-text">
        <p class="game-name" data-cy="game-list-item-name">
          {{ name }}
        </p>
        <p>{{ readyText }} players</p>
      </v-col>
      <v-col cols="3" class="list-item__button">
        <v-btn
          color="primary"
          rounded
          outlined
          min-width="200"
          :disabled="!status"
          :loading="joiningGame"
          :small="!$vuetify.breakpoint.lg"
          @click="subscribeToGame"
        >
          <v-icon v-if="isRanked" class="mr-4" medium>mdi-trophy</v-icon>
          {{ buttonText }}
        </v-btn>
      </v-col>
    </v-row>
    <v-divider class="mb-4" />
  </div>
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
