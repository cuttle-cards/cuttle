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
        color="newPrimary"
        size="x-large"
        text-color="white"
        data-cy="create-game-btn"
      >
        {{ t('home.openCreateGame') }}
      </v-btn>
    </template>
    <template #body>
      <v-form id="create-game-form" @submit.prevent="submitNewGame">
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
        <div class="d-flex align-center">
          <StatsScoringDialog activator-color="surface-2" :show-button-text="false" />
          <v-switch
            v-model="isRanked"
            class="d-flex align-center"
            :label="isRanked ? t('global.ranked') : t('global.casual')"
            data-cy="create-game-ranked-switch"
            color="surface-2"
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
        color="surface-1"
        @click="cancelCreateGame"
      >
        {{ t('global.cancel') }}
      </v-btn>
      <v-btn
        type="submit"
        data-cy="submit-create-game"
        :loading="loading"
        color="surface-1"
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
        .then((res) => {
          const { gameId } = res;
          this.$router.push(`/lobby/${gameId}`);
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
