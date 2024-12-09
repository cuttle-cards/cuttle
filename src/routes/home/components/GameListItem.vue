<template>
  <div>
    <v-row class="list-item" data-cy="game-list-item">
      <v-col lg="6" class="list-item__inner-text">
        <p class="game-name text-surface-1" data-cy="game-list-item-name">
          {{ name }}
        </p>
        <p v-if="!isSpectatable" class="text-surface-1">
          {{ playersText }}
        </p>
      </v-col>
      <v-col lg="6" class="list-item__button pr-md-0">
        <!-- Join Button -->
        <v-btn
          v-if="!isSpectatable"
          class="w-100"
          v-bind="buttonAttrs"
          :disabled="gameIsFull"
          :data-cy-join-game="gameId"
          @click="subscribeToGame"
        >
          <v-icon
            class="mr-4"
            size="medium"
            :icon="isRanked ? 'mdi-sword-cross' : 'mdi-coffee-outline'"
            aria-hidden="true"
          />
          {{ joinButtonText }}
        </v-btn>
        <!-- Spectate Button -->
        <v-btn
          v-else
          class="w-100"
          v-bind="buttonAttrs"
          :data-cy-spectate-game="gameId"
          :data-cy-join-game="gameId"
          :disabled="disableSpectate"
          @click="spectateGame"
        >
          <v-icon class="mr-4" size="medium" icon="mdi-eye" />
          {{ t('home.spectate') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-divider color="surface-1" class="mb-4 mx-2 border-opacity-100 px-5" />
  </div>
</template>

<script>
import GameStatus from '_/utils/GameStatus.json';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import { useGameListStore } from '@/stores/gameList';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

export default {
  name: 'GameListItem',
  props: {
    name: {
      type: String,
      default: '',
    },
    players: {
      type: Array,
      required: true,
    },
    gameId: {
      type: Number,
      required: true,
    },
    status: {
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
  emits: [ 'error' ],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      joiningGame: false,
    };
  },
  computed: {
    ...mapStores(useGameStore, useAuthStore, useGameListStore),
    playersText() {
      const numPlayers = this.players.length;
      switch (numPlayers) {
        case 0:
          return 'Empty';
        case 1:
          return `vs ${this.players[0].username}`;
        case 2:
          return `${this.players[0].username} vs ${this.players[1].username}`;
        default:
          return '';
      }
    },
    joinButtonText() {
      return `${this.t('home.join')} ${this.isRanked ? this.t('global.ranked') : this.t('global.casual')}`;
    },
    buttonAttrs() {
      return {
        color: 'surface-1',
        variant: 'outlined',
        minWidth: '200',
        loading: this.joiningGame,
      };
    },
    gameIsFull() {
      return this.players.length >= 2 || this.status !== GameStatus.CREATED;
    },
  },
  methods: {
    subscribeToGame() {
      this.joiningGame = true;
      this.$router.push(`/lobby/${this.gameId}`).then(() => {
        this.joiningGame = false;
      })
        .catch(() => {
          this.joiningGame = false;
        });
    },
    spectateGame() {
      this.joiningGame = true;
      if (this.gameStore.players.some(({ username }) => username === this.authStore.username)) {
        this.$router.push(`/game/${this.gameId}`);
        return;
      }
      this.gameStore
        .requestSpectate(this.gameId)
        .then(() => {
          this.joiningGame = false;
          this.$router.push(`/spectate/${this.gameId}`);
        })
        .catch((error) => {
          this.joiningGame = false;
          this.$emit('error', error);
          this.gameListStore.gameFinished(this.gameId);
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
    font-size: 1.5em;
    text-align: left;
    // width: 60%;
    padding-right: 1rem;
  }
  & p {
    line-height: 1;
    margin: 3px auto;
  }
  &__inner-text {
    // display: flex;
    align-items: center;
    padding-bottom: 1rem;
    padding-top: 0.25rem;
  }
  &__button {
    display: flex;
    align-items: center;
    justify-content: end;
    margin-top: 0;
    padding-top: 0.5rem;
  }
}

@media (min-width: 1264px) {
  .list-item {
    max-width: 100%;
    flex-direction: row;
    padding: 10px 10px;
    & .game-name {
      font-size: 1.5rem;
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
