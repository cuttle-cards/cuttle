<template>
  <div class="history-item">
    <v-row class="align-center justify-space-between">
      <v-col cols="6">
        <div class="d-flex align-center">
          <v-icon
            v-if="winnerLabel === 'You'"
            icon="mdi-trophy"
            color="yellow-darken-2"
            class="mr-2"
          />
          <v-icon
            v-if="winnerLabel === 'Opponent'"
            icon="mdi-trophy-broken"
            color="grey-darken-2"
            class="mr-2"
          />
          <span class="game-name">{{ name }}</span>
        </div>
        <p class="text-surface-1">
          {{ formattedDate }}
        </p>
        <p class="text-surface-1">
          {{ isRanked ? 'Ranked' : 'Casual' }} • Winner: {{ winnerLabel }}
        </p>
      </v-col>
      <v-col cols="6" class="text-right">
        <v-btn variant="outlined" color="surface-1" @click="$emit('replay')">
          <v-icon icon="mdi-play-circle-outline" class="mr-2" />
          Replay
        </v-btn>
      </v-col>
    </v-row>
    <v-divider color="surface-1" class="my-2" />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: String,
  isRanked: Boolean,
  createdAt: String,
  winnerLabel: String,
});

const formattedDate = computed(() =>
  props.createdAt ? new Date(props.createdAt).toLocaleString() : ''
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