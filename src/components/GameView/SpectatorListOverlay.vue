<template>
  <v-btn
    data-cy="spectate-list-button"
    class="pr-0"
    variant="flat"
    color="transparent"
    @click="overlay = !overlay"
  >
    <v-icon class="mr-1" icon="mdi-eye-outline" size="x-large" />
    <span class="pr-2">{{ spectators.length }}</span>
  </v-btn>

  <v-overlay
    v-model="overlay"
    data-cy="spectate-list-overlay"
    scrim=""
    class="d-flex flex-column justify-center align-center overlay"
  >
    <div class="text-white d-flex flex-column justify-center align-center">
      <h3>Spectators</h3>
      <ul class="spectatorList">
        <li v-for="spectator in spectators">{{ spectator }}</li>
      </ul>
    </div>

    <div id="close-wrapper" class="d-flex justify-center">
      <v-btn icon variant="text" color="white" size="x-large" data-cy="cancel-move" @click="overlay = false">
        <v-icon icon="mdi-close" size="large" />
      </v-btn>
    </div>
  </v-overlay>
</template>

<script>
export default {
  data() {
    return { overlay: false };
  },
  props: {
    spectators: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.overlay {
  background-color: rgba(0, 0, 0, 0.575);
  padding: 40px;
  border-radius: 15px;
}

.spectatorList {
  margin-top: 5%;
  list-style-type: none;
  column-count: 4;
}

.spectatorList li {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
