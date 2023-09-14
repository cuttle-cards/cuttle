<template>
  <base-dialog
    :id="`create-game-dialog`"
    v-model="show"
    title="Create Game"
    :opacity="1"
    data-cy="create-game-dialog"
  >
    <template #activator>
      <v-btn
        class="text-surface-2"
        color="primary"
        data-cy="create-game-btn"
        rounded
        elevation="8"
      >
        Create Game
      </v-btn>
    </template>
    <template #body>
      <form name="create_game_form" class="d-flex align-center">
        <v-switch
          v-model="isRanked"
          :label="isRanked ? 'Ranked' : 'Normal'"
          data-cy="create-game-ranked-switch"
          color="surface-2"
        />
        <stats-scoring-dialog activator-color="surface-2" :show-button-text="false" />
      </form>
      <v-form @submit.prevent="submitNewGame">
        <v-text-field
          v-model="gameName"
          name="game-name"
          autofocus
          :disabled="loading"
          label="Game Name"
          variant="outlined"
          data-cy="game-name-input"
        />
      </v-form>
    </template>
    <template #actions>
      <v-form>
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
          form="create_game_form"
          type="submit"
          data-cy="submit-create-game"
          :loading="loading"
          color="surface-1"
          variant="flat"
          @click="submitNewGame"
        >
          Create Game
        </v-btn>
      </v-form>
    </template>
  </base-dialog>
</template>

<script>
import BaseDialog from '~core/components/BaseDialog.vue';
import StatsScoringDialog from '~core/components/StatsScoringDialog.vue';
import { getLocalStorage, setLocalStorage, LS_PREFERS_RANKED_NAME } from '_/utils/local-storage-utils.js';

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
      setLocalStorage(LS_PREFERS_RANKED_NAME, prefersRanked === true);
      this.isRanked = prefersRanked;
    },
    getRankedPreference() {
      return getLocalStorage(LS_PREFERS_RANKED_NAME) === 'true';
    },
  },
};
</script>
