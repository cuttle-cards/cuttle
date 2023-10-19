<template>
  <div v-if="playerUsername" class="player-card">
    <span class="player-name">{{ playerUsername }}</span>
    <Transition name="card-flip">
      <img v-if="playerReady" src="/img/cards/card-ready.png" class="opponent-card-back" alt="card back" />
      <img v-else src="/img/cards/card-back.png" class="opponent-card-back" alt="card back" />
    </Transition>
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
.opponent-card-back {
  border-radius: 10px;
  max-height: 40vh;
  max-width: calc(40vh / 1.45);
  width: 100%;
}
.card-flip-enter-active {
  transition: all 1s;
}
.card-flip-enter-from {
  transform: rotateY(-90deg);
}
.card-flip-enter-to {
  transform: rotateY(0deg);
}
.player-card {
  display: grid;
  justify-content: center;
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

@media (max-width: 660px) {
  .player-name {
    padding: 2px;
    font-size: 1rem;
  }
  .opponent-card-back {
    max-height: 20vh;
    max-width: calc(20vh / 1.45);
  }
}
</style>
