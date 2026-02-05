<template>
  <div>
    <BaseMenu v-model="showGameMenu">
      <!-- Activator -->
      <template #activator="{ props }">
        <v-btn
          id="game-menu-activator"
          class="ml-0"
          v-bind="{ ...props }"
          icon
          variant="text"
          aria-label="Open Game Menu"
        >
          <v-icon color="neutral-lighten-2" icon="mdi-cog" aria-hidden="true" />
        </v-btn>
      </template>
      <template #body="{ listProps }">
        <v-list id="game-menu" v-bind="listProps">
          <v-list-item data-cy="rules-open" prepend-icon="mdi-information" @click="shownDialog = 'rules'">
            {{ t('game.menus.gameMenu.rules') }}
          </v-list-item>
          <!-- Stop Spectating -->
          <v-list-item
            v-if="isSpectating"
            data-cy="stop-spectating"
            prepend-icon="mdi-home"
            @click.stop="stopSpectate"
          >
            {{ t('game.menus.gameMenu.home') }}
          </v-list-item>
          <!-- Concede Dialog (Initiate + Confirm) -->
          <template v-else>
            <v-list-item
              data-cy="concede-initiate"
              prepend-icon="mdi-flag-variant-outline"
              @click="shownDialog = 'concede'"
            >
              {{ t('game.menus.gameMenu.concede') }}
            </v-list-item>
            <v-list-item data-cy="stalemate-initiate" prepend-icon="mdi-handshake" @click="shownDialog = 'stalemate'">
              {{ t('game.menus.gameMenu.stalemate') }}
            </v-list-item>
          </template>
    
          <v-list-item
            v-if="!clipCopiedToClipboard"
            data-cy="clip-highlight"
            prepend-icon="mdi-movie-open"
            @click.stop="clipHighlight"
          >
            {{ t('game.menus.gameMenu.clipHighlight') }}
          </v-list-item>
          <v-list-item v-else data-cy="highlight-copied" prepend-icon="mdi-check-bold">
            {{ t('game.menus.gameMenu.highlightCopied') }}
          </v-list-item>
          <TheLanguageSelector />
          <v-list-item data-cy="refresh" prepend-icon="mdi-refresh" @click="refresh">
            {{ t('game.menus.gameMenu.refresh') }}
          </v-list-item>
        </v-list>
      </template>
      <!-- Menu -->
    </BaseMenu>

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
          color="game-board"
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
import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import { useGameHistoryStore } from '@/stores/gameHistory';
import BaseDialog from '@/components/BaseDialog.vue';
import RulesDialog from '@/routes/game/components/dialogs/components/RulesDialog.vue';
import TheLanguageSelector from '@/components/TheLanguageSelector.vue';
import BaseMenu from '@/components/BaseMenu.vue';
export default {
  name: 'GameMenu',
  components: {
    BaseMenu,
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
  emits: [ 'handle-error' ],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      shownDialog:'',
      showGameMenu: false,      
      loading: false,
      clipCopiedToClipboard: false,
    };
  },
  computed: {
    ...mapStores(useAuthStore, useGameStore, useGameHistoryStore),
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
  watch: {
    showGameMenu() {
      this.clipCopiedToClipboard = false;
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
      } catch (e) {
        this.$emit('handle-error', e ?? 'Error requesting stalemate');
      }
      this.loading = false;
      this.shownDialog = '';
    },
    async clipHighlight() {
      try {
        await navigator.clipboard.writeText(this.gameHistoryStore.clipUrl);
        this.clipCopiedToClipboard = true;
      } catch (err) {
        this.$emit('handle-error', 'Could not copy highlight link to clipboard');
      }
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
  }
};
</script>
<style lang="scss" scoped>
.menu-button {
  width: 100%;
}
</style>
