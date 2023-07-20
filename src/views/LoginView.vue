<template>
  <v-container id="login-container" class="container">
    <img id="logo" alt="Cuttle logo" src="/img/logo.png" />

    <v-row>
      <!-- Left side form -->
      <v-col id="username-login-form" :cols="$vuetify.display.mdAndUp ? 6 : 12">
        <h1 class="gradient-text">
          {{ buttonText }}
        </h1>

        <form @submit.prevent="submitLogin">
          <v-text-field
            v-model="username"
            variant="outlined"
            :dense="$vuetify.display.mdAndDown ? true : false"
            hint="Username"
            data-cy="username"
            autocomplete="username"
            :placeholder="t('global.username')"
          />
          <v-text-field
            v-model="pw"
            variant="outlined"
            hint="Password"
            :dense="$vuetify.display.mdAndDown ? true : false"
            type="password"
            data-cy="password"
            :autocomplete="isLoggingIn ? 'current-password' : 'new-password'"
            :placeholder="t('global.password')"
          />
          <div id="login-button-container">
            <v-btn
              :loading="loading"
              color="primary"
              block
              type="submit"
              data-cy="submit"
            >
              {{ buttonText }}
            </v-btn>
          </div>
        </form>

        <div id="switch-button-container">
          <v-btn
            color="primary"
            variant="text"
            data-cy="switch-mode"
            @click="switchMode"
          >
            {{ switchLabelText }}
          </v-btn>
        </div>

        <BaseSnackbar
          v-model="showSnackBar"
          :message="snackBarMessage"
          color="error"
          data-cy="auth-snackbar"
          @clear="clearSnackBar"
        />

      </v-col>
    </v-row>

    <v-row class="mt-8">
      <h1 class="gradient-text">{{ t('login.title') }}</h1>
    </v-row>

    <v-row class="mt-0">
      <v-col :cols="$vuetify.display.mdAndUp ? 6 : 12" class="d-flex justify-start flex-column mt-4">
        <blockquote class="quote">
          {{ t('login.quote') }}
          <cite>{{ t('login.quoteCite') }}</cite>
        </blockquote>
        <MarkdownContent :markdown="t('login.content')" />
        <v-btn
          color="primary"
          to="/rules"
          class="mt-4 align-self-center"
          max-width="500"
          data-cy="rules-link"
        >
          {{ t('login.learnRules') }}
        </v-btn>
      </v-col>
      <v-col :cols="$vuetify.display.mdAndUp ? 6 : 12" class="mt-2 mb-4">
        <v-img
          src="/img/game/cuttle-one-off-ace.png"
          alt="Cuttle Game Ace One-Off"
          cover
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useI18n } from 'vue-i18n';

import { ROUTE_NAME_LOGIN, ROUTE_NAME_SIGNUP } from '@/router';

import BaseSnackbar from '@/components/Global/BaseSnackbar.vue';
import MarkdownContent from '@/components/Global/MarkdownContent.vue';

export default {
  name: 'LoginView',
  components: {
    BaseSnackbar,
    MarkdownContent,
  },
  setup() {
    // Vuetify has its own translation layer that isn't very good
    // It seems to conflict with the namespace of vue-i18n so we need to import it at the component
    // level and utilize it this way with a composable. There may be another more global way but
    // I haven't found anything just yet
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
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
  border-left: 2px solid rgba(var(--v-theme-neutral));
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
