<template>
  <div>
    <!-- Reauthenticate-->
    <template v-if="mustReauthenticate">
      <ReauthenticateDialog v-model="mustReauthenticate" />
    </template>
    <!-- Game doesn't exist-->
    <template v-else-if="unavailableGame">
      <GameUnavailableOverlay :show="unavailableGame" />
    </template>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import ReauthenticateDialog from '@/routes/game/components/dialogs/components/ReauthenticateDialog.vue';
import GameUnavailableOverlay from '@/routes/game/components/GameUnavailableOverlay.vue';

export default {
  name: 'GameUnavailable',
  components: { ReauthenticateDialog, GameUnavailableOverlay },
  computed: {
    ...mapStores(useAuthStore, useGameStore),
    unavailableGame() {
      return !this.gameStore.id;
    },
    mustReauthenticate: {
      get() {
        return this.authStore.mustReauthenticate;
      },
      set(val) {
        this.authStore.mustReauthenticate = val;
      },
    },
  },
};
</script>
