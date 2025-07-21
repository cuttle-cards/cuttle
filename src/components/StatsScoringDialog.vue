<template>
  <BaseDialog
    id="rankedScoring"
    v-model="show"
    :persistent="false"
    :title="$t('global.statsScoring.title')"
    :max-width="1250"
    :opacity="1"
  >
    <!-- Activator -->
    <template #activator="{ props }">
      <slot name="button">
        <v-btn
          v-bind="props"
          :color="activatorColor"
          variant="text"
          data-cy="ranked-info-button"
        >
          <span v-if="showButtonText">{{ $t('global.statsScoring.button') }}</span>
          <v-icon class="ml-1" icon="mdi-information-outline" aria-hidden="true" />
        </v-btn>
      </slot>
    </template>
    <!-- Dialog -->
    <template #body>
      <p>
        {{ $t('global.statsScoring.seasonDescription1a') }}
        <strong>{{ $t('global.statsScoring.seasonDescription1b') }}</strong>
      </p>
      <div class="d-flex justify-space-around flex-wrap mt-4">
        <AwardCard :username="$t('global.statsScoring.award1')" :place="1" class="mb-4" />
        <AwardCard :username="$t('global.statsScoring.award2')" :place="2" class="mb-4" />
        <AwardCard :username="$t('global.statsScoring.award3')" :place="3" class="mb-4" />
      </div>
      <p>
        {{ $t('global.statsScoring.seasonDescription2') }}
      </p>
      <v-list class="mt-4" bg-color="surface-2" base-color="surface-1">
        <v-list-item>
          <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.firstPlace">
            {{ $t('global.statsScoring.displayName', 5) }}
          </v-chip>
          {{ $t('global.statsScoring.points.5') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.secondPlace">
            {{ $t('global.statsScoring.displayName', 4) }}
          </v-chip>
          {{ $t('global.statsScoring.points.4') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.thirdPlace">
            {{ $t('global.statsScoring.displayName', 3) }}
          </v-chip>
          {{ $t('global.statsScoring.points.3') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="outlined" class="mr-2 mb-1" :color="theme.primary">
            {{ $t('global.statsScoring.displayName', 2) }}
          </v-chip>
          {{ $t('global.statsScoring.points.2') }}
        </v-list-item>
        <v-list-item>
          <v-chip variant="outlined" class="mr-2 mb-1" color="#000">
            {{ $t('global.statsScoring.displayName') }}
          </v-chip>
          {{ $t('global.statsScoring.points.1') }}
        </v-list-item>
      </v-list>
      <p class="mt-4">
        {{ $t('global.statsScoring.seasonDescription3') }}
        <strong> {{ $t('global.statsScoring.lordOfDeep') }} </strong>
      </p>
      <!-- Actions -->
    </template>
    <template #actions>
      <v-btn variant="outlined" color="surface-1" @click="show = false">
        {{ $t('global.statsScoring.gotIt') }}
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
      default: 'primary',
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
