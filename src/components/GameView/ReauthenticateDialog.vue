<template>
  <v-dialog v-model="show" persistent max-width="650">
    <v-card id="reauthenticate-dialog">
      <v-card-title>Reconnect to Game</v-card-title>
      <form @submit.prevent="login">
        <v-card-text>
          <p>You have disconnected due to inactivity. Log in again to resume your session</p>
          <!-- Login Form -->
          <v-text-field
            v-model="username"
            variant="outlined"
            :dense="$vuetify.display.mdAndDown"
            label="Username"
            data-cy="username"
          />
          <v-text-field
            v-model="password"
            variant="outlined"
            label="Password"
            :dense="$vuetify.display.mdAndDown"
            type="password"
            data-cy="password"
          />
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn variant="text" color="primary" @click="leaveGame">
            Leave Game
          </v-btn>
          <v-btn color="primary" variant="flat" data-cy="login" type="submit">
            Log In
          </v-btn>
        </v-card-actions>
      </form>
    </v-card>
    <BaseSnackbar
      v-model="showSnackBar"
      color="error"
      @clear="clearSnackBar">
      {{ snackBarMessage }}
    </BaseSnackbar>
  </v-dialog>
</template>

<script>
import BaseSnackbar from '@/components/Global/BaseSnackbar.vue';

export default {
  name: 'ReauthenticateDialog',
  components: {
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
