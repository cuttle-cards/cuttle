<template>
  <div>
    <base-dialog v-model="show" id="reauthenticate-dialog" title="Reconnect to Game">

      <template #body>
        <p>You have disconnected due to inactivity. Log in again to resume your session</p>
        <!-- Login Form -->
        <v-text-field
          v-model="username"
          variant="outlined"
          :dense="$vuetify.display.mdAndDown"
          label="Username"
          data-cy="username"
          @keydown.enter="login"
        />
        <v-text-field
          v-model="password"
          variant="outlined"
          label="Password"
          :dense="$vuetify.display.mdAndDown"
          type="password"
          data-cy="password"
          @keydown.enter="login"
        />
      </template>

      <template #actions>
        <v-btn variant="text" color="primary" @click="leaveGame">
          Leave Game
        </v-btn>
        <v-btn color="primary" variant="flat" data-cy="login" @click="login">
          Log In
        </v-btn>
      </template>
    </base-dialog>

    <BaseSnackbar
      v-model="showSnackBar"
      :message="snackBarMessage"
      color="error"
      @clear="clearSnackBar"
    />
  </div>
</template>

<script>
import BaseDialog from '@/components/Global/BaseDialog.vue';
import BaseSnackbar from '@/components/Global/BaseSnackbar.vue';

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
  data() {
    return {
      username: this.$store.state.auth.username,
      password: '',
      isLoggingIn: true,
      showSnackBar: false,
      snackBarMessage: '',
    };
  },
  computed: {
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
    login() {
      this.isLoggingIn = true;
      this.$store
        .dispatch('requestReauthenticate', {
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
