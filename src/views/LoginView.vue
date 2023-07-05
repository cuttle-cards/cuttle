<template>
  <section>
    <v-container id="login-container" class="container">
      <img id="logo" alt="Cuttle logo" src="/img/logo.png" />
      <v-row>
        <!-- Left side form -->
        <v-col id="username-login-form" :cols="$vuetify.display.mdAndUp ? 8 : 12" >
          <p class="text-h4 text-center font-weight-medium mb-10 ">
            {{ formHeaderText }}
          </p>

          <form @submit.prevent="submitLogin" class="mx-auto" >
            <label for="username" class="text-h5 font-weight-medium " >Username</label>
            <v-text-field
              id="username"
              class="mt-4"
              v-model="username"
              variant="solo"
              :dense="$vuetify.display.mdAndDown ? true : false"
              data-cy="username"
              autocomplete="username"
            />
            <label for="password" class="text-h5 font-weight-medium">Password</label>
            <v-text-field
              id="password"
              class="mt-4 "
              v-model="pw"
              variant="solo"
              :dense="$vuetify.display.mdAndDown ? true : false"
              type="password"
              data-cy="password"
              :autocomplete="isLoggingIn ? 'current-password' : 'new-password'"
            />
         
            <div id="login-button-container" class="d-flex justify-space-between align-center flex-wrap">
              <v-btn
                class="px-16"
                :loading="loading"
                :color=" disabledLogin ? 'disabled' : 'primary'"
                type="submit"
                size="x-large"
                :disabled="disabledLogin"
                text-color="white"
                data-cy="submit"
              >
                {{ buttonText }}
              </v-btn>
              <v-btn
                class="px-0 text-h6"
                color="black"
                variant="text"
                data-cy="switch-mode"
                @click="switchMode"
              >
                {{ switchLabelText }}
              </v-btn>
            </div>
            <v-btn 
              class="w-100 my-10 text-h6 h-auto py-2 "
              size="large"
              color="secondary"  
            >
            
              <img id="discord" :src="discord" />
              Join our discord<br>community
            </v-btn>
          </form>
        
          <BaseSnackbar
            v-model="showSnackBar"
            :message="snackBarMessage"
            color="error"
            data-cy="auth-snackbar"
            @clear="clearSnackBar"
          />

        </v-col>
      </v-row>
    </v-container>
  </section>
  <section>
    <v-container fluid="true" class="quote text-h5 text-center d-flex flex-column align-center">
      <blockquote>
        "Cuttle is a sharp, fast game built entirely on excellent mechanics. It is the sort of game - had I
        known about it in college - I would have worn decks ragged through play"
      </blockquote>  
      <cite class="my-8">Richard Garfield - <br>Creator of Magic: The Gathering</cite>
    </v-container>
  </section>
</template>

<script>
import { ROUTE_NAME_LOGIN, ROUTE_NAME_SIGNUP } from '@/router';
import BaseSnackbar from '@/components/Global/BaseSnackbar.vue';
import discord from '../../public/img/discord.svg';

export default {
  name: 'LoginView',
  components: {
    BaseSnackbar,
  },
  data() {
    return {
      discord: discord,
      username: '',
      pw: '',
      showSnackBar: false,
      snackBarMessage: '',
      loading: false,
    };
  },
  computed: {
    isLoggingIn() {
      return this.$route.name === ROUTE_NAME_LOGIN;
    },
    formHeaderText() {
      if (this.isLoggingIn) {
        return 'Log In to get Started!';
      }
      return 'Sign up now to start playing and get ready to dive into the world of Cuttle.';
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
    disabledLogin(){
      return this.pw.length < 8 && this.username < 1;
    }
  },
  methods: {
    async submitLogin() {
      this.loading = true;
      const action = this.isLoggingIn ? 'requestLogin' : 'requestSignup';
      try {
        await this.$store.dispatch(action, {
          username: this.username,
          password: this.pw,
        });
        this.handleLogin();
      } catch (err) {
        this.handleError(err);
      }
    },
    switchMode() {
      this.pw = '';
      if (this.isLoggingIn) {
        this.$router.push({ name: ROUTE_NAME_SIGNUP });
      } else {
        this.$router.push({ name: ROUTE_NAME_LOGIN });
      }
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

form{
  max-width: 540px;
}

.quote{
  background-color: #425CE6;
  color: white;
  width: 100%;
  margin: 0;
  padding: 40px 0px;
}

.quote blockquote{
  color:#FCFDFC ;
  max-width: 667px;
  text-align: center;
}

#logo {
  height: 20vh;
  margin: 60px auto 40px auto;
}

#discord{
  max-height: 48px;
  margin-right: 18px;
}

#username-login-form {
  padding: 0;
  max-width: 640px;
  margin: 0 auto;
}

@media (orientation: landscape) and (max-width: 960px) {
  #logo {
    width: 64px;
    height: 64px;
    margin: -16px auto -32px;
  }
}
</style>
