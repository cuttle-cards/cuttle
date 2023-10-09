<template>
  <base-dialog
    :id="`create-game-dialog`"
    v-model="show"
    :title="t('home.submitCreateGame')"
    :opacity="1"
    data-cy="create-game-dialog"
  >
    <template #activator>
      <v-btn
        class="px-16 w-100"
        color="newPrimary"
        size="x-large"
        text-color="white"
        data-cy="create-game-btn"
      >
        {{ t('home.openCreateGame') }}
      </v-btn>
    </template>
    <template #body>
      <h4>
        {{ t('home.playAiContent') }}
        <a
          class="text-cyan-lighten-2 text-decoration-none"
          href="https://human-ai-interaction.github.io/cuttle-bot/"
          target="_blank"
        >
          {{ t('home.playAiLink') }}
        </a>
        {{ t('home.playAiContent2') }}
      </h4>
      <form name="create_game_form" class="d-flex align-center">
        <v-switch
          v-model="isRanked"
          :label="isRanked ? t('global.ranked') : t('global.casual')"
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
          :label="t('home.gameName')"
          variant="outlined"
          data-cy="game-name-input"
        />
      </v-form>
    </template>
    <template #actions>
      <v-form>
        <v-btn
          class="mr-2"
          data-cy="cancel-create-game"
          :disabled="loading"
          variant="text"
          color="surface-1"
          @click="cancelCreateGame"
        >
          {{ t('global.cancel') }}
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
          {{ t('home.submitCreateGame') }}
        </v-btn>
      </v-form>
    </template>
  </base-dialog>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameListStore } from '@/stores/gameList';
import BaseDialog from '@/components/Global/BaseDialog.vue';
import StatsScoringDialog from '@/components/StatsScoringDialog.vue';
import { getLocalStorage, setLocalStorage, LS_PREFERS_RANKED_NAME } from '../../utils/local-storage-utils.js';
import { useI18n } from 'vue-i18n';

export default {
  name: 'CreateGameDialog',
  components: { StatsScoringDialog, BaseDialog },
  emits: ['error'],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      show: false,
      gameName: '',
      loading: false,
      isRanked: false,
    };
  },
  computed: {
    ...mapStores(useGameListStore),
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
      this.gameListStore
        .requestCreateGame({
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
