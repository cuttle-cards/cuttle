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
    class="d-flex flex-column justify-space-around align-center overlay"
  >
    <div class="text-white d-flex flex-column justify-center align-center">
      <div id="close-wrapper" class="d-flex justify-space-between align-center w-100 mb-10">
        <h3 class="text-decoration-underline">Spectators</h3>
        <v-btn icon variant="text" color="white" data-cy="cancel-move" @click="overlay = false">
          <v-icon icon="mdi-close" size="large" />
        </v-btn>
      </div>
      <div>
        <ul class="spectatorList">
          <li v-for="spectator in spectators">{{ spectator }}</li>
        </ul>
      </div>
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
/* Overide vuetify overlay color */
.overlay {
  background-color: rgba(0, 0, 0, 0.575);
}

.spectatorList {
  margin-top: 5%;
  list-style-type: none;
  width: 100%;
  column-count: 4;
  overflow-y: auto;
  max-height: 800px;
}

.spectatorList li {
  max-width: 120px;
  padding: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 600px) {
  .spectatorList {
    max-height: 30rem;
  }
}
</style>
