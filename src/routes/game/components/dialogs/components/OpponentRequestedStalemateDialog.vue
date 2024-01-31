<template>
  <BaseDialog
    id="opponent-requested-stalemate-dialog"
    v-model="show"
    :title="t('game.dialogs.opponentRequestedStalemateDialog.title')"
  >
    <template #body>
      <p>{{ t('game.dialogs.opponentRequestedStalemateDialog.opponentHasRequested') }} </p>
      <div class="d-flex justify-center">
        <v-icon
          class="mr-8"
          size="80px"
          icon="mdi-offer"
          aria-hidden="true"
        />
        <v-icon
          size="80px"
          icon="mdi-help-circle"
          aria-hidden="true"
        />
      </div>
    </template>

    <template #actions>
      <v-btn
        variant="outlined"
        color="surface-1"
        class="mr-4"
        :diabled="loadingAccept"
        :loading="loadingReject"
        data-cy="reject-stalemate"
        aria-lable="Reject Request"
        @click="rejectStalemate"
      >
        {{ t('game.dialogs.opponentRequestedStalemateDialog.reject') }}
      </v-btn>
      <v-btn
        color="error"
        variant="flat"
        data-cy="accept-stalemate"
        :loading="loadingAccept"
        :disabled="loadingReject"
        aria-lable="Accept Stalemate"
        @click="acceptStalemate"
      >
        {{ t('game.dialogs.opponentRequestedStalemateDialog.accept') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapStores } from 'pinia';
import { useGameStore } from '@/stores/game';
import BaseDialog from '@/components/BaseDialog.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'OpponentRequestedStalemateDialog',
  components: {
    BaseDialog,
  },
  props: {
    modelValue: Boolean,
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      loadingAccept: false,
      loadingReject: false,
    };
  },
  computed: {
    ...mapStores(useGameStore),
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },
    },
  },
  methods: {
    async acceptStalemate() {
      this.loadingAccept = true;
      try {
        await this.gameStore.requestStalemate();
      } finally {
        this.loadingAccept = false;
        this.show = false;
      }
    },
    async rejectStalemate() {
      this.loadingReject = true;
      try {
        await this.gameStore.rejectStalemate();
      } finally {
        this.loadingReject = false;
        this.show = false;
      }
    },
  },
};
</script>
