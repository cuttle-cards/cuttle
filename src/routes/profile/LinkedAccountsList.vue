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
      style="background-color: rgba(var(--v-theme-surface-2)); color: rgba(var(--v-theme-surface-1))"
    >
      <v-list bg-color="transparent">
        <v-list-item>
          <v-list-item-title class="font-weight-medium mb-2">
            Discord
          </v-list-item-title>
          <v-list-item-subtitle v-if="hasDiscord">
            <span data-cy="discord-username">
              {{ t('profile.connectedAs') }}: {{ discordUsername }}
            </span>
          </v-list-item-subtitle>
          <template v-else>
            <OauthLink provider="discord" />
          </template>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item>
          <v-list-item-title class="font-weight-medium mb-2">
            Google
          </v-list-item-title>
          <v-list-item-subtitle v-if="hasGoogle">
            <span data-cy="google-username">
              {{ t('profile.connectedAs') }}: {{ googleUsername }}
            </span>
          </v-list-item-subtitle>
          <template v-else>
            <OauthLink provider="google" />
          </template>
        </v-list-item>
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
  const googleIdentity = authStore.identities?.find(({ provider }) => provider === 'google');
  return googleIdentity?.username || '';
});

</script>
