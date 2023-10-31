<template>
  <BaseDialog
    id="rankedScoring"
    v-model="show"
    :persistent="false"
    title="Ranked Scoring"
    max-width="1250"
    :opacity="1"
  >
    <!-- Activator -->
    <template #activator="{ props }">
      <slot name="button">
        <v-btn
          v-bind="props"
          :color="activatorColor"
          class="mb-2"
          variant="text"
          data-cy="ranked-info-button"
        >
          <span v-if="showButtonText">{{ t('game.dialogs.statsScoringDialog.ranksDetermination') }}</span>
          <v-icon class="ml-1" icon="mdi-information-outline" aria-hidden="true" />
        </v-btn>
      </slot>
    </template>
    <!-- Dialog -->
    <template #body>
      <p>
        {{ t('game.dialogs.statsScoringDialog.competitiveCuttle.description') }}
        <strong>{{ t('game.dialogs.statsScoringDialog.competitiveCuttle.highlight') }}</strong>
      </p>
      <div class="d-flex justify-space-around flex-wrap mt-4">
        <AwardCard username="Champion player" :place="1" class="mb-4" />
        <AwardCard username="Second Place Player" :place="2" class="mb-4" />
        <AwardCard username="Third Place Player" :place="3" class="mb-4" />
      </div>
      <p>
        {{ t('game.dialogs.statsScoringDialog.seasonDescription') }}
      </p>
      <v-list class="mt-4" bg-color="surface-2" base-color="surface-1">
        <v-list-item>
          <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.firstPlace">
            5 {{ t('game.dialogs.statsScoringDialog.points.displayName') }}
          </v-chip>
          {{ t('game.dialogs.statsScoringDialog.points.description.5Points') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.secondPlace">
            4 {{ t('game.dialogs.statsScoringDialog.points.displayName') }}
          </v-chip>
          {{ t('game.dialogs.statsScoringDialog.points.description.4Points') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.thirdPlace">
            3 {{ t('game.dialogs.statsScoringDialog.points.displayName') }}
          </v-chip>
          {{ t('game.dialogs.statsScoringDialog.points.description.3Points') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="outlined" class="mr-2 mb-1" :color="theme.primary">
            2 {{ t('game.dialogs.statsScoringDialog.points.displayName') }}
          </v-chip>
          {{ t('game.dialogs.statsScoringDialog.points.description.2Points') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="outlined" class="mr-2 mb-1" color="#000">
            1 {{ t('game.dialogs.statsScoringDialog.points.singular') }}
          </v-chip>
          {{ t('game.dialogs.statsScoringDialog.points.description.1Point') }}
        </v-list-item>
      </v-list>
      <p class="mt-4">
        {{ t('game.dialogs.statsScoringDialog.statsAndRanking') }}
        <strong> {{ t('game.dialogs.statsScoringDialog.lordOfTheDeep') }} </strong>
      </p>
      <!-- Actions -->
    </template>
    <template #actions>
      <v-btn variant="outlined" color="surface-1" @click="show = false">
        {{ t('game.dialogs.statsScoringDialog.gotIt') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/BaseDialog.vue';
import AwardCard from '@/components/AwardCard.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'StatsScoringDialog',
  components: {
    AwardCard,
    BaseDialog,
  },
  props: {
    showButtonText: {
      type: Boolean,
      default: true,
    },
    activatorColor:{
      type: String,
      default: 'primary',
  }
  },
  data() {
    return {
      show: false,
    };
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes.cuttleTheme.colors;
    },
  },
};
</script>
