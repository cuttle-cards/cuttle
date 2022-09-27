<template>
  <v-container id="login-container" class="container">
    <img id="logo" alt="Cuttle logo" src="../img/logo.png" />
    <v-row>
      <!-- Left side form -->
      <v-col id="username-login-form" sm="9" lg="5">
        <h1 class="gradient-text">
          {{ buttonText }}
        </h1>
        <form @submit.prevent="submitLogin">
          <v-text-field
            v-model="username"
            outlined
            :dense="$vuetify.breakpoint.mdAndDown ? true : false"
            hint="Username"
            data-cy="username"
            autocomplete="username"
            placeholder="Username"
          />
          <v-text-field
            v-model="pw"
            outlined
            hint="Password"
            :dense="$vuetify.breakpoint.mdAndDown ? true : false"
            type="password"
            data-cy="password"
            :autocomplete="isLoggingIn ? 'current-password' : 'new-password'"
            placeholder="Password"
          />
          <div id="login-button-container">
            <v-btn :loading="loading" color="primary" block type="submit" data-cy="submit">
              {{ buttonText }}
            </v-btn>
          </div>
        </form>
        <div id="switch-button-container">
          <v-btn text color="primary" data-cy="switch-mode" @click="switchMode">
            {{ switchLabelText }}
          </v-btn>
        </div>
        <v-snackbar
          v-model="showSnackBar"
          color="error"
          content-class="d-flex justify-space-between align-center"
          data-cy="auth-snackbar"
        >
          {{ snackBarMessage }}
          <v-icon data-cy="close-snackbar" @click="clearSnackBar"> mdi-close </v-icon>
        </v-snackbar>
      </v-col>
    </v-row>
    <v-row class="mt-8">
      <h1 class="gradient-text">What is Cuttle?</h1>
    </v-row>
    <v-row class="mt-0">
      <v-col md="6" sm="12" class="d-flex justify-start flex-column mt-4">
        <blockquote class="quote">
          "Cuttle is a sharp, fast game built entirely on excellent mechanics. It is the sort of game - had I
          known about it in college - I would have worn decks ragged through play"
          <cite>Richard Garfield - Creator of Magic: The Gathering</cite>
        </blockquote>
        <p>
          Cuttle is a 2 player battle card game played with a standard 52-card deck of cards. It has the
          strategic nuance of trading card games like Magic, with the elegant balance of a standard deck--and
          you can play it for free! Test your mettle in the deepest cardgame under the sea!
        </p>
        <p>
          Be the first to score 21 points in this explosive battle of wits. Mount a valient offense while
          disupting your opponent with dastardly tricks. Do you have what it takes to become the Lord of the
          Deep?
        </p>
        <v-btn
          text
          color="primary"
          to="rules"
          class="mt-4 align-self-center"
          max-width="500"
          data-cy="rules-link"
        >
          Learn the Rules
        </v-btn>
      </v-col>
      <v-col md="6" sm="12" class="mt-2 mb-4">
        <v-img
          src="../img/game_images/cuttle_one_off_ace.png"
          alt="Cuttle Game Ace One-Off"
          max-width="600px"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LoginSignup',
  data() {
    return {
      username: '',
      pw: '',
      isLoggingIn: true,
      showSnackBar: false,
      snackBarMessage: '',
      loading: false,
    };
  },
  computed: {
    isSigningUp() {
      return !this.isLoggingIn;
    },
    buttonText() {
      if (this.isLoggingIn) {
        return 'Log In';
      }
      return 'Sign Up';
    },
    switchLabelText() {
      if (this.isLoggingIn) {
        return "Don't have an account?";
      }
      return 'Already have an account?';
    },
  },
  mounted() {
    this.$store.dispatch('requestLogout');
  },
  methods: {
    submitLogin() {
      this.loading = true;
      if (this.isLoggingIn) {
        this.$store
          .dispatch('requestLogin', {
            username: this.username,
            password: this.pw,
          })
          .then(this.handleLogin)
          .catch(this.handleError);
      } else {
        this.$store
          .dispatch('requestSignup', {
            username: this.username,
            password: this.pw,
          })
          .then(this.handleLogin)
          .catch(this.handleError);
      }
    },
    switchMode() {
      this.isLoggingIn = !this.isLoggingIn;
      this.pw = '';
    },
    handleLogin() {
      this.username = '';
      this.pw = '';
      this.loading = false;
      this.$router.push('/');
    },
    handleError(message) {
      this.showSnackBar = true;
      this.snackBarMessage = message;
      this.loading = false;
    },
    clearSnackBar() {
      this.showSnackBar = false;
      this.snackBarMessage = '';
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  width: 75%;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

#logo {
  height: 20vh;
  margin: 0 auto;
}

#username-login-form {
  margin: 10px auto;
}

#login-container button.v-btn {
  padding: 0 32px 0;
}
#login-button-container {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
}

#switch-button-container {
  display: flex;
  position: relative;
  width: 100%;
  justify-content: center;
  margin-top: 16px;
}
blockquote.quote {
  padding: 0px 16px;
  border-left: 2px solid var(--v-neutral-base);
  margin: 16px 0;
  & cite {
    display: block;
  }
}
@media (orientation: landscape) and (max-width: 960px) {
  #logo {
    width: 64px;
    height: 64px;
    margin: -16px auto -32px;
  }
}
</style>
