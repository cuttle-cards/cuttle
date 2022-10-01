<template>
  <v-dialog v-model="show">
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        data-cy="create-game-btn"
        rounded
        v-bind="attrs"
        elevation="8"
        v-on="on"
      >
        + Create Game
      </v-btn>
    </template>
    <v-card data-cy="create-game-dialog">
      <v-card-title>
        <h2>Create Game</h2>
      </v-card-title>
      <v-card-text>
        <v-switch v-model="isRanked" label="Ranked" data-cy="create-game-ranked-switch" />
        <v-text-field
          v-model="gameName"
          autofocus
          :disabled="loading"
          label="Game Name"
          outlined
          data-cy="game-name-input"
          @keydown.enter="submitNewGame"
        />
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          data-cy="cancel-create-game"
          :disabled="loading"
          text
          color="primary"
          @click="cancelCreateGame"
        >
          Cancel
        </v-btn>
        <v-btn
          data-cy="submit-create-game"
          :loading="loading"
          color="primary"
          depressed
          @click="submitNewGame"
        >
          Create Game
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CreateGameDialog',
  data() {
    return {
      show: false,
      gameName: '',
      loading: false,
      isRanked: false,
    };
  },
  methods: {
    submitNewGame() {
      this.loading = true;
      this.$store
        .dispatch('requestCreateGame', {
          gameName: this.gameName,
          ranked: this.isRanked,
        })
        .then(() => {
          this.gameName = '';
          this.loading = false;
          this.show = false;
        })
        .catch(this.handleError);
    },
    cancelCreateGame() {
      this.gameName = '';
      this.loading = false;
      this.show = false;
    },
    handleError(err) {
      this.$emit('error', err);
      this.cancelCreateGame();
    },
  },
};
</script>
