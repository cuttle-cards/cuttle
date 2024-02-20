<template>
  <BaseDialog
    id="ErrorDialog"
    :model-value="showLobbyError"
    title="Oops!"
    :opacity="1"
    data-cy="create-game-dialog"
  >
    <template #body>
      <div>
        <p>{{ `${ t('lobby.cannotJoin')} ${errorMessage}` }}</p>
      </div>
    </template>
    <template #actions>
      <v-btn
        data-cy="lobby-error-go-home"
        color="surface-1"
        variant="flat"
        class="text-surface-2"
        @click="close"
      >
        {{ t('game.menus.gameMenu.home') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import BaseDialog from '@/components/BaseDialog.vue';
import { useRouter, useRoute } from 'vue-router';
defineProps({
  showLobbyError: {
    type: Boolean,
    default: false
  }
});
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const errorMessage = route.meta.error ? route.meta.error : 'Unknown Error';

const close = () => {
 router.push('/');
};
</script>
