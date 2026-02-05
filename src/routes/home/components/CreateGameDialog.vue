<template>
  <BaseDialog
    :id="`create-game-dialog`"
    v-model="show"
    :title="t('home.submitCreateGame')"
    :opacity="1"
    data-cy="create-game-dialog"
  >
    <template #activator>
      <v-btn
        class="px-16 w-100"
        color="primary"
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
        <button
          class="text-cyan-lighten-2"
          @click="submitAiGame"
        >
          {{ t('home.playAiLink') }}
        </button>
        {{ t('home.playAiContent2') }}
      </h4>
      <v-form id="create-game-form" @submit.prevent="submitNewGame">
        <div class="d-flex align-center">
          <StatsScoringDialog :show-button-text="false" />
          <v-switch
            v-model="isRanked"
            class="d-flex align-center"
            :label="isRanked ? t('global.ranked') : t('global.casual')"
            data-cy="create-game-ranked-switch"
            color="primary"
          />
        </div>
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
      <v-btn
        class="mr-2"
        data-cy="cancel-create-game"
        :disabled="loading"
        variant="text"
        color="game-board"
        @click="cancelCreateGame"
      >
        {{ t('global.cancel') }}
      </v-btn>
      <v-btn
        type="submit"
        data-cy="submit-create-game"
        :loading="loading"
        color="game-board"
        variant="flat"
        form="create-game-form"
      >
        {{ t('home.submitCreateGame') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameListStore } from '@/stores/gameList';
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import StatsScoringDialog from '@/components/StatsScoringDialog.vue';
import { getLocalStorage, setLocalStorage, LS_PREFERS_RANKED_NAME } from '_/utils/local-storage-utils.js';

export default {
  name: 'CreateGameDialog',
  components: { StatsScoringDialog, BaseDialog },
  emits: [ 'error' ],
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
  created() {
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
        .then((res) => {
          const { gameId } = res;
          this.$router.push(`/lobby/${gameId}`);
        })
        .catch(this.handleError);
    },
    async submitAiGame() {
      try {
        const gameId = await this.gameListStore.requestCreateAIGame();
        this.$router.push(`/ai/${gameId}`);
      } catch (err) {
        this.handleError(err);
      }
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
