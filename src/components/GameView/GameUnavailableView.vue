<template>
  <div>
    <!-- Reauthenticate-->
    <template v-if="mustReauthenticate">
      <reauthenticate-dialog v-model="mustReauthenticate" />
    </template>
    <!-- Game doesn't exist-->
    <template v-else>
      <game-unavailable-overlay :show="unavailableGame" />
    </template>
  </div>
</template>

<script>
import ReauthenticateDialog from '@/components/GameView/ReauthenticateDialog.vue';
import GameUnavailableOverlay from './GameUnavailableOverlay.vue';

export default {
  name: 'GameUnavailable',
  components: { ReauthenticateDialog, GameUnavailableOverlay },
  computed: {
    unavailableGame() {
      return !this.$store.state.game.id;
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
