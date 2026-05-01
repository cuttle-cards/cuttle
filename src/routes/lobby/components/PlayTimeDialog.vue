<template>
  <BaseDialog
    id="play-time-dialog"
    v-model="show"
    variant="dark"
    :persistent="false"
    :max-width="500"
    :title="t('lobby.playTimeDialog.title')"
  >
    <template #body>
      <p data-cy="play-time-dialog-sessions">
        {{ t('lobby.playTimeDialog.openPlaySessions') }}
      </p>
      <p class="mt-4" data-cy="play-time-dialog-discord">
        <span>
          {{ t('lobby.playTimeDialog.discord') }}
          <a
            class="discord-link"
            data-cy="play-time-dialog-discord-link"
            href="https://discord.com/invite/dS5BRjaHrm"
            target="_blank"
            rel="noopener"
          >
            {{ t('lobby.playTimeDialog.discordLink') }}
          </a>
          <strong>{{ t('lobby.playTimeDialog.findAGame') }}</strong>
        </span>
      </p>
      <p class="mt-4" data-cy="play-time-dialog-bot">
        {{ t('lobby.playTimeDialog.botPlay') }}
      </p>
    </template>
    <template #actions>
      <v-btn
        variant="text"
        color="base-dark"
        data-cy="play-time-dialog-go-home"
        @click="goHome"
      >
        {{ t('lobby.playTimeDialog.goHome') }}
      </v-btn>
      <v-btn
        color="primary"
        variant="flat"
        data-cy="play-time-dialog-stay"
        @click="dismiss"
      >
        {{ t('lobby.playTimeDialog.stay') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { getLocalStorage, setLocalStorage, LS_PLAY_TIME_DIALOG_DISMISSED } from '_/utils/local-storage-utils.js';
import BaseDialog from '@/components/BaseDialog.vue';

const emit = defineEmits([ 'leave' ]);
const { t } = useI18n();

const show = ref(false);
let timer = null;

function dismiss() {
  show.value = false;
  setLocalStorage(LS_PLAY_TIME_DIALOG_DISMISSED, 'true');
}

function goHome() {
  dismiss();
  emit('leave');
}

onMounted(() => {
  if (!getLocalStorage(LS_PLAY_TIME_DIALOG_DISMISSED)) {
    timer = setTimeout(() => {
      show.value = true;
    }, 60000);
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
});
</script>

<style scoped>
.discord-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}
</style>
