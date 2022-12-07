<template>
  <v-container class="profile">
    <h1>{{ user }} Profile Settings</h1>
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
    <!-- <h3>Current Email: test</h3> -->
  </v-container>
</template>
<script>
export default {
  name: 'MyProfile',
  data() {
    return {
      user: this.$store.state.auth.username,
      email: '',
    };
  },
  computed: {},
  mounted() {},
  methods: {
    submitEmail() {
      //ToDo Email Change function
      console.log("Test");
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
