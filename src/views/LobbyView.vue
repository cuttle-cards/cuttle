<template>
  <v-container id="lobby-wrapper">
    <v-row>
      <v-col sm="3" md="1" class="my-auto">
        <img id="logo" alt="Cuttle logo" src="/img/logo.png">
      </v-col>
      <v-col md="8" class="my-auto">
        <h1 class="d-sm-flex align-center">
          {{ `${t('lobby.lobbyFor')}  ${gameName}` }}
          <small class="lobby-ranked-text d-flex align-center">
            <v-switch
              v-model="gameStore.isRanked"
              class="mx-4"
              :label="gameStore.isRanked ? t('lobby.ranked') : t('lobby.casual')"
              data-cy="edit-game-ranked-switch"
              color="primary"
              hide-details
              @update:model-value="setIsRanked"
            />
            <v-icon
              class="mx-1"
              size="medium"
              :icon="`mdi-${gameStore.isRanked ? 'trophy' : 'coffee'}`"
              aria-hidden="true"
            />
          </small>
        </h1>
      </v-col>
    </v-row>

    <!-- Usernames -->
    <v-row>
      <v-col offset="1">
        <lobby-player-indicator
          :player-username="authStore.username"
          :player-ready="iAmReady"
          data-cy="my-indicator"
        />
      </v-col>
      <v-col offset="1">
        <audio ref="enterLobbySound" src="/sounds/lobby/enter-lobby.mp3" />
        <audio ref="leaveLobbySound" src="/sounds/lobby/leave-lobby.mp3" />
        <lobby-player-indicator
          :player-username="gameStore.opponentUsername"
          :player-ready="gameStore.opponentIsReady"
          data-cy="opponent-indicator"
        />
      </v-col>
    </v-row>
    <!-- Buttons -->
    <v-row class="mt-4">
      <v-spacer />
      <v-col cols="3" offset="1">
        <v-btn
          :disabled="readying"
          variant="outlined"
          color="primary"
          data-cy="exit-button"
          @click="leave"
        >
          {{ t('lobby.exit') }}
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
          :loading="readying"
          contained
          color="primary"
          data-cy="ready-button"
          @click="ready"
        >
          {{ readyButtonText }}
          <v-icon
            v-if="gameStore.isRanked"
            class="ml-1"
            size="small"
            icon="mdi-trophy"
            data-cy="ready-button-ranked-icon"
            aria-hidden="true"
          />
        </v-btn>
      </v-col>
      <v-spacer />
    </v-row>
    <BaseSnackbar
      v-model="gameStore.showIsRankedChangedAlert"
      :timeout="2000"
      :message="`${t('lobby.rankedChangedAlert')} ${gameStore.isRanked ? t('lobby.ranked') : t('lobby.casual')}`"
      color="surface-1"
      data-cy="edit-snackbar"
      location="top right"
    />
  </v-container>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import LobbyPlayerIndicator from '@/components/LobbyPlayerIndicator.vue';
import BaseSnackbar from '@/components/Global/BaseSnackbar.vue';

export default {
  name: 'LobbyView',
  components: {
    LobbyPlayerIndicator,
    BaseSnackbar
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      readying: false,
    };
  },
  computed: {
    ...mapStores(useGameStore, useAuthStore),
    gameId() {
      return this.gameStore.id;
    },
    gameName() {
      return this.gameStore.name;
    },
    iAmReady() {
      return this.gameStore.myPNum === 0 ? this.gameStore.p0Ready : this.gameStore.p1Ready;
    },
    readyButtonText() {
      return this.t(this.iAmReady ? 'lobby.unready' : 'lobby.ready');
    },
  },
  watch: {
    opponentUsername(newVal) {
      if (newVal) {
        if (this.$refs.enterLobbySound.readyState === 4) {
          this.$refs.enterLobbySound.play();
        }
      } else {
        if (this.$refs.leaveLobbySound.readyState === 4) {
          this.$refs.leaveLobbySound.play();
        }
      }
    },
  },
  methods: {
    async ready() {
      this.readying = true;
      await this.gameStore.requestReady();
      this.readying = false;
    },
    async setIsRanked() {
      await this.gameStore.requestSetIsRanked({
          isRanked: this.gameStore.isRanked,
      });
    },
    leave() {
      this.gameStore
        .requestLeaveLobby()
        .then(() => {
          this.$router.push('/');
        })
        .catch((err) => {
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
.lobby-ranked-text {
  color: var(--v-neutral-darken2);
}
</style>
