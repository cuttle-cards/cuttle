<template>
  <BaseDialog
    id="rankedScoring"
    v-model="show"
    :persistent="false"
    :title="$t('stats.statsScoring.title')"
    :max-width="1250"
    :opacity="1"
    variant="light"
  >
    <!-- Activator -->
    <template #activator="{ props }">
      <slot name="button">
        <v-btn
          v-bind="props"
          :color="activatorColor"
          variant="text"
          data-cy="ranked-info-button"
          class="text-button"
        >
          <span v-if="showButtonText">{{ $t('stats.statsScoring.button') }}</span>
          <v-icon class="ml-1" icon="mdi-information-outline" aria-hidden="true" />
        </v-btn>
      </slot>
    </template>
    <!-- Dialog -->
    <template #body>
      <p>
        {{ $t('stats.statsScoring.seasonDescription1a') }}
        <strong>{{ $t('stats.statsScoring.seasonDescription1b') }}</strong>
      </p>
      <div class="d-flex justify-space-around flex-wrap mt-4">
        <AwardCard :username="$t('stats.statsScoring.award1')" :place="1" class="mb-4" />
        <AwardCard :username="$t('stats.statsScoring.award2')" :place="2" class="mb-4" />
        <AwardCard :username="$t('stats.statsScoring.award3')" :place="3" class="mb-4" />
      </div>
      <p>
        {{ $t('stats.statsScoring.seasonDescription2') }}
      </p>
      <v-list class="mt-4" bg-color="game-board" base-color="game-card">
        <v-list-item>
          <v-chip variant="flat" class="mr-2 mb-1" :color="theme.firstPlace">
            {{ $t('stats.statsScoring.displayName', 5) }}
          </v-chip>
          {{ $t('stats.statsScoring.points.5') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="flat" class="mr-2 mb-1" :color="theme.secondPlace">
            {{ $t('stats.statsScoring.displayName', 4) }}
          </v-chip>
          {{ $t('stats.statsScoring.points.4') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="flat" class="mr-2 mb-1" color="game-card">
            {{ $t('stats.statsScoring.displayName', 3) }}
          </v-chip>
          {{ $t('stats.statsScoring.points.3') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="outlined" class="mr-2 mb-1" color="game-card">
            {{ $t('stats.statsScoring.displayName', 2) }}
          </v-chip>
          {{ $t('stats.statsScoring.points.2') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="outlined" class="mr-2 mb-1" color="game-card">
            {{ $t('stats.statsScoring.displayName') }}
          </v-chip>
          {{ $t('stats.statsScoring.points.1') }}
        </v-list-item>
      </v-list>
      <p class="mt-4">
        {{ $t('stats.statsScoring.seasonDescription3') }}
        <strong> {{ $t('stats.statsScoring.lordOfDeep') }} </strong>
      </p>
      <!-- Actions -->
    </template>
    <template #actions>
      <v-btn variant="outlined" color="game-board" @click="show = false">
        {{ $t('stats.statsScoring.gotIt') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/BaseDialog.vue';
import AwardCard from '@/components/AwardCard.vue';

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
      default: 'game-card',
    }
  },
  data() {
    return {
      show: false,
    };
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes.cuttleTheme.colors;
    },
  },
};
</script>
