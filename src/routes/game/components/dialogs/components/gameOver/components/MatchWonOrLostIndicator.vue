<template>
  <div class="container">
    <img src="/img/logo-trophy.svg" :alt="`${username} won the match`" class="logo">
    <p class="username mt-2">{{ username }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  wonMatch: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
}
.logo {
  display: inline-block;
  width: 127px;
}

.username {
  font-size: 18px;
}
</style>