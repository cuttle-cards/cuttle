<template>
  <div v-if="playerUsername" class="player-card">
    <span class="player-name">{{ playerUsername }}</span>
    <div class="card-container" :class="[playerReady ? 'ready' : 'notReady']" data-cy="lobby-card-container">
      <img
        src="/img/cards/card-ready.png"
        class="card-front"
        alt="card front"
        data-cy="lobby-ready-card"
      >
      <img
        src="/img/cards/card-back.png"
        class="card-back"
        alt="card back"
        data-cy="lobby-back-card"
      >
    </div>
  </div>
  <div v-else class="player-indicator" :style="{ padding: playerPadding }">
    <div class="avatar">
      <h3>
        {{ message }}
      </h3>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
export default {
  name: 'LobbyPlayerIndicator',
  props: {
    playerUsername: {
      type: String,
      default: null,
    },
    playerReady: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  computed: {
    message() {
      return this.playerUsername || this.t('lobby.invite');
    },
    playerPadding() {
      return this.$vuetify.display.mdAndUp ? '72px' : '32px';
    },
    readyFontSize() {
      return this.$vuetify.display.mdAndUp ? '1.5em' : '1.15em';
    },
    readyPadding() {
      return this.$vuetify.display.mdAndUp ? '8px' : '4px';
    },
  },
};
</script>

<style lang="scss" scoped>
.card-container {
  height: 35vh;
  width: calc(35vh / 1.45);
  transform-style: preserve-3d;
  perspective: 1200px;
  position: relative;
}
.card-container img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.4s ease-in-out;
  backface-visibility: hidden;
}
.card-back {
  z-index: -1;
}
.card-container.ready .card-front,
.card-container.notReady .card-back {
  rotate: y 0deg;
  filter: blur(0px);
}
.card-container.notReady .card-front {
  rotate: y -180deg;
  filter: blur(5px);
}
.card-container.ready .card-back {
  rotate: y 180deg;
  filter: blur(5px);
}

.player-card {
  height: 40vh;
  display: flex;
  flex-direction: column;
  place-items: center;
}
.player-name {
  padding: 5px;
  font-size: 1.5rem;
}
.player-indicator {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}
.avatar {
  display: inline-block;
  position: relative;
  width: 124px;
  height: 124px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 4px dashed rgba(var(--v-theme-surface-2));
  background-color: rgba(var(--v-theme-surface-1));
  z-index: 1;
}

@media (min-width: 1920px) {
  .player-card{
    height: 50vh;
  }
}

@media (max-width: 600px) {
  .player-card{
    height: 22vh;
  }
  .player-name {
    padding: 2px;
    font-size: 1rem;
  }
  .card-container {
    max-height: 20vh;
    max-width: calc(20vh / 1.45);
  }
}
</style>
