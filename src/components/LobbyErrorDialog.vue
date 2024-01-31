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
        <h4>Cannot Join Lobby {{ errorMessage }}</h4>
      </div>
    </template>
    <template #actions>
      <v-btn
        data-cy="how-it-works-okay"
        color="surface-1"
        variant="flat"
        class="text-surface-2"
        @click="close"
      >
        Go Home
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from '@/components/BaseDialog.vue';
import { useRouter, useRoute } from 'vue-router';
const { showLobbyError } = defineProps({ showLobbyError: {type: Boolean, default: false } });
const router = useRouter();
const route = useRoute();

const errorMessage = route.meta.error ? route.meta.error : 'Unknown Error';

const close = () => {
 router.push('/');
};
</script>