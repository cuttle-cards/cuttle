<template>
  <BaseDialog 
    v-model="errorLoadingDialogVisible"
    title="Error Joining Lobby"
  >
    <template #body>
      <span>Oops. </span><br>
      <span>Could not join that game at this time. Go home to find another one</span>
    </template>
    <template #actions>
      <v-btn
        color="surface-2"
        variant="flat"
        @click="goHome"
      >
        Go Home
      </v-btn>
    </template>
  </BaseDialog>
  <v-skeleton-loader v-if="loading" type="article" />
  <v-container id="lobby-wrapper">
    <v-row>
      <v-col sm="3" md="1" class="my-auto">
        <img id="logo" alt="Cuttle logo" :src="logoSrc">
      </v-col>
      <v-col md="8" class="my-auto">
        <h1 class="d-sm-flex align-center">
          {{ `${t('lobby.lobbyFor')}  ${gameName}` }}
          <small class="lobby-ranked-text d-flex align-center">
            <v-switch
              v-model="gameStore.isRanked"
              class="mx-4"
              :label="gameStore.isRanked ? t('global.ranked') : t('global.casual')"
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
        <LobbyPlayerIndicator
          :player-username="authStore.username"
          :player-ready="iAmReady"
          data-cy="my-indicator"
        />
      </v-col>
      <v-col offset="1">
        <audio ref="enterLobbySound" src="/sounds/lobby/enter-lobby.mp3" />
        <audio ref="leaveLobbySound" src="/sounds/lobby/leave-lobby.mp3" />
        <LobbyPlayerIndicator
          :player-username="gameStore.opponentUsername"
          :player-ready="gameStore.opponentIsReady"
          data-cy="opponent-indicator"
        />
      </v-col>
    </v-row>
    <!-- Buttons -->
    <v-row class="mt-4">
      <v-spacer v-if="$vuetify.display.smAndUp" />
      <v-col sm="3" cols="6" offset-sm="1">
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
      <v-col sm="3" cols="6">
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
      <v-spacer v-if="$vuetify.display.smAndUp" />
    </v-row>
    <BaseSnackbar
      v-model="gameStore.showIsRankedChangedAlert"
      :timeout="2000"
      :message="`${t('lobby.rankedChangedAlert')} ${gameStore.isRanked ? t('global.ranked') : t('global.casual')}`"
      color="surface-1"
      data-cy="edit-snackbar"
    />
  </v-container>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import { useThemedLogo } from '@/composables/themedLogo';
import LobbyPlayerIndicator from '@/routes/lobby/components/LobbyPlayerIndicator.vue';
import BaseSnackbar from '@/components/BaseSnackbar.vue';
import BaseDialog from '@/components/BaseDialog.vue';

export default {
  name: 'LobbyView',
  components: {
    LobbyPlayerIndicator,
    BaseSnackbar,
    BaseDialog,
  },
  setup() {
    const { t } = useI18n();
    const { logoSrc } = useThemedLogo();
    return {
      t,
      logoSrc,
    };
  },
  data() {
    return {
      readying: false,
      loading: false,
      errorLoadingDialogVisible: false,
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
  async created() {
    if (!this.gameStore.id || this.gameStore.id === null) {
      this.subscribeToGame(window.location.hash.split('lobby/')[1]);
      this.$router.push(`/lobby/${window.location.hash.split('lobby/')[1]}`);
    }
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
    subscribeToGame(gameId) {
      this.loading = true;
      this.gameStore
        .requestSubscribe(Number(gameId))
        .then(() => {
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.errorLoadingDialogVisible = true;
          console.log(err);
        });
    },
    goHome() {
      this.$router.push('/');
    }
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
