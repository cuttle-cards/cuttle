<template>
  <div id="player-hand-targeting" class="d-flex justify-start" :class="{ 'my-turn': isPlayersTurn }">
    <card :suit="selectedCard.suit" :rank="selectedCard.rank" :is-selected="true" @click="$emit('cancel')" />
    <div id="target-selection-header-wrapper" class="d-flex flex-column align-center">
      <h2>Choose {{ moveDisplayName }} Target</h2>
      <v-btn outlined color="primary" class="mt-2" data-cy="cancel-target" @click="$emit('cancel')">
        Cancel
      </v-btn>
    </div>
    <v-btn icon data-cy="cancel-target-mobile" @click="$emit('cancel')">
      <v-icon icon="mdi-close" x-large />
    </v-btn>
  </div>
</template>

<script>
import Card from '@/components/GameView/Card.vue';

export default {
  name: 'TargetSelectionOverlay',
  components: {
    Card,
  },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    selectedCard: {
      type: Object,
      required: true,
    },
    isPlayersTurn: {
      type: Boolean,
      required: true,
    },
    moveDisplayName: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
#player-hand-targeting {
  padding: 12px;
}
#target-selection-header-wrapper {
  width: 100%;
}
</style>
