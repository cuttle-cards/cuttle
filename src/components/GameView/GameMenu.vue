<template>
  <div>
    <v-menu v-model="showGameMenu">
      <!-- Activator -->
      <template #activator="{ props }">
        <v-btn
          class="ml-0"
          id="game-menu-activator"
          v-bind="props"
          icon
          variant="text"
        >
          <v-icon color="neutral-lighten-2" icon="mdi-cog" />
        </v-btn>
      </template>
      <!-- Menu -->
      <v-list id="game-menu" class="bg-surface-2">
        <v-list-item data-cy="rules-open" @click="shownDialog = 'rules'"> Rules </v-list-item>
        <!-- Stop Spectating -->
        <v-list-item v-if="isSpectating" data-cy="stop-spectating" @click.stop="stopSpectate">
          Go Home
        </v-list-item>
        <!-- Concede Dialog (Initiate + Confirm) -->
        <template v-else>
          <v-list-item data-cy="concede-initiate" @click="shownDialog = 'concede'"> Concede </v-list-item>
          <v-list-item data-cy="stalemate-initiate" @click="shownDialog = 'stalemate'">
            Request Stalemate
          </v-list-item>
        </template>
      </v-list>
    </v-menu>

    <rules-dialog v-model="showRulesDialog" @open="closeMenu" @close="closeDialog" />

    <base-dialog v-model="showEndGameDialog" id="request-gameover-dialog" :title="dialogTitle">
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
    </base-dialog>
  </div>
</template>

<script>
import BaseDialog from '@/components/Global/BaseDialog.vue';
import RulesDialog from '@/components/RulesDialog.vue';
export default {
  name: 'GameMenu',
  components: {
    BaseDialog,
    RulesDialog,
  },
  data() {
    return {
      shownDialog:'',
      showGameMenu: false,      
      loading: false,
    };
  },
  props: {
    isSpectating: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
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
      await this.$store.dispatch('requestConcede');
      this.shownDialog = '';
    },
    async requestStalemate() {
      this.loading = true;
      try {
        await this.$store.dispatch('requestStalemate');
        this.$store.commit('setWaitingForOpponentToStalemate', true);
      } catch (e) {
        this.$store.commit('setWaitingForOpponentToStalemate', false);
      }
      this.loading = false;
      this.shownDialog = '';
    },
    async stopSpectate() {
      try {
        this.loading = true;
        await this.$store.dispatch('requestSpectateLeave');
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
