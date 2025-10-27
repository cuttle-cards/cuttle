<template>
  <v-container>
    <h1>My Profile</h1>
    <p>Username: {{ authStore.username }}</p>

    <v-card class="pa-4 mt-4">
      <h2>Discord</h2>
      <p v-if="hasDiscord">
        ✅ Discord linked: {{ discordUsername }}
      </p>
      <p v-else>
        ❌ Discord not linked
      </p>
      <DiscordLink v-if="!hasDiscord" />
    </v-card>

    <v-card class="pa-4 mt-4">
      <h2>My Games</h2>
      <v-data-table
        :headers="headers"
        :items="games"
        class="elevation-1"
        :items-per-page="10"
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
          {{ item.winner === authStore.id ? 'You' : 'Opponent' }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-play-circle"
            variant="text"
            @click="goToReplay(item.id)"
          />
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import DiscordLink from '@/components/DiscordLink.vue';
import { useRouter } from 'vue-router';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const gameHistoryStore = useGameHistoryStore();
const router = useRouter();

const hasDiscord = computed(() =>
  authStore.identities?.some(({ provider }) => provider === 'discord')
);

const discordUsername = computed(() => {
  const discordIdentity = authStore.identities?.find(({ provider }) => provider === 'discord');
  return discordIdentity?.username || '';
});

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Created At', key: 'createdAt' },
  { title: 'Ranked', key: 'isRanked' },
  { title: 'Winner', key: 'winner' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const { games } = storeToRefs(gameHistoryStore);

onMounted(async () => {
  if (!gameHistoryStore.games.length) {
    await gameHistoryStore.loadMyGames();
    console.log('Loaded games:', gameHistoryStore.games);
  }
});

function goToReplay(gameId) {
  router.push(`/spectate/${gameId}`);
}
</script>
