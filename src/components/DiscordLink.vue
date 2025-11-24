<template>
  <v-list-item
    :title="title"
    prepend-icon="mdi-link"
    :disabled="hasDiscord"
    @click="handleClick"
  />
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore();

const hasDiscord = computed(() => authStore.identities.some(({ provider }) => provider === 'discord'));

const title = computed(() =>
  t(hasDiscord.value ? 'login.discordLinked' : 'login.linkDiscord')
);


const handleClick = () => {
  if (hasDiscord.value) {
    return;
  }

  return authStore.oAuth('discord');
};
</script>
