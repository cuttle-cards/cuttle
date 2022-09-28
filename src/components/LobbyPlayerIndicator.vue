<template>
  <div
    class="player-indicator"
    :class="{ ready: playerReady, 'player-in': playerUsername != null }"
    :style="{ padding: playerPadding }"
    elevation="1"
  >
    <div class="avatar text-truncate">
      <h3>
        {{ message }}
      </h3>
    </div>
    <div
      v-if="playerReady"
      class="ready-overlay text-truncate"
      :style="{ 'font-size': readyFontSize, 'padding-bottom': readyPadding }"
    >
      READY
    </div>
  </div>
</template>

<script>
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
  computed: {
    message() {
      return this.playerUsername || 'Invite';
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
.player-indicator {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(var(--v-theme-neutral-lighten3));
  border-radius: 8px;
}
.player-in {
  background-image: linear-gradient(45deg, rgba(var(--v-theme-secondary)), rgba(var(--v-theme-primary)));
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
  border: 4px dashed rgba(var(--v-theme-accent-darken1));
  background-color: rgba(var(--v-theme-neutral));
  z-index: 1;
}
.ready .avatar {
  border: 4px solid rgba(var(--v-theme-accent));
}
.ready-overlay {
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: flex-end;
  padding-top: 16px;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  border-radius: 8px;
  box-sizing: border-box;
}
</style>
