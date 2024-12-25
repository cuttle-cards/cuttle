<template>
  <v-overlay
    id="unavailable-game-scrim"
    data-cy="unavailable-game-overlay"
    :model-value="show"
    class="game-overlay text-center d-flex justify-center align-center"
  >
    <div class="overlay-header">
      <h1 :class="[$vuetify.display.xs === true ? 'text-h5' : 'text-h3', ['font-weight-bold']]">
        {{ t('game.overlays.gameUnavailable.title') }}
      </h1>
      <p>{{ t('game.overlays.gameUnavailable.content') }}</p>
    </div>
    <v-btn
      color="secondary"
      class="mt-4"
      data-cy="leave-unavailable-game-button"
      @click="$router.push('/')"
    >
      Go Home
    </v-btn>
  </v-overlay>
</template>

<script>
import { useI18n } from 'vue-i18n';
export default {
  name: 'GameUnavailable',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
};
</script>

<style scoped lang="scss">
:deep(.v-overlay__content) {
  left: 0;
}
.game-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.overlay-header {
  font-weight: bold;
  background-color: rgba(var(--v-theme-surface-2));
  color: rgba(var(--v-theme-surface-1));
  padding: 24px;
  text-align: center;
  width: 100vw;
}
</style>
