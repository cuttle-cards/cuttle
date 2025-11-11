<template>
  <div style="background-color: rgba(var(--v-theme-surface-1)); min-height: 100vh">
    <v-container class="pa-6">
      <h1 style="color: rgba(var(--v-theme-surface-2))">
        {{ t('global.profile') }}
      </h1>
      <p style="color: rgba(var(--v-theme-surface-2))" data-cy="username">
        {{ t('global.username') }}: {{ authStore.username }}
      </p>

      <!-- Discord -->
      <v-card
        flat
        class="pa-4 mt-4"
        style="background-color: rgba(var(--v-theme-surface-1)); color: rgba(var(--v-theme-surface-2))"
      >
        <h2>Discord</h2>
        <div v-if="hasDiscord">
          <span data-cy="discord-username" style="color: rgba(var(--v-theme-surface-1))">
            {{ t('profile.connectedAs') }} {{ discordUsername }}
          </span>
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
          <span data-cy="not-connected" style="color: #ccc">{{ t('profile.notConnected') }}</span>
          <DiscordLink />
        </div>
      </v-card>

      <!-- Games List -->
      <v-card
        flat
        class="pa-4 mt-4"
        style="background-color: rgba(var(--v-theme-surface-2)); color: rgba(var(--v-theme-surface-1))"
      >
        <h2>{{ t('profile.myGames') }}</h2>

        <v-virtual-scroll
          v-if="games.length > 0"
          :items="games"
          height="600"
          item-height="100"
          @scroll="handleScroll"
        >
          <template #default="{ item }">
            <ProfileGameListItem
              :name="item.name"
              :is-ranked="item.isRanked"
              :winner-label="getIsWinner(item)"
              :opponent-name="item.opponentName"
              @replay="goToReplay(item.id)"
            />
          </template>
        </v-virtual-scroll>

        <!-- Loading indicator -->
        <div v-if="myGamesStore.loading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Fallback message when no games -->
        <p v-else-if="games.length === 0" style="color: rgba(var(--v-theme-surface-1))">
          {{ t('profile.noGamesFound') }}
        </p>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import DiscordLink from '@/components/DiscordLink.vue';
import { useMyGamesStore } from '@/stores/myGames';
import ProfileGameListItem from './ProfileGameListItem.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore();
const myGamesStore = useMyGamesStore();

const hasDiscord = computed(() =>
  authStore.identities?.some(({ provider }) => provider === 'discord')
);
const discordUsername = computed(() => {
  const discordIdentity = authStore.identities?.find(({ provider }) => provider === 'discord');
  return discordIdentity?.username || '';
});

const games = computed(() => myGamesStore.games);

function getIsWinner(game) {
  if (!game.winnerId) {
    return null;
  }
  return game.winnerId !== game.opponentId;
}

async function fetchGames() {
  try {
    await myGamesStore.loadMyGames({
      sortBy: 'createdAt',
      sortDirection: 'desc',
      reset: true
    });
  } catch (error) {
    console.error('Failed to fetch games:', error);
  }
}

function handleScroll(event) {
  const { scrollTop, scrollHeight, clientHeight } = event.target;
  const scrollThreshold = 200;

  if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
    loadMoreGames();
  }
}

async function loadMoreGames() {
  if (myGamesStore.loading || !myGamesStore.hasMore) {return;}

  try {
    await myGamesStore.loadMyGames({
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });
  } catch (error) {
    console.error('Failed to load more games:', error);
  }
}

function goToReplay(gameId) {
  window.location.href = `/spectate/${gameId}`;
}

onMounted(fetchGames);

onUnmounted(() => {
  myGamesStore.resetGames();
});
</script>

<style>
.v-card {
  overflow-x: hidden;
}

.v-row {
  margin: 0;
}

.v-col {
  padding: 0 8px;
}
</style>
