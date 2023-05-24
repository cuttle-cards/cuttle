<template>
  <div>
    <!-- Reauthenticate-->
    <template v-if="mustReauthenticate">
      <reauthenticate-dialog v-model="mustReauthenticate" />
    </template>
    <!-- Game doesn't exist-->
    <template v-else>
      <v-overlay
        data-cy="unavailable-game-overlay"
        id="unavailable-game-scrim"
        v-model="unavailableGame"
        class="game-overlay text-center d-flex justify-center align-center"
      >
        <div class="overlay-header">
          <h1 :class="[this.$vuetify.display.xs === true ? 'text-h5' : 'text-h3', ['font-weight-bold']]">
            Oops!
          </h1>
          <p>Looks like this game isn't available</p>
        </div>
        <v-btn
          color="secondary"
          class="mt-4"
          data-cy="leave-unavailable-game-button"
          :loading="leavingGame"
          @click="this.$router.push('/')"
        >
          Go Home
        </v-btn>
      </v-overlay>
    </template>
  </div>
</template>

<script>
import ReauthenticateDialog from '@/components/GameView/ReauthenticateDialog.vue';

export default {
  name: 'GameUnavailable',
  components: { ReauthenticateDialog },
  computed: {
    unavailableGame() {
      return !this.$store.game;
    },
    mustReauthenticate: {
      get() {
        return this.$store.state.auth.mustReauthenticate;
      },
      set(val) {
        this.$store.commit('setMustReauthenticate', val);
      },
    },
  },
};
</script>

<style scoped lang="scss">
:deep(.v-overlay__content) {
  left: 0;
}
.game-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.overlay-header {
  font-weight: bold;
  background-color: rgba(var(--v-theme-surface-2));
  color: rgba(var(--v-theme-surface-1));
  padding: 24px;
  text-align: center;
  width: 100vw;
}
</style>
