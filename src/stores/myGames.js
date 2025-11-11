import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io } from '@/plugins/sails';

export const useMyGamesStore = defineStore('myGames', () => {
  // Game history with pagination
  const games = ref([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const totalCount = ref(0);

  async function loadMyGames(options = {}) {
    if (loading.value || !hasMore.value) {return;}

    loading.value = true;
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = 'desc',
        limit = 20,
        reset = false
      } = options;

      const skip = reset ? 0 : games.value.length;

      const query = new URLSearchParams({
        sortBy,
        sortDirection,
        limit: limit.toString(),
        skip: skip.toString(),
      });

      const { finishedGames, hasMore: moreAvailable, totalCount: total } = await new Promise((resolve, reject) => {
        io.socket.get(`/api/game/history?${query.toString()}`, (res, jwres) => {
          if (jwres && jwres.statusCode === 200 && Array.isArray(res.finishedGames)) {
            resolve(res);
          } else {
            reject(new Error('Failed to load game history'));
          }
        });
      });

      if (reset) {
        games.value = finishedGames;
      } else {
        games.value = [ ...games.value, ...finishedGames ];
      }

      hasMore.value = moreAvailable;
      totalCount.value = total;
    } finally {
      loading.value = false;
    }
  }

  function resetGames() {
    games.value = [];
    hasMore.value = true;
    totalCount.value = 0;
  }

  return {
    games,
    loading,
    hasMore,
    totalCount,
    loadMyGames,
    resetGames,
  };
});
