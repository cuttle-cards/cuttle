<template>
  <div class="profile">
    <h1>{{ getName }}</h1>
  </div>
</template>
<script>
export default {
  computed: {
    getName() {
      return this.$store.state.auth.username;
    },
  },
};
</script>
