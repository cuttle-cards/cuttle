<template>
  <v-menu v-model="showGameMenu">
    <!-- Activator -->
    <template #activator="{ on, attrs }">
      <v-btn id="game-menu-activator" v-bind="attrs" class="ma-2" icon v-on="on">
        <v-icon large color="neutral lighten-1" icon="mdi-cog" />
      </v-btn>
    </template>
    <!-- Menu -->
    <v-list id="game-menu">
      <v-list-item>
        <rules-dialog>
          <template #activator> Rules </template>
        </rules-dialog>
      </v-list-item>
      <!-- Concede Dialog (Initiate + Confirm) -->
      <v-list-item data-cy="concede-initiate" @click.stop="openConcedeDialog"> Concede </v-list-item>
      <v-list-item data-cy="stalemate-initiate" @click.stop="openStalemateDialog">
        Request Stalemate
      </v-list-item>
    </v-list>
    <v-dialog v-model="showDialog">
      <v-card id="request-gameover-dialog">
        <v-card-title>{{ dialogTitle }}?</v-card-title>
        <v-card-text> {{ dialogText }} </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            color="primary"
            data-cy="request-gameover-cancel"
            :disabled="loading"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            depressed
            variant="outlined"
            data-cy="request-gameover-confirm"
            :loading="loading"
            @click="requestGameEnd"
          >
            {{ dialogTitle }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-menu>
</template>

<script>
import RulesDialog from '@/components/RulesDialog.vue';
export default {
  name: 'GameMenu',
  components: { RulesDialog },
  data() {
    return {
      showGameMenu: false,
      showConcedeDialog: false,
      showStalemateDialog: false,
      loading: false,
    };
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
  },
};
</script>
