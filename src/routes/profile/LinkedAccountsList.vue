<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-btn
        color="primary"
        v-bind="menuProps"
      >
        Linked Accounts
      </v-btn>
    </template>

    <v-card
      flat
      class="pa-4 mt-4"
      style="background-color: rgba(var(--v-theme-surface-2)); color: rgba(var(--v-theme-surface-1))"
    >
      <h4>
        Discord 
        <span v-if="!hasDiscord" data-cy="not-connected" color="error"> : {{ t('profile.notConnected') }}</span>
      </h4>
      <div v-if="hasDiscord">
        <span data-cy="discord-username" style="color: rgba(var(--v-theme-surface-1))">
          {{ t('profile.connectedAs') }} {{ discordUsername }}
        </span>
      </div>
      <div v-else style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <OauthLink provider="discord" />
      </div>
        

      <h4>Google</h4>
      <div v-if="hasGoogle">
        <span data-cy="discord-username" style="color: rgba(var(--v-theme-surface-1))">
          {{ t('profile.connectedAs') }} {{ googleUsername }}
        </span>
      </div>
      <div v-else style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <span data-cy="not-connected" style="color: #ccc">{{ t('profile.notConnected') }}</span>
        <OauthLink provider="google" />
      </div>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import OauthLink from '_/src/components/OauthLink.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const authStore = useAuthStore();


const hasDiscord = computed(() =>
  authStore.identities?.some(({ provider }) => provider === 'discord')
);
const discordUsername = computed(() => {
  const discordIdentity = authStore.identities?.find(({ provider }) => provider === 'discord');
  return discordIdentity?.username || '';
});


const hasGoogle = computed(() =>
  authStore.identities?.some(({ provider }) => provider === 'google')
);
const googleUsername = computed(() => {
  const discordIdentity = authStore.identities?.find(({ provider }) => provider === 'google');
  return discordIdentity?.username || '';
});

</script>
