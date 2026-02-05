<template>
  <div style="background-color: rgba(var(--v-theme-game-board)); min-height: 100vh">
    <v-container class="pa-6">
      <h1 style="color: rgba(var(--v-theme-game-card))">
        {{ t('global.profile') }}
      </h1>
      <p style="color: rgba(var(--v-theme-game-card))" data-cy="username">
        {{ t('global.username') }}: {{ authStore.username }}
      </p>

      <LinkedAccountsList />
      <!-- Games List -->
      <v-card
        flat
        class="pa-4 mt-4"
        style="background-color: rgba(var(--v-theme-game-card)); color: rgba(var(--v-theme-game-board))"
      >
        <h2>{{ t('profile.myGames') }}</h2>

        <v-virtual-scroll
          v-if="games.length > 0"
          :items="games"
          height="600"
          item-height="100"
          data-cy="game-list"
          @scroll="handleScroll"
        >
          <template #default="{ item }">
            <ProfileGameListItem
              :name="item.name"
              :is-ranked="item.isRanked"
              :winner-label="getIsWinner(item)"
              :opponent-name="getOpponentName(item)"
              :game-id="item.id"
            />
          </template>
        </v-virtual-scroll>

        <!-- Loading indicator -->
        <div v-if="myGamesStore.loading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Fallback message when no games -->
        <p v-else-if="games.length === 0" style="color: rgba(var(--v-theme-game-board))">
          {{ t('profile.noGamesFound') }}
        </p>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

import { useMyGamesStore } from '@/stores/myGames';
import ProfileGameListItem from './ProfileGameListItem.vue';
import LinkedAccountsList from './LinkedAccountsList.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore();
const myGamesStore = useMyGamesStore();


const games = computed(() => myGamesStore.games);

function getOpponentName(game) {
  const opponent = game.p0.isOpponent ? game.p0 : game.p1;
  return opponent.username;
}

function getIsWinner(game) {
  if (!game.winnerId) {
    return null;
  }
  const opponent = game.p0.isOpponent ? game.p0 : game.p1;
  return game.winnerId !== opponent.id;
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

onMounted(fetchGames);

onUnmounted(() => {
  myGamesStore.resetGames();
});
</script>

<style scoped>
.v-card {
  overflow-x: hidden;
}

.v-card :deep(.v-virtual-scroll__container) {
  overflow-x: hidden !important;
}

.v-row {
  margin: 0;
}

.v-col {
  padding: 0 8px;
}
</style>
