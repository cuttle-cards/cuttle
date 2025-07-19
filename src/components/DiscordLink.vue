<template>
  <v-list-item :title="title" prepend-icon="mdi-link" @click="handleClick" />
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

const hasDiscord = computed(() => {return authStore.identities.some(({ provider }) => provider === 'discord');});
const title = hasDiscord.value ? 'Linked to Discord' : 'Link Discord';

const handleClick = () => {
  if(hasDiscord.value){
    return;
  }

  return authStore.oAuth('discord');
};
</script>
