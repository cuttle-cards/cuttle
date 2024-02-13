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
import { useI18n } from 'vue-i18n';

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

const { t } = useI18n();

const imgSrc = computed(() => props.wonMatch ? 'logo-trophy.svg' : 'logo-dead.svg');

const imgAlt = computed(() => {
  const keyPrefix = 'game.dialogs.gameOverDialog.matchStatus';
  const keySuffix = props.wonMatch ? 'wonTheMatch' : 'lostTheMatch';
  return `${props.username} ${t(`${keyPrefix}.${keySuffix}`)}`;
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
