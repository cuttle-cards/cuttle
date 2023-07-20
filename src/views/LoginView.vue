<template>
  <div class="loginViewContainer">
    <!--////////////////////////// 
     /////Welcome Section ///// 
    //////////////////////////-->
    <section v-if="!isLoggingIn">
      <v-container fluid id="welcome-container" class="welcomeContainer">
        <nav class="d-flex justify-space-between align-center mb-2">
          <img class="cardLogo" src="/img/loginView/logo-cards-behind.svg">
          <v-btn  
            variant="text"
            class="text-h6"
            @click ="$refs.usernameInput.focus()"
          >
            Sign up 
            <v-icon icon="mdi-account-circle" color="white" class="ml-2"/>
          </v-btn>        
        </nav>

        <div class="d-flex h-75 flex-column justify-space-around align-center mt-2">
          <h1>Welcome to Cuttle.Cards</h1>
          <p class="text-h4 mb-4">The card game that will have you hooked from the first hand!</p>
        
          <div class="video-container__wrapper">
            <div class="video-container">
              <iframe
                class="video-container__video"
                src="https://www.youtube.com/embed/qOqkNbhMdsI"
                title="Cuttle Game Tutorial -- Youtube Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
            <!-- Grouped for the ease of styling -->
            <v-btn
              class="w-100 mt-8"
              size='x-large'
              to="/rules"
              color="newPrimary"
              data-cy="rules-link"
            >
              Read The Rules
            </v-btn>
          </div>
        </div>    
      </v-container>
    </section>

    <!--////////////////////////// 
     /////Login Section /////// 
    //////////////////////////-->

    <section>
      <v-container id="login-container" class="container">
        <img id="logo" alt="Cuttle logo" src="/img/logo.png" />
        <v-row>
          <!-- Left side form -->
          <v-col id="username-login-form" :cols="$vuetify.display.mdAndUp ? 8 : 12" >
            <p class="text-h4 text-center font-weight-medium mb-10 ">
              {{ formHeaderText }}
            </p>

            <v-form
              id="login"  
              v-model="isFormValid"
              class="mx-auto loginForm"
              @submit.prevent="submitLogin"
            >
              <label for="username" class="text-body-1 font-weight-bold">Username</label>
              <v-text-field
                id="username"
                ref="usernameInput"
                v-model="username"
                class="mt-4"
                variant="solo"
                :rules="usernameRules"
                :dense="$vuetify.display.mdAndDown ? true : false"
                autocomplete="username"
                data-cy="username"
              />

              <label for="password" class="text-body-1 font-weight-bold">Password</label>
              <v-text-field
                id="password"
                v-model="pw"
                class="my-4"
                variant="solo"
                :rules="passwordRules"
                :dense="$vuetify.display.mdAndDown ? true : false"
                :type="showPass ? 'text' : 'password'"
                :autocomplete="isLoggingIn ? 'current-password' : 'new-password'"
                :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                data-cy="password"
                @click:append-inner="showPass = !showPass"
              />
         
              <div
                id="login-button-container"
                class="d-flex flex-column flex-md-row
             justify-space-between align-center flex-wrap"
              >
                <v-btn
                  class="px-16"
                  :loading="loading"
                  :disabled="!isFormValid"
                  :color=" isFormValid ? 'newPrimary' : 'disabled'"
                  type="submit"
                  size="x-large"
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
                color="newSecondary"  
                href="https://discord.com/invite/9vrAZ8xGyh"
                target="_blank"
              >
                <img class="discord" src="/img/loginView/logo-discord.svg" />
                Join our discord<br>community
              </v-btn>

            </v-form>
        
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
    
    <!--///////////////////////// 
     ///BlockQuote Section////
    /////////////////////////-->
    <section>
      <v-container fluid class="quote text-h5 text-center d-flex flex-column align-center">
        <blockquote>
          "Cuttle is a sharp, fast game built entirely on excellent mechanics. It is the sort of game - had I
          known about it in college - I would have worn decks ragged through play"
        </blockquote> 
        <br> 
        <cite>Richard Garfield - <br>Creator of Magic: The Gathering</cite>
      </v-container>
    </section>

    <section>
      <v-container>
        <v-col :cols="$vuetify.display.mdAndUp ? 10 : 12" class="mx-auto">
          <div class="d-flex flex-md-row flex-column align-center text-h5">
            <p class="px-8">
              Cuttle is a 2 player battle card game played with a 
              standard 52-card deck of cards. It has the strategic 
              nuance of trading card games like Magic, with the 
              elegant balance of a standard deck--
              and you can play it for free! Test your mettle in 
              the deepest cardgame under the sea!
            </p>
            <img class="w-50 h-50 my-6" src="/img/loginView/game-screenshot-1.png" >
          </div>
        </v-col>
        <v-col :cols="$vuetify.display.mdAndUp ? 10 : 12" class="mx-auto">
          <div class="d-flex flex-md-row flex-column align-center text-h5 my-10">
            <img class="w-50 h-50 my-6" src="/img/loginView/game-screenshot-2.png" >
            <p class="px-8">
              Be the first to score 21 points in this explosive battle of wits. 
              Mount a valient offense while disupting your opponent with dastardly tricks. 
              Do you have what it takes to become the Lord of the Deep?
            </p>
          </div>
        </v-col>
      </v-container>
    </section>
  </div>
</template>

<script>
import { ROUTE_NAME_LOGIN, ROUTE_NAME_SIGNUP } from '@/router';
import BaseSnackbar from '@/components/Global/BaseSnackbar.vue';

export default {
  name: 'LoginView',
  components: {
    BaseSnackbar,
  },
  data() {
    return {
      username: '',
      pw: '',
      showSnackBar: false,
      snackBarMessage: '',
      loading: false,
      showPass: false,
      isFormValid:false,
      usernameRules:[value => {
        if(value.match(/^[\w.@-]+$/)) return true;
        return 'Username must contain only letters or numbers';
      }],
      passwordRules:[value => {
        if(value.length >= 8) return true;
        return 'Password must contain at least eight characters';
      }],
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
      this.$refs.usernameInput.focus();
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

.loginViewContainer{
  background-color: #fff4d7;
}

.welcomeContainer{
  min-width: 100vw;
  min-height: 100vh;
  text-align: center;
  color: #FFF4D7;
  background: center / cover no-repeat  url('img/game/board-background.svg');
  box-shadow: inset 0 0 700px -1px #000000;
}

.cardLogo{
  min-height: 80px;
  height: 9vh;
}

.welcomeContainer h1{
  font-family: 'Luckiest Guy', serif !important;
  font-size: 5rem;
  letter-spacing:.2rem;
  max-width: 800px;
  margin: 0 auto;
}

.video-container__wrapper {
  width: 50%;
  max-width: 650px;
  margin: 0 auto;
}

/* https://css-tricks.com/fluid-width-video/ */
.video-container {
  position: relative;
  padding: 0 0 56.25%;
  height: 0;
  width: 100%;
  margin: 0 auto;
}

.video-container__video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}


.container {
  width: 75%;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.loginForm{
  max-width: 540px;
}

.quote{
  background-color: #425CE6;
  color:#FCFDFC;
  width: 100%;
  margin-top: 10px;
  padding: 40px 0px;
}

.quote blockquote{
  max-width: 550px;
  text-align: center;
}

#logo {
  min-height: 150px;
  height: 20vh;
  margin: 60px auto 40px auto;
}

.discord{
  max-height: 48px;
  margin-right: 18px;
}

#username-login-form {
  padding: 0;
  max-width: 640px;
  margin: 0 auto;
}

@media (max-width: 660px){
  .cardLogo{
    height: 7vh;
  }

  .welcomeContainer h1{
    font-size: 50px;
  }

  .welcomeContainer p{
    font-size: 24px !important;
  }

  .video-container__wrapper {
  width: 85%;
  
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
