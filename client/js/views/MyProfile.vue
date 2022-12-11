<template>
  <v-container class="profile">
    <h1>{{ username }} Profile Settings</h1>
    <br />
    <v-text-field
      v-model="email"
      outlined
      :dense="$vuetify.breakpoint.mdAndDown ? true : false"
      hint="email"
      data-cy="email"
      autocomplete="email"
      placeholder="email"
      @keydown.enter.prevent="submitEmail"
    />
    <v-snackbar
      v-model="showSnackBar"
      :color="colorValue"
      content-class="d-flex justify-space-between align-center"
      data-cy="auth-snackbar"
    >
      {{ snackBarMessage }}
      <v-icon data-cy="close-snackbar" @click="clearSnackBar"> mdi-close </v-icon>
    </v-snackbar>
    <!-- <h3>Current Email: test</h3> -->
  </v-container>
</template>
<script>
export default {
  name: 'MyProfile',
  data() {
    return {
      username: this.$store.state.auth.username,
      email: this.$store.state.auth.email,
      showSnackBar: false,
      snackBarMessage: '',
      colorValue: '',
    };
  },
  computed: {},
  async beforeCreate() {
    if (this.email != null) {
      try {
        await this.$store.dispatch('findEmail', {
          username: this.username,
        });
        this.email = this.$store.state.auth.email;
      } catch (err) {
        console.log(err);
      }
    }
  },
  mounted() {},
  methods: {
    async submitEmail() {
      try {
        //Email Testing Regex
        if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
          await this.$store.dispatch('submitEmail', {
            username: this.username,
            email: this.email,
          });
          this.handleSuccess(this.email);
        } else {
          throw 'Not a valid Email';
        }
      } catch (err) {
        this.handleError(err);
      }
    },
    handleError(message) {
      this.showSnackBar = true;
      this.snackBarMessage = message;
      this.colorValue = 'error';
      this.loading = false;
    },
    handleSuccess(message) {
      this.showSnackBar = true;
      this.snackBarMessage = message;
      this.colorValue = 'success';
      this.loading = false;
    },
    clearSnackBar() {
      this.showSnackBar = false;
      this.snackBarMessage = '';
      this.colorValue = '';
    },
  },
};
</script>

<style scoped lang="scss">
.profile {
  width: 75%;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: left;
  padding-top: 10px auto;
}
</style>
