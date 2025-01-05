<template>
  <div class="loginViewContainer">
    <!--//////////////////////////
     /////Welcome Section /////
    //////////////////////////-->
    <section>
      <v-container id="welcome-container" fluid class="welcomeContainer">
        <nav class="d-flex justify-space-between align-center mb-2">
          <img class="cardLogo" src="/img/loginView/logo-cards-behind.svg">
          <div class="d-flex align-center">          
            <TheLanguageSelector variant="light" />
            <v-btn variant="text" class="text-h6" @click="scrollAndFocusLogin">
              {{ buttonText }}
              <v-icon
                icon="mdi-account-circle"
                color="white"
                class="ml-2"
                aria-hidden="true"
              />
            </v-btn>
          </div>
        </nav>

        <div class="d-flex h-75 flex-column justify-space-around align-center mt-2">
          <h1>{{ t('login.title') }}</h1>
          <p class="text-h4 mb-4">
            {{ t('login.subtitle') }}
          </p>
          <div class="w-75 my-4 video">
            <BaseVideo source="https://www.youtube.com/embed/qOqkNbhMdsI" />
            <v-btn
              class="rulesBtn w-100 mt-8"
              size="x-large"
              to="/rules"
              color="newPrimary"
              data-cy="rules-link"
            >
              {{ t('login.readRules') }}
            </v-btn>
          </div>
        </div>
      </v-container>
    </section>

    <!--//////////////////////////
     /////Login Section ///////
    //////////////////////////-->

    <section ref="loginContainer">
      <v-container id="login-container" class="container">
        <img id="logo" alt="Cuttle logo" :src="logoSrc">
        <v-row>
          <!-- Left side form -->
          <v-col id="username-login-form" :cols="$vuetify.display.mdAndUp ? 8 : 12">
            <p class="text-h4 text-center font-weight-medium mb-10">
              {{ formHeaderText }}
            </p>

            <v-form
              id="form"
              v-model="isFormValid"
              class="mx-auto loginForm"
              @submit.prevent="submitLogin"
            >
              <label for="username" class="text-body-1 font-weight-bold">{{ t('global.username') }}</label>
              <v-text-field
                id="username"
                ref="usernameInput"
                v-model="username"
                class="mt-4"
                variant="solo"
                :rules="usernameRules"
                :density="$vuetify.display.mdAndDown ? 'compact' : 'default'"
                autocomplete="username"
                data-cy="username"
              />

              <label for="password" class="text-body-1 font-weight-bold">{{ t('global.password') }}</label>
              <v-text-field
                id="password"
                v-model="pw"
                class="my-4"
                variant="solo"
                :rules="passwordRules"
                :density="$vuetify.display.mdAndDown ? 'compact' : 'default'"
                :type="showPass ? 'text' : 'password'"
                :autocomplete="isLoggingIn ? 'current-password' : 'new-password'"
                :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                data-cy="password"
                @click:append-inner="showPass = !showPass"
              />

              <div
                id="login-button-container"
                class="d-flex flex-column flex-md-row justify-space-between align-center flex-wrap"
              >
                <v-btn
                  class="px-16"
                  :loading="loading"
                  :disabled="!isFormValid"
                  :color="isFormValid ? 'newPrimary' : 'disabled'"
                  type="submit"
                  size="x-large"
                  text-color="white"
                  data-cy="submit"
                >
                  {{ buttonText }}
                </v-btn>
                <v-btn
                  class="text-h6"
                  color="black"
                  size="large"
                  variant="text"
                  data-cy="switch-mode"
                  @click="switchMode"
                >
                  {{ switchLabelText }}
                </v-btn>
              </div>

              <v-btn
                class="w-100 my-10 text-subtitle-2 text-sm-subtitle-1 text-md-h6 h-auto py-2"
                size="large"
                color="newSecondary"
                href="https://discord.com/invite/9vrAZ8xGyh"
                target="_blank"
              >
                <img class="discord" src="/img/loginView/logo-discord.svg">
                <span class="discordButton">{{ t('login.joinDiscord') }}</span>
              </v-btn>
            </v-form>

            <BaseSnackbar
              v-model="showSnackBar"
              :message="snackBarMessage"
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
        <blockquote>{{ t('login.quote') }}</blockquote>
        <br>
        <cite>{{ t('login.quoteCite') }}</cite>
      </v-container>
    </section>

    <section>
      <v-container>
        <v-col :cols="$vuetify.display.mdAndUp ? 10 : 12" class="mx-auto">
          <div class="d-flex flex-md-row flex-column align-center text-h5">
            <div class="px-8">
              <MarkdownContent :markdown="t('login.content')" />
            </div>
            <img class="w-50 h-50 my-6" src="/img/loginView/game-screenshot-1.png">
          </div>
        </v-col>
        <v-col :cols="$vuetify.display.mdAndUp ? 10 : 12" class="mx-auto">
          <div class="d-flex flex-md-row flex-column-reverse align-center text-h5 my-10">
            <img class="w-50 h-50 my-6" src="/img/loginView/game-screenshot-2.png">
            <div class="px-8">
              <MarkdownContent :markdown="t('login.content2')" />
            </div>
          </div>
        </v-col>
      </v-container>
    </section>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useThemedLogo } from '@/composables/themedLogo';
import { ROUTE_NAME_LOGIN, ROUTE_NAME_SIGNUP } from '@/router';
import { useHead } from '@unhead/vue';
import BaseSnackbar from '@/components/BaseSnackbar.vue';
import MarkdownContent from '@/components/MarkdownContent.vue';
import BaseVideo from '@/components/BaseVideo.vue';
import TheLanguageSelector from '@/components/TheLanguageSelector.vue';


export default {
  name: 'LoginView',
  components: {
    BaseSnackbar,
    BaseVideo,
    MarkdownContent,
    TheLanguageSelector
  },
  setup() {
    // Vuetify has its own translation layer that isn't very good
    // It seems to conflict with the namespace of vue-i18n so we need to import it at the component
    // level and utilize it this way with a composable. There may be another more global way but
    // I haven't found anything just yet
    const { t } = useI18n();
    const { logoSrc } = useThemedLogo();
    useHead({
      link: [ {
        rel: 'canonical',
        href: () => 'https://www.cuttle.cards/signup'
      } ]
    });
    return {
      t,
      logoSrc,
    };
  },
  data() {
    return {
      username: '',
      pw: '',
      showSnackBar: false,
      snackBarMessage: '',
      loading: false,
      showPass: false,
      isFormValid: false,
      usernameRules: [ this.isAlphaNumeric ],
      passwordRules: [ this.has8OrMoreCharacters ],
    };
  },
  computed: {
    ...mapStores(useAuthStore),
    isLoggingIn() {
      return this.$route.name === ROUTE_NAME_LOGIN;
    },
    goingToForm() {
      return this.$route.hash === '#login-container';
    },
    formHeaderText() {
      return this.isLoggingIn ? this.t('login.formHeaderLogin') : this.t('login.formHeaderSignup');
    },
    buttonText() {
      if (this.isLoggingIn) {
        return this.t('global.login');
      }
      return this.t('global.signup');
    },
    switchLabelText() {
      if (this.isLoggingIn) {
        return this.t('login.noAccount');
      }
      return this.t('login.haveAccount');
    },
  },
  mounted() {
    if (this.goingToForm) {
      this.scrollAndFocusLogin();
    }
  },
  methods: {
    async submitLogin() {
      this.loading = true;
      const action = this.isLoggingIn ? this.authStore.requestLogin : this.authStore.requestSignup;
      try {
        await action({
          username: this.username,
          password: this.pw,
        });
        this.handleLogin();
      } catch (err) {
        this.handleError(err.message);
      }
    },
    switchMode() {
      this.pw = '';
      if (this.isLoggingIn) {
        this.$router.push({ name: ROUTE_NAME_SIGNUP, hash: '#login-container' });
      } else {
        this.$router.push({ name: ROUTE_NAME_LOGIN, hash: '#login-container' });
      }
    },
    handleLogin() {
      this.username = '';
      this.pw = '';
      this.loading = false;
      const { lobbyRedirectId } = this.$route.params;
      if (!lobbyRedirectId) {
        return this.$router.push('/');
      }
      return this.$router.push(`/lobby/${lobbyRedirectId}`);
    },
    handleError(messageKey) {
      this.showSnackBar = true;
      this.snackBarMessage =  this.t(messageKey);
      this.loading = false;
    },
    clearSnackBar() {
      this.showSnackBar = false;
      this.snackBarMessage = '';
    },
    isAlphaNumeric(val) {
      return /^[\w.@-]+$/.test(val) || 'Username must contain only letters or numbers';
    },
    has8OrMoreCharacters(val) {
      return val.length >= 8 || 'Password must contain at least eight characters';
    },
    scrollAndFocusLogin() {
      this.$refs.loginContainer.scrollIntoView();
      this.$refs.usernameInput.focus();
    },
  },
};
</script>

<style scoped lang="scss">
.loginViewContainer {
  background-color: #fff4d7;
}

.welcomeContainer {
  min-width: 100vw;
  min-height: 100vh;
  text-align: center;
  color: #fff4d7;
  background: center / cover no-repeat url('/img/game/board-background.webp');
  box-shadow: inset 0 0 700px -1px #000000;
}

.cardLogo {
  min-height: 80px;
  height: 9vh;
}

.welcomeContainer h1 {
  font-family: 'Luckiest Guy', serif !important;
  font-size: 5rem;
  letter-spacing: 0.2rem;
  max-width: 800px;
  margin: 0 auto;
}

.container {
  width: 75%;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.video {
  max-width: 850px;
}

.loginForm {
  max-width: 540px;
}

.quote {
  background-color: #425ce6;
  color: #fcfdfc;
  width: 100%;
  margin-top: 10px;
  padding: 40px 0px;
}

.quote blockquote {
  max-width: 550px;
  text-align: center;
}

#logo {
  min-height: 150px;
  height: 20vh;
  margin: 60px auto 40px auto;
}

.discord {
  max-height: 48px;
  margin-right: 18px;
}

.discordButton{
    white-space: normal;
  }

#username-login-form {
  padding: 0;
  max-width: 640px;
  margin: 0 auto;
}

@media (max-width: 660px) {
  .cardLogo {
    height: 7vh;
  }

  .welcomeContainer h1 {
    font-size: 42px;
  }

  .welcomeContainer p {
    font-size: 24px !important;
  }

  .video-container__wrapper {
    width: 85%;
  }
}
</style>
