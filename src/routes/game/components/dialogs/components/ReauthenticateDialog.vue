<template>
  <div>
    <BaseDialog
      id="reauthenticate-dialog"
      v-model="show"
      :title="t('game.dialogs.reauthentication.reconnectToGame')"
    >
      <template #body>
        <p class="mb-4">
          {{ t('game.dialogs.reauthentication.youHaveDisconnected') }}
        </p>
        <form ref="form" @submit.prevent="login">
          <v-text-field
            v-model="username"
            variant="outlined"
            :density="$vuetify.display.mdAndDown && 'compact'"
            :label="t('game.dialogs.reauthentication.username')"
            :loading="isLoggingIn"
            data-cy="username"
          />
          <v-text-field
            v-model="password"
            variant="outlined"
            :label="t('game.dialogs.reauthentication.password')"
            :density="$vuetify.display.mdAndDown && 'compact'"
            type="password"
            :loading="isLoggingIn"
            data-cy="password"
          />
          <button type="submit" title="Submit Login Form" />
        </form>
      </template>

      <template #actions>
        <v-btn variant="text" color="primary" @click="leaveGame">
          {{ t('game.dialogs.reauthentication.leaveGame') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          data-cy="login"
          :loading="isLoggingIn"
          @click="submit"
        >
          {{ t('game.dialogs.reauthentication.login') }}
        </v-btn>
      </template>
    </BaseDialog>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { useSnackbarStore } from '@/stores/snackbar';
import BaseDialog from '@/components/BaseDialog.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'ReauthenticateDialog',
  components: {
    BaseDialog,
  },
  props: {
    modelValue: {
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
      username: '',
      password: '',
      isLoggingIn: false,
    };
  },
  computed: {
    ...mapStores(useAuthStore, useGameStore, useGameHistoryStore, useSnackbarStore),
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
  },
  methods: {
    submit() {
      this.$refs.form.requestSubmit();
    },
    async login() {
      this.isLoggingIn = true;
      try {
        await this.authStore.requestReauthenticate({
          username: this.username,
          password: this.password,
        });

        if (this.gameHistoryStore.isSpectating) {
          await this.gameStore.requestSpectate(
            this.gameStore.id,
            this.gameHistoryStore.currentGameStateIndex,
          );
        } else {
          await this.gameStore.requestGameState(this.gameStore.id);
        }
        this.snackbarStore.clear();
        this.clearForm();
        this.isLoggingIn = false;
      } catch (err) {
        this.handleError(err);
      }
    },
    handleError(message) {
      this.snackbarStore.showSnackbar = true;
      this.snackbarStore.snackMessage = this.t(message);
      this.isLoggingIn = false;
    },
    clearForm() {
      this.username = '';
      this.password = '';
    },
    leaveGame() {
      this.snackbarStore.clear();
      this.clearForm();
      this.clearSnackBar();
      this.$router.push('/');
    },
  },
};
</script>
