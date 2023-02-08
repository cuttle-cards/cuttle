<template>
  <v-dialog v-model="show">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="primary" data-cy="create-game-btn" rounded elevation="8">
        Create Game
      </v-btn>
    </template>
    <v-card data-cy="create-game-dialog">
      <v-card-title>
        <h2>Create Game</h2>
      </v-card-title>
      <v-card-text>
        <div class="d-flex align-center">
          <v-switch v-model="isRanked" label="Ranked" data-cy="create-game-ranked-switch" color="primary" />
          <stats-scoring-dialog :show-button-text="false" />
        </div>
        <v-text-field
          v-model="gameName"
          autofocus
          :disabled="loading"
          label="Game Name"
          variant="outlined"
          data-cy="game-name-input"
          @keydown.enter="submitNewGame"
        />
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          data-cy="cancel-create-game"
          :disabled="loading"
          variant="text"
          color="primary"
          @click="cancelCreateGame"
        >
          Cancel
        </v-btn>
        <v-btn
          data-cy="submit-create-game"
          :loading="loading"
          color="primary"
          variant="flat"
          @click="submitNewGame"
        >
          Create Game
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import StatsScoringDialog from '@/components/StatsScoringDialog.vue';

const LS_PREFERS_RANKED_NAME = 'prefersRanked';

export default {
  name: 'CreateGameDialog',
  components: { StatsScoringDialog },
  emits: ['error'],
  data() {
    return {
      show: false,
      gameName: '',
      loading: false,
      isRanked: false,
    };
  },
  watch: {
    isRanked(isRanked) {
      this.setRankedPreference(isRanked);
    },
  },
  mounted() {
    this.isRanked = this.getRankedPreference();
  },
  methods: {
    submitNewGame() {
      this.loading = true;
      this.$store
        .dispatch('requestCreateGame', {
          gameName: this.gameName,
          isRanked: this.isRanked,
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
    setRankedPreference(prefersRanked) {
      try {
        localStorage.setItem(LS_PREFERS_RANKED_NAME, prefersRanked === true);
      } catch (err) {
        // Local storage is full or something else happened so don't set the value
      }
      this.isRanked = prefersRanked;
    },
    getRankedPreference() {
      return localStorage.getItem(LS_PREFERS_RANKED_NAME) === 'true';
    },
  },
};
</script>
