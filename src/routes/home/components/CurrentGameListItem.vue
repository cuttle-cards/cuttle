<template>
  <div>
    <v-row class="list-item" data-cy="current-game-list-item">
      <v-col lg="6" class="list-item__inner-text">
        <p class="game-name text-base-dark" data-cy="current-game-list-item-name">
          {{ name }}
        </p>
        <p v-if="opponent" class="text-base-dark" data-cy="current-game-list-item-opponent">
          {{ t('home.versus') }} {{ opponent.username }}
        </p>
      </v-col>
      <v-col lg="6" class="list-item__button pr-md-0">
        <!-- Continue Button -->
        <v-btn
          color="base-dark"
          variant="outlined"
          min-width="200"
          :loading="continuing"
          :data-cy-continue-game="gameId"
          @click="continueGame"
        >
          <v-icon
            class="mr-4"
            size="medium"
            :icon="isRanked ? 'mdi-sword-cross' : 'mdi-coffee-outline'"
            aria-hidden="true"
          />
          {{ t('home.continue') }}
        </v-btn>
        <!-- Archive Button: icon only, so the tooltip carries the label in both states.
             The directive binds to the span, not the button: a disabled v-btn renders as
             <button disabled> with pointer-events:none, so a real hover never reaches it and the
             blocked-state tooltip would silently never appear. -->
        <span v-tooltip:top="archiveTooltipText">
          <v-btn
            class="ml-2"
            color="base-dark"
            variant="text"
            icon="mdi-close"
            size="small"
            :disabled="!canArchive"
            :loading="archiving"
            :aria-label="t('home.archive')"
            :data-cy-archive-game="gameId"
            @click="archive"
          />
        </span>
      </v-col>
    </v-row>
    <v-divider color="base-dark" class="mb-4 mx-2 border-opacity-100 px-5" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { useGameListStore } from '@/stores/gameList';
import gameActivity from '_/utils/gameActivity.json';

const props = defineProps({
  gameId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  isRanked: {
    type: Boolean,
    default: false,
  },
  canArchive: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: String,
    default: null,
  },
  opponent: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([ 'error' ]);

const { t, te } = useI18n();
const router = useRouter();
const gameListStore = useGameListStore();

const continuing = ref(false);
const archiving = ref(false);

/**
 * With no text label on the button, the tooltip names the action when archiving is available
 * and explains the block when it isn't.
 *
 * The backend is the authority on whether a game can be archived, but it doesn't say why.
 * Staleness is the half we can recompute client-side, so check it first -- otherwise a
 * ranked game from a PREVIOUS week that is merely too recent would claim the wrong reason.
 */
const archiveTooltipText = computed(() => {
  if (props.canArchive) {
    return t('home.archive');
  }
  const isDormant = dayjs(props.updatedAt).isBefore(dayjs().subtract(gameActivity.RECENT_ACTIVITY_MINUTES, 'minute'));
  return isDormant ? t('home.archiveBlockedRanked') : t('home.archiveBlockedActive');
});

function continueGame() {
  continuing.value = true;
  router.push(`/game/${props.gameId}`).catch(() => {
    continuing.value = false;
  });
}

async function archive() {
  archiving.value = true;
  try {
    await gameListStore.requestArchiveGame(props.gameId);
  } catch (err) {
    // The API rejects with an i18n key (eg home.error.forbidden) so the message can be localized
    const key = err?.message ?? err;
    emit('error', te(key) ? t(key) : t('home.failedToArchiveGame'));
  } finally {
    archiving.value = false;
  }
}
</script>

<style scoped lang="scss">
.list-item {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.5rem;
  overflow-wrap: anywhere;
  & .game-name {
    font-weight: 600;
    font-size: 1.5em;
    text-align: left;
    padding-right: 1rem;
  }
  & p {
    line-height: 1;
    margin: 3px auto;
  }
  &__inner-text {
    align-items: center;
    padding-bottom: 1rem;
    padding-top: 0.25rem;
  }
  &__button {
    display: flex;
    align-items: center;
    justify-content: end;
    margin-top: 0;
    padding-top: 0.5rem;
  }
}

@media (min-width: 1264px) {
  .list-item {
    max-width: 100%;
    flex-direction: row;
    padding: 10px 10px;
    & .game-name {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      width: 100%;
    }
    &__inner-text {
      display: block;
      padding: 0;
    }
  }
}
</style>
