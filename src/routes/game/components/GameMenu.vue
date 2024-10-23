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
          {{ t('game.menus.gameMenu.rules') }}
        </v-list-item>
        <!-- Stop Spectating -->
        <v-list-item v-if="isSpectating" data-cy="stop-spectating" @click.stop="stopSpectate">
          {{ t('game.menus.gameMenu.home') }}
        </v-list-item>
        <!-- Concede Dialog (Initiate + Confirm) -->
        <template v-else>
          <v-list-item data-cy="concede-initiate" @click="shownDialog = 'concede'">
            {{ t('game.menus.gameMenu.concede') }}
          </v-list-item>
          <v-list-item data-cy="stalemate-initiate" @click="shownDialog = 'stalemate'">
            {{ t('game.menus.gameMenu.stalemate') }}
          </v-list-item>
        </template>
        <TheLanguageSelector />
        <v-list-item data-cy="refresh" prepend-icon="mdi-refresh" @click="refresh">
          {{ t('game.menus.gameMenu.refresh') }}
        </v-list-item>
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
          {{ t('game.menus.gameMenu.cancel') }}
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
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import BaseDialog from '@/components/BaseDialog.vue';
import RulesDialog from '@/routes/game/components/dialogs/components/RulesDialog.vue';
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
  setup() {
    const { t } = useI18n();
    return { t };
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
    ...mapStores(useAuthStore),
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
      return this.t( this.showConcedeDialog ? 'game.menus.gameMenu.concede' : 'game.menus.gameMenu.stalemate');
    },
    dialogText() {
      return this.t(this.showConcedeDialog
        ? 'game.menus.gameMenu.concedeDialog'
        : 'game.menus.gameMenu.stalemateDialog');
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
      this.loading = false;
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
    async refresh() {
      await this.authStore.reconnectSocket();
    }
  },
};
</script>
<style lang="scss" scoped>
.menu-button {
  width: 100%;
}
</style>
