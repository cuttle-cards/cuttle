<template>
  <div>
    <BaseDialog id="reauthenticate-dialog" v-model="show" :title="t('game.dialogs.reauthentication.reconnectToGame')">
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

    <BaseSnackbar
      v-model="showSnackBar"
      :message="snackBarMessage"
      data-cy="reauth-snackbar"
      @clear="clearSnackBar"
    />
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import BaseDialog from '@/components/BaseDialog.vue';
import BaseSnackbar from '@/components/BaseSnackbar.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'ReauthenticateDialog',
  components: {
    BaseDialog,
    BaseSnackbar,
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
      showSnackBar: false,
      snackBarMessage: '',
    };
  },
  computed: {
    ...mapStores(useAuthStore),
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
    login() {
      this.isLoggingIn = true;
      this.authStore.requestReauthenticate({
        username: this.username,
        password: this.password,
      })
        .then(() => {
          this.clearSnackBar();
          this.clearForm();
          this.isLoggingIn = false;
        })
        .catch(this.handleError);
    },
    handleError(message) {
      this.showSnackBar = true;
      this.snackBarMessage = message;
      this.isLoggingIn = false;
    },
    clearSnackBar() {
      this.showSnackBar = false;
      this.snackBarMessage = '';
    },
    clearForm() {
      this.username = '';
      this.password = '';
    },
    leaveGame() {
      this.clearForm();
      this.clearSnackBar();
      this.$router.push('/');
    },
  },
};
</script>
