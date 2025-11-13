<template>
  <div class="history-item" data-cy="game-list-item">
    <v-row class="align-center justify-space-between">
      <v-col cols="6">
        <div class="d-flex align-center">
          <v-icon
            v-if="winnerLabel === true"
            data-cy="winner-icon"
            icon="mdi-trophy"
            color="yellow-darken-2"
            class="mr-2"
          />
          <v-icon
            v-if="winnerLabel === false"
            data-cy="loser-icon"
            icon="mdi-trophy-broken"
            color="red-darken-2"
            class="mr-2"
          />
          <v-icon
            v-if="winnerLabel === null"
            data-cy="stalemate-icon"
            icon="mdi-handshake"
            color="grey-darken-2"
            class="mr-2"
          />
          <span class="game-name">
            {{ gameResultText }} — {{ name }}
          </span>
        </div>
        <p class="text-surface-1">
          <v-icon
            class="mr-4"
            size="medium"
            :icon="gameModeIcon"
            aria-hidden="true"
          />
          {{ gameModeText }} • {{ t('profile.opponent') }}: {{ opponentName }}
        </p>
      </v-col>
      <v-col cols="6" class="text-right">
        <v-btn variant="outlined" color="surface-1" @click="$emit('replay')">
          <v-icon icon="mdi-play-circle-outline" class="mr-2" />
          {{ t('profile.replay') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-divider color="surface-1" class="my-2" />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();
const _emit = defineEmits([ 'replay' ]);

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  isRanked: Boolean,
  winnerLabel: {
    type: [ Boolean, null ],
    default: null
  },
  opponentName: {
    type: String,
    required: true
  }
});

const gameResultText = computed(() => {
  if (props.winnerLabel === null) {return t('profile.stalemate');}
  return props.winnerLabel ? t('profile.win') : t('profile.lose');
});

const gameModeIcon = computed(() =>
  props.isRanked ? 'mdi-sword-cross' : 'mdi-coffee-outline'
);

const gameModeText = computed(() =>
  props.isRanked ? t('global.ranked') : t('global.casual')
);

</script>

<style scoped>
.history-item {
  padding: 10px;
}
.game-name {
  font-weight: 600;
  font-size: 1.2rem;
}
</style>
