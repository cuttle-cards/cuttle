<template>
  <div class="history-item" data-test="game-list-item">
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
            {{ winnerLabel === null ?
              t('profile.stalemate') :
              winnerLabel === true ?
                t('profile.win') :
                t('profile.lose') }} —
            {{ name }}
          </span>
        </div>
        <p class="text-surface-1">
          <v-icon
            class="mr-4"
            size="medium"
            :icon="isRanked ? 'mdi-sword-cross' : 'mdi-coffee-outline'"
            aria-hidden="true"
          />
          {{ isRanked ? t('global.ranked') : t('global.casual') }} • {{ t('profile.opponent') }}: {{ opponentName }}
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

const { t } = useI18n();
const _emit = defineEmits([ 'replay' ]);

const _props = defineProps({
  name: {
    type: String,
    required: true
  },
  isRanked: Boolean,
  winnerLabel: Boolean,
  opponentName: {
    type: String,
    required: true
  },
});

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
