<template>
  <base-dialog v-model="show" id="create-game" title="Create Game">
    <template #activator>
      <v-btn class="text-surface-2" color="surface-1" data-cy="create-game-btn" rounded elevation="8">
        Create Game
      </v-btn>
    </template>
    <template #body>
      <div class="d-flex align-center">
        <v-switch
          v-model="isRanked"
          :label="isRanked ? 'Ranked' : 'Normal'"
          data-cy="create-game-ranked-switch"
          color="surface-2"
        />
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
    </template>
    <template #actions>
      <v-btn
        data-cy="cancel-create-game"
        :disabled="loading"
        variant="text"
        color="surface-1"
        @click="cancelCreateGame"
      >
        Cancel
      </v-btn>
      <v-btn
        data-cy="submit-create-game"
        :loading="loading"
        color="surface-1"
        variant="flat"
        @click="submitNewGame"
      >
        Create Game
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import StatsScoringDialog from '@/components/StatsScoringDialog.vue';
import BaseDialog from '@/components/Global/BaseDialog.vue';

const LS_PREFERS_RANKED_NAME = 'prefersRanked';

export default {
  name: 'CreateGameDialog',
  components: { StatsScoringDialog, BaseDialog },
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
