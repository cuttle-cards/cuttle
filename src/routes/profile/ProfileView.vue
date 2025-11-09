<template>
  <div style="background-color: #4a2416; min-height: 100vh">
    <v-container class="pa-6">
      <h1 class="text-surface-2">
        My Profile
      </h1>
      <p class="text-surface-2">
        Username: {{ authStore.username }}
      </p>

      <v-card class="pa-4 mt-4 d-flex align-center" style="background-color: #4a2416; color: white">
        <div>
          <h2 class="text-surface-2 mb-1">
            Discord
          </h2>
          <div v-if="hasDiscord">
            <span class="text-green">Connected as {{ discordUsername }}</span>
          </div>
          <div v-else>
            <span class="text-grey">Not connected</span>
            <DiscordLink />
          </div>
        </div>
      </v-card>

      <v-card class="pa-4 mt-4">
        <h2>My Games</h2>

        <v-data-table-server
          v-model:page="currentPage"
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="games"
          :items-length="totalGames"
          class="elevation-1"
          @update:page="onPageChange"
        >
          <template #item.name="{ item }">
            {{ item.name }}
          </template>

          <template #item.createdAt="{ item }">
            {{ new Date(item.createdAt).toLocaleString() }}
          </template>

          <template #item.isRanked="{ item }">
            {{ item.isRanked ? 'Yes' : 'No' }}
          </template>

          <template #item.winner="{ item }">
            {{ item.winnerLabel }}
          </template>

          <template #item.actions="{ item }">
            <v-btn icon="mdi-play-circle" variant="text" @click="goToReplay(item.id)" />
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import DiscordLink from '@/components/DiscordLink.vue';
import { useGameHistoryStore } from '@/stores/gameHistory';

const authStore = useAuthStore();
const gameHistoryStore = useGameHistoryStore();

const hasDiscord = computed(() => authStore.identities?.some(({ provider }) => provider === 'discord'));
const discordUsername = computed(() => {
  const discordIdentity = authStore.identities?.find(({ provider }) => provider === 'discord');
  return discordIdentity?.username || '';
});

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Created At', key: 'createdAt', sortable: true },
  { title: 'Ranked', key: 'isRanked', sortable: true },
  { title: 'Winner', key: 'winner', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
];

const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref([ { key: 'createdAt', order: 'desc' } ]);
const games = ref([]);
const totalGames = ref(0);


async function fetchGames() {
  const skip = (currentPage.value - 1) * itemsPerPage.value;

  const sort = sortBy.value[0] || { key: 'createdAt', order: 'desc' };
  const sortField = sort.key;
  const sortDirection = sort.order;

  await gameHistoryStore.loadMyGamesPage(itemsPerPage.value, skip, {
    sortBy: sortField,
    sortDirection,
  });

  games.value = gameHistoryStore.games;

  if (sortField === 'name') {
    games.value.sort((a, b) => {
      const result = naturalSort(a, b);
      return sortDirection === 'desc' ? -result : result;
    });
  }

  totalGames.value = gameHistoryStore.totalGames;
}

function onPageChange() {
  fetchGames();
}

function naturalSort(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

onMounted(fetchGames);

watch([ sortBy, currentPage, itemsPerPage ], fetchGames, { immediate: true });

</script>
