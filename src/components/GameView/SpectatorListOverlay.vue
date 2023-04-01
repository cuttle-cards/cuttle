<template>
  <div class="mainDiv">
    <v-btn data-cy="spectate-list-button" color="accent" size="small" @click="overlay = !overlay">
      Spectators(155)
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
          <li>User1</li>
          <li>User1</li>
          <li>User1</li>
          <li>User1</li>
          <li>User1User1</li>
          <li>User1</li>
          <li>User1</li>
          <li>User1</li>
          <li>User1</li>
          <li>User1User1User1</li>
          <li>User1</li>
          <li>User1</li>
          <li>User1</li>
          <li>User1</li>
          <li>User1User1User1</li>
          <li>User1</li>
        </ul>
      </div>

      <div id="close-wrapper" class="d-flex justify-center">
        <v-btn
          icon
          variant="text"
          color="white"
          size="x-large"
          data-cy="cancel-move"
          @click="overlay = false"
        >
          <v-icon icon="mdi-close" size="large" />
        </v-btn>
      </div>
    </v-overlay>
  </div>
</template>

<script>
export default {
  data: () => ({
    overlay: false,
  }),
};
</script>

<style scoped>
.mainDiv {
  grid-column-start: 11;
  grid-column-end: span 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
}

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
