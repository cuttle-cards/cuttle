<template>
  <div class="profile">
    <h1>{{ user }} Profile Settings</h1>
    <label for="email">Email:</label>
    <input id="email" type="email" name="email" onsubmit=""/>
  </div>
</template>
<script>
export default {
  name: 'MyProfile',
  data() {
    return {
      user: this.$store.state.auth.username,
    };
  },
  computed: {},
  mounted() {},
  methods: {
    submitEmail() {

    },
  },
};
</script>
