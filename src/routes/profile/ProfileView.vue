<template>
  <div style="background-color: #4a2416; min-height: 100vh">
    <v-container class="pa-6">
      <h1 style="color: rgba(var(--v-theme-surface-2))">
        My Profile
      </h1>
      <p style="color: rgba(var(--v-theme-surface-2))">
        Username: {{ authStore.username }}
      </p>

      <!-- Discord -->
      <v-card flat class="pa-4 mt-4" style="background-color: #4a2416; color: rgba(var(--v-theme-surface-2))">
        <h2>Discord</h2>
        <div v-if="hasDiscord">
          <span style="color: #4caf50">Connected as {{ discordUsername }}</span>
        </div>
        <div v-else>
          <span style="color: #ccc">Not connected</span>
          <DiscordLink />
        </div>
      </v-card>

      <!-- Games List -->
      <v-card
        flat
        class="pa-4 mt-4"
        style="background-color: rgba(var(--v-theme-surface-2)); color: rgba(var(--v-theme-surface-1))"
      >
        <h2>My Games</h2>

        <v-virtual-scroll
          v-if="games.length > 0"
          :items="games"
          height="600"
          item-height="100"
        >
          <template #default="{ item }">
            <ProfileGameListItem
              :name="item.name"
              :is-ranked="item.isRanked"
              :winner-label="item.winnerLabel"
              :opponent-name="item.opponentName"
              @replay="goToReplay(item.id)"
            />
          </template>
        </v-virtual-scroll>

        <!-- Fallback message when no games -->
        <p v-else style="color: rgba(var(--v-theme-surface-1))">
          No games found
        </p>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import DiscordLink from '@/components/DiscordLink.vue';
import { useGameHistoryStore } from '@/stores/gameHistory';
import ProfileGameListItem from './ProfileGameListItem.vue';

const authStore = useAuthStore();
const gameHistoryStore = useGameHistoryStore();

const hasDiscord = computed(() =>
  authStore.identities?.some(({ provider }) => provider === 'discord')
);
const discordUsername = computed(() => {
  const discordIdentity = authStore.identities?.find(({ provider }) => provider === 'discord');
  return discordIdentity?.username || '';
});

const games = computed(() => gameHistoryStore.games);

async function fetchGames() {
  try {
    await gameHistoryStore.loadMyGames({ sortBy: 'createdAt', sortDirection: 'desc' });
  } catch (error) {
    console.error('Failed to fetch games:', error);
  }
}

function goToReplay(gameId) {
  window.location.href = `/spectate/${gameId}`;
}

onMounted(fetchGames);
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
