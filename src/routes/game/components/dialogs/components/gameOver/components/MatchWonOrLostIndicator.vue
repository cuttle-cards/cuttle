<template>
  <div class="container">
    <img
      :src="`/img/${imgSrc}`"
      :alt="imgAlt"
      :data-cy-result-img="imgDataCy"
      class="logo"
    >
    <p class="username mt-2">
      {{ username }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

const imgSrc = computed(() => props.wonMatch ? 'logo-trophy.svg' : 'logo-dead.svg');

const imgAlt = computed(() => {
  const msgEnd = props.wonMatch ? 'won the match' : 'lost the match';
  return `${props.username} ${msgEnd}`;
});

const imgDataCy = computed(() => props.wonMatch ? 'won' : 'lost');
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