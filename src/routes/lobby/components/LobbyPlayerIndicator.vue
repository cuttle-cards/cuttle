<template>
  <Transition name="cards" mode="out-in">
    <div v-if="playerUsername" class="player-card">
      <span class="player-name">{{ playerUsername }}</span>
      <div class="card-container" data-cy="lobby-card-container" :class="{ 'ready' : playerReady }">
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
        <div class="water-container">
          <div class="water" />
        </div>
      </div>
    </div>
    <div v-else class="player-indicator" :style="{ padding: playerPadding }">
      <div class="avatar">
        <h3>
          {{ message }}
        </h3>
      </div>
    </div>
  </Transition>
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

.card-container .card-front {
  rotate: y -180deg;
}

.card-container.ready .card-front,
.card-container .card-back {
  rotate: y 0deg;
}

.card-container.ready .card-back {
  rotate: y 180deg;
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

.water-container {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: transparent;
  border-radius: 10px;
  -webkit-clip-path: polygon(0 0, 100%, 0, 90% 100%, 10% 100%);
  clip-path: polygon(0 0, 100%, 0, 90% 100%, 10% 100%);
}
.water {
  width: 3600px;
  height: 800px;
  background-image: url('/img/waves.svg');
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  animation: waving 5s;
  animation-fill-mode: forwards;
  z-index: 1;
}

@keyframes waving {
  0%{ right: 3000px; top: -120px; opacity: 1; }
  50%{ opacity: 1; }
  80%{ opacity: 1; }
  100%{ right: 0; top: 500px; opacity: 0; }
}

.cards-leave-active {
  animation: burst-bubble 0.5s ease;
}

@keyframes burst-bubble {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.8);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
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
