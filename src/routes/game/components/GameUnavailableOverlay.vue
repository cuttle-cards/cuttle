<template>
  <BaseOverlay
    id="unavailable-game-scrim"
    data-cy="unavailable-game-overlay"
    :model-value="show"
  >
    <template #header>
      {{ t('game.overlays.gameUnavailable.title') }}
    </template>
    <p>{{ t('game.overlays.gameUnavailable.content') }}</p>
    <v-btn
      color="secondary"
      class="mt-4"
      data-cy="leave-unavailable-game-button"
      @click="$router.push('/')"
    >
      Go Home
    </v-btn>
  </BaseOverlay>
</template>

<script>
import { useI18n } from 'vue-i18n';
import BaseOverlay from '@/components/BaseOverlay.vue';

export default {
  name: 'GameUnavailable',
  components: {
    BaseOverlay,
  },
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