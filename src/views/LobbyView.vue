<template>
  <v-container id="lobby-wrapper">
    <v-row>
      <v-col sm="3" md="1" class="my-auto">
        <img id="logo" alt="Cuttle logo" src="/img/logo.png">
      </v-col>
      <v-col md="8" class="my-auto">
        <h1>
          Lobby for {{ gameName }}
          <small v-if="gameStore.isRanked" class="lobby-ranked-text">
            (Ranked <v-icon v-if="gameStore.isRanked" size="medium">mdi-trophy</v-icon>)
          </small>
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col offset="5">
        <v-switch
          v-model="gameStore.isRanked"
          :label="gameStore.isRanked ? 'Ranked' : 'Normal'"
          data-cy="edit-game-ranked-switch"
          color="primary"
          @update:model-value="modeChange"
        />
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
          EXIT
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
          />
        </v-btn>
      </v-col>
      <v-spacer />
    </v-row>
    <BaseSnackbar
      v-model="gameStore.rankAlert"
      :timeout="2000"
      :message="`Game Mode: ${gameStore.isRanked ? 'Ranked' : 'Normal'}`"
      color="surface-1"
      data-cy="edit-snackbar"
      location="top"
    />
  </v-container>
</template>

<script>
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
      return this.gameStore.myPNum === 0
        ? this.gameStore.p0Ready
        : this.gameStore.p1Ready;
    },
    readyButtonText() {
      return this.iAmReady ? 'UNREADY' : 'READY';
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
    async modeChange() {
      await this.gameStore.editMode({
          isRanked: this.gameStore.isRanked,
      });
    },
    leave() {
      this.gameStore.requestLeaveLobby()
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
