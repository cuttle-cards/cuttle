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

const props = defineProps({
  provider: {
    type: String,
    required: true
  }
});

const { t } = useI18n();
const authStore = useAuthStore();

const hasOauth = computed(() => authStore.identities.some(({ provider }) => provider === props.provider));

const title = computed(() =>
  t(hasOauth.value ? `login.${props.provider}Linked` : `login.link${props.provider}`)
);


const handleClick = () => {
  if (hasOauth.value) {
    return;
  }

  return authStore.oAuth(props.provider);
};
</script>
