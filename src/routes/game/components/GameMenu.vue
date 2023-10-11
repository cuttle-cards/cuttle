<template>
  <div>
    <v-menu v-model="showGameMenu">
      <!-- Activator -->
      <template #activator="{ props }">
        <v-btn
          id="game-menu-activator"
          class="ml-0"
          v-bind="props"
          icon
          variant="text"
          aria-label="Open Game Menu"
        >
          <v-icon color="neutral-lighten-2" icon="mdi-cog" aria-hidden="true" />
        </v-btn>
      </template>
      <!-- Menu -->
      <v-list id="game-menu" class="text-surface-1" bg-color="surface-2">
        <v-list-item data-cy="rules-open" @click="shownDialog = 'rules'">
          Rules
        </v-list-item>
        <!-- Stop Spectating -->
        <v-list-item v-if="isSpectating" data-cy="stop-spectating" @click.stop="stopSpectate">
          Go Home
        </v-list-item>
        <!-- Concede Dialog (Initiate + Confirm) -->
        <template v-else>
          <v-list-item data-cy="concede-initiate" @click="shownDialog = 'concede'">
            Concede
          </v-list-item>
          <v-list-item data-cy="stalemate-initiate" @click="shownDialog = 'stalemate'">
            Request Stalemate
          </v-list-item>
          <TheLanguageSelector />
        </template>
      </v-list>
    </v-menu>

    <RulesDialog v-model="showRulesDialog" @open="closeMenu" @close="closeDialog" />

    <BaseDialog id="request-gameover-dialog" v-model="showEndGameDialog" :title="dialogTitle">
      <template #body>
        <p class="pt-4 pb-8">
          {{ dialogText }}
        </p>
      </template>

      <template #actions>
        <v-btn
          data-cy="request-gameover-cancel"
          :disabled="loading"
          variant="outlined"
          color="surface-1"
          class="mr-4"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          variant="flat"
          data-cy="request-gameover-confirm"
          color="error"
          :loading="loading"
          @click="requestGameEnd"
        >
          {{ dialogTitle }}
        </v-btn>
      </template>
    </BaseDialog>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import BaseDialog from '@/components/BaseDialog.vue';
import RulesDialog from '@/routes/game/components/RulesDialog.vue';
import TheLanguageSelector from '@/components/TheLanguageSelector.vue';
export default {
  name: 'GameMenu',
  components: {
    BaseDialog,
    RulesDialog,
    TheLanguageSelector
},
  props: {
    isSpectating: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      shownDialog:'',
      showGameMenu: false,      
      loading: false,
    };
  },
  computed: {
    ...mapStores(useGameStore),
    showEndGameDialog:{
      get() {
        return this.showConcedeDialog || this.showStalemateDialog;
      },
      set(newVal) {
        if (!newVal) {
          this.showConcedeDialog = false;
          this.showStalemateDialog = false;
        }
        this.showGameMenu = false;
      },
    },
    dialogTitle() {
      return this.showConcedeDialog ? 'Concede' : 'Request Stalemate';
    },
    dialogText() {
      return this.showConcedeDialog
        ? 'The game will end and your opponent will win.'
        : 'If your opponent agrees, the game will end in a stalemate. The request will cancel if the opponent declines or either player makes a move';
    },
    buttonSize() {
      return this.$vuetify.display.mdAndDown ? 'small' : 'medium';
    },
    showRulesDialog: {
      get() {
        return this.shownDialog === 'rules';
      },
      set(val) {
      this.shownDialog = val ? 'rules' : '';
      }
    },
    showConcedeDialog(){ 
      return this.shownDialog === 'concede';
    },
    showStalemateDialog(){
      return this.shownDialog === 'stalemate';
    }
  },
  methods: {
    closeMenu() {
      this.showGameMenu = false;
    },
    closeDialog() {
      this.shownDialog = '';
    },
    requestGameEnd() {
      if (this.showConcedeDialog) {
        this.concede();
      } else {
        this.requestStalemate();
      }
    },
    async concede() {
      this.loading = true;
      await this.gameStore.requestConcede();
      this.shownDialog = '';
    },
    async requestStalemate() {
      this.loading = true;
      try {
        await this.gameStore.requestStalemate();
        this.gameStore.waitingForOpponentToStalemate = true;
      } catch (e) {
        this.gameStore.waitingForOpponentToStalemate = false;
      }
      this.loading = false;
      this.shownDialog = '';
    },
    async stopSpectate() {
      try {
        this.loading = true;
        await this.gameStore.requestSpectateLeave();
      } finally {
        this.loading = false;
        this.$router.push('/');
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.menu-button {
  width: 100%;
}
</style>
