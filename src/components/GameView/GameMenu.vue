<template>
  <div>
    <v-menu v-model="showGameMenu">
      <!-- Activator -->
      <template #activator="{ props }">
        <v-btn class="ml-0" id="game-menu-activator" v-bind="props" icon variant="text">
          <v-icon color="neutral-lighten-2" icon="mdi-cog" />
        </v-btn>
      </template>
      <!-- Menu -->
      <v-list id="game-menu">
        <v-list-item data-cy="rules-open" @click.stop="showRulesDialog = true">
          Rules
          <rules-dialog :hideActivator="true" :show="showRulesDialog" @close="showRulesDialog = false" />
        </v-list-item>
        <!-- Concede Dialog (Initiate + Confirm) -->
        <v-item-group v-if="!isSpectating">
          <v-list-item data-cy="concede-initiate" @click.stop="openConcedeDialog"> Concede</v-list-item>
          <v-list-item data-cy="stalemate-initiate" @click.stop="openStalemateDialog">
            Request Stalemate
          </v-list-item>
        </v-item-group>

        <!-- Stop Spectating -->
        <v-list-item v-else data-cy="stop-spectating" @click.stop="stopSpectate"> Go Home</v-list-item>
      </v-list>
    </v-menu>

    <base-dialog v-model="showDialog" id="request-gameover-dialog" :title="dialogTitle">
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
      showGameMenu: false,
      showConcedeDialog: false,
      showRulesDialog: false,
      showStalemateDialog: false,
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
    showDialog: {
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
  },
  methods: {
    openConcedeDialog() {
      this.showConcedeDialog = true;
      this.showStalemateDialog = false;
      this.showGameMenu = false;
    },
    openStalemateDialog() {
      this.showStalemateDialog = true;
      this.showConcedeDialog = false;
      this.showGameMenu = false;
    },
    closeDialog() {
      this.showConcedeDialog = false;
      this.showStalemateDialog = false;
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
      this.showConcedeDialog = false;
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
      this.showStalemateDialog = false;
    },
    async stopSpectate() {
      this.loading = true;
      await this.$store.dispatch('requestSpectateLeave');
      this.$router.push('/');
    },
  },
};
</script>
