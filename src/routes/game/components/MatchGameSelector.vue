<template>
  <!--
    The menu is attached to the bar, so the dropdown renders inside the bar's own stacking context
    and paints above it without a z-index. Declaring one here would seed vuetify's overlay stack
    above the bar, pushing every overlay opened afterwards on top of the controls (#1479).

    Attached to the bar rather than with `attach: true`: that attaches to the activator's own
    field, which is a containing block only as wide as the collapsed selector, and the options
    then ellipsize at phone widths.
  -->
  <v-select
    :model-value="gameStore.id"
    :items="gameOptions"
    :aria-label="t('game.playbackControls.gameSelector.label')"
    :list-props="{ bgColor: 'base-light', baseColor: 'base-dark', color: 'primary' }"
    :menu-props="{ attach: '#playback-controls' }"
    density="compact"
    variant="outlined"
    hide-details
    data-cy="match-game-selector"
    @update:model-value="spectateGame"
  >
    <!-- Phones are too narrow for the full label next to five buttons, so the activator shortens it -->
    <template #selection="{ item }">
      <span v-if="xs">{{ t('game.playbackControls.gameSelector.optionShort', { number: item.raw.number }) }}</span>
      <span v-else>{{ item.title }}</span>
    </template>
    <template #item="{ props: itemProps, item }">
      <v-list-item
        v-bind="itemProps"
        :data-game-id="item.value"
        data-cy="match-game-option"
      />
    </template>
  </v-select>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useGameStore } from '@/stores/game';
import { useGameHistoryStore } from '@/stores/gameHistory';
import GameStatus from '_/utils/GameStatus.json';

const { t } = useI18n();
const { xs } = useDisplay();
const router = useRouter();
const gameStore = useGameStore();
const gameHistoryStore = useGameHistoryStore();

const gameOptions = computed(() =>
  gameHistoryStore.matchGames.map(({ id }, index) => ({
    title: t('game.playbackControls.gameSelector.option', { number: index + 1 }),
    number: index + 1,
    value: id,
  })),
);

/**
 * Players swap seats on every rematch, so the pNum of the game being left would
 * point at the other player in the game being entered. Find the seat the
 * currently-viewed player holds in the target game instead.
 */
function resolvePNum(targetGameId) {
  const currentPlayerId = gameStore.player?.id;
  const targetGame = gameHistoryStore.matchGames.find(({ id }) => id === targetGameId);
  const targetPNum = [ targetGame?.p0, targetGame?.p1 ].indexOf(currentPlayerId);

  return targetPNum === -1 ? gameStore.myPNum : targetPNum;
}

async function spectateGame(gameId) {
  if (gameId === gameStore.id) {
    return;
  }

  const pNum = resolvePNum(gameId);
  const route = {
    name: router.currentRoute.value.name,
    params: { gameId },
  };

  try {
    // beforeEnter guards don't re-run when only route params change, so the new
    // game must be requested before navigating
    await gameStore.requestSpectate(gameId, null, route);
  } catch (err) {
    return router.push({
      name: 'Home',
      query: {
        gameId,
        error: err?.message ?? err ?? `Could not spectate game ${gameId}`,
      },
    });
  }

  // An unfinished game in the chain opens on its latest state
  const gameStateIndex = gameStore.status === GameStatus.STARTED ? -1 : 0;
  return router.push({
    ...route,
    query: {
      gameStateIndex,
      pNum,
    },
  });
}
</script>
