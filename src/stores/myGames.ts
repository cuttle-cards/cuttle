import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io } from '@/plugins/sails';

export interface PlayerSummary {
  id: number;
  username: string;
  isOpponent: boolean;
}

export interface MyGame {
  id: number;
  name: string;
  isRanked: boolean;
  createdAt: string;
  match: number | null;
  winnerId: number | null;
  p0: PlayerSummary;
  p1: PlayerSummary;
}

export interface GameHistoryResponse {
  finishedGames: MyGame[];
  totalCount: number;
  hasMore: boolean;
}

export type SortColumn = 'createdAt' | 'winner' | 'isRanked';
export type SortDirection = 'asc' | 'desc';

export interface LoadMyGamesOptions {
  sortBy?: SortColumn;
  sortDirection?: SortDirection;
  limit?: number;
  reset?: boolean;
}

export const useMyGamesStore = defineStore('myGames', () => {
  const games = ref<MyGame[]>([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const totalCount = ref(0);

  async function loadMyGames(options: LoadMyGamesOptions = {}): Promise<void> {
    if (loading.value || !hasMore.value) {
      return;
    }

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

      const { finishedGames, hasMore: moreAvailable, totalCount: total } =
        await new Promise<GameHistoryResponse>((resolve, reject) => {
          io.socket.get(
            `/api/game/history?${query.toString()}`,
            (res: GameHistoryResponse, jwres: { statusCode?: number }) => {
              if (jwres?.statusCode === 200 && Array.isArray(res.finishedGames)) {
                resolve(res);
              } else {
                reject(new Error('Failed to load game history'));
              }
            }
          );
        });

      games.value = reset ? finishedGames : [ ...games.value, ...finishedGames ];
      hasMore.value = moreAvailable;
      totalCount.value = total;
    } catch (err) {
      console.warn('Error loading games:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function resetGames(): void {
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