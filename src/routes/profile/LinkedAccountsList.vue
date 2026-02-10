<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-btn
        color="primary"
        v-bind="menuProps"
        data-cy="linked-accounts-btn"
      >
        {{ t('profile.linkedAccounts') }}
      </v-btn>
    </template>

    <v-card
      rounded="lg"
      class="pa-4 mt-4"
      style="background-color: rgba(var(--v-theme-base-light)); color: rgba(var(--v-theme-base-dark))"
    >
      <v-list bg-color="transparent">
        <template
          v-for="(provider, index) in providers"
          :key="provider.name"
        >
          <v-divider
            v-if="index > 0"
            class="my-2"
          />
          <v-list-item>
            <v-list-item-title class="font-weight-medium mb-2">
              {{ provider.displayName }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="provider.isConnected">
              <span :data-cy="`${provider.name}-username`">
                {{ t('profile.connectedAs') }}: {{ provider.username }}
              </span>
            </v-list-item-subtitle>
            <template v-else>
              <OauthLink :provider="provider.name" />
            </template>
          </v-list-item>
        </template>
      </v-list>
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

function getProviderInfo(providerName) {
  const identity = authStore.identities?.find(({ provider }) => provider === providerName);
  return {
    isConnected: !!identity,
    username: identity?.providerUsername || '',
  };
}

const providers = computed(() => [
  {
    name: 'discord',
    displayName: 'Discord',
    ...getProviderInfo('discord'),
  },
  {
    name: 'google',
    displayName: 'Google',
    ...getProviderInfo('google'),
  },
]);

</script>
