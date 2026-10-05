<template>
  <BaseDialog
    id="email-preference-dialog"
    v-model="show"
    variant="dark"
    :max-width="500"
    :title="t('emailPreference.title')"
  >
    <template #body>
      <p class="mb-4" data-cy="email-preference-explanation">
        {{ t('emailPreference.explanation') }}
      </p>
      <v-form
        v-if="step === STEPS.EMAIL"
        id="email-preference-form"
        v-model="isEmailFormValid"
        @submit.prevent="sendCode"
      >
        <v-text-field
          v-model="email"
          :label="t('emailPreference.emailLabel')"
          type="email"
          autocomplete="email"
          :rules="emailRules"
          :error-messages="errorMessage"
          data-cy="email-preference-input"
          @update:model-value="errorMessage = ''"
        />
        <v-checkbox
          v-model="promotional"
          :label="t('emailPreference.promotionalLabel')"
          density="compact"
          hide-details
          data-cy="email-preference-promotional"
        />
      </v-form>
      <v-form
        v-else
        id="email-preference-form"
        @submit.prevent="verifyCode"
      >
        <p class="mb-2">
          {{ t('emailPreference.codeSent', { email }) }}
        </p>
        <v-otp-input
          v-model="code"
          length="6"
          type="number"
          :error="!!errorMessage"
          data-cy="email-preference-code"
          @update:model-value="errorMessage = ''"
        />
        <p v-if="errorMessage" class="text-error text-center" data-cy="email-preference-error">
          {{ errorMessage }}
        </p>
        <div class="d-flex justify-space-between">
          <v-btn
            variant="text"
            color="base-light"
            data-cy="email-preference-back"
            @click="goBack"
          >
            {{ t('emailPreference.back') }}
          </v-btn>
          <v-btn
            variant="text"
            color="base-light"
            :disabled="resendCooldown > 0"
            :loading="loading && resending"
            data-cy="email-preference-resend"
            @click="resendCode"
          >
            {{ resendText }}
          </v-btn>
        </div>
      </v-form>
    </template>
    <template #actions>
      <v-btn
        variant="text"
        color="base-dark"
        data-cy="email-preference-dismiss"
        @click="dismiss"
      >
        {{ t('emailPreference.noThanks') }}
      </v-btn>
      <v-btn
        v-if="step === STEPS.EMAIL"
        form="email-preference-form"
        type="submit"
        color="primary"
        variant="flat"
        :loading="loading"
        :disabled="!isEmailFormValid"
        data-cy="email-preference-send-code"
      >
        {{ t('emailPreference.sendCode') }}
      </v-btn>
      <v-btn
        v-else
        form="email-preference-form"
        type="submit"
        color="primary"
        variant="flat"
        :loading="loading && !resending"
        :disabled="code.length !== 6"
        data-cy="email-preference-verify"
      >
        {{ t('emailPreference.verify') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { getLocalStorage, setLocalStorage, LS_EMAIL_PROMPT_DISMISSED } from '_/utils/local-storage-utils.js';
import { useUserEmailStore } from '@/stores/userEmail';
import { useSnackbarStore } from '@/stores/snackbar';
import BaseDialog from '@/components/BaseDialog.vue';

const props = defineProps({
  // Wait to open until other home page dialogs (e.g. the announcement) have closed
  waiting: {
    type: Boolean,
    default: false,
  },
});

const STEPS = {
  EMAIL: 'email',
  CODE: 'code',
};
const RESEND_COOLDOWN_SECONDS = 60;

const { t } = useI18n();
const userEmailStore = useUserEmailStore();
const snackbarStore = useSnackbarStore();

const show = ref(false);
const needsEmail = ref(false);
const step = ref(STEPS.EMAIL);
const email = ref('');
const promotional = ref(false);
const code = ref('');
const isEmailFormValid = ref(false);
const loading = ref(false);
const resending = ref(false);
const errorMessage = ref('');
const resendCooldown = ref(0);
let cooldownTimer = null;

const emailRules = [ (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val?.trim() ?? '') || t('emailPreference.error.invalidEmail') ];

const resendText = computed(() => (resendCooldown.value > 0
  ? t('emailPreference.resendIn', { seconds: resendCooldown.value })
  : t('emailPreference.resend')));

function startCooldown() {
  clearInterval(cooldownTimer);
  resendCooldown.value = RESEND_COOLDOWN_SECONDS;
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer);
    }
  }, 1000);
}

async function sendCode() {
  if (!isEmailFormValid.value) {
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    await userEmailStore.requestCode(email.value.trim(), promotional.value);
    code.value = '';
    step.value = STEPS.CODE;
    startCooldown();
  } catch (err) {
    errorMessage.value = t(err.message);
  } finally {
    loading.value = false;
  }
}

async function resendCode() {
  resending.value = true;
  loading.value = true;
  errorMessage.value = '';
  try {
    await userEmailStore.requestCode(email.value.trim(), promotional.value);
    startCooldown();
  } catch (err) {
    errorMessage.value = t(err.message);
  } finally {
    loading.value = false;
    resending.value = false;
  }
}

async function verifyCode() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await userEmailStore.verifyCode(code.value);
    show.value = false;
    snackbarStore.alert(t('emailPreference.verified'), 'success');
  } catch (err) {
    errorMessage.value = t(err.message);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  step.value = STEPS.EMAIL;
  errorMessage.value = '';
}

function dismiss() {
  setLocalStorage(LS_EMAIL_PROMPT_DISMISSED, 'true');
  show.value = false;
}

watch(
  [ needsEmail, () => props.waiting ],
  ([ needs, waiting ]) => {
    if (needs && !waiting) {
      show.value = true;
      // Only prompt once per page load
      needsEmail.value = false;
    }
  },
);

onMounted(async () => {
  if (getLocalStorage(LS_EMAIL_PROMPT_DISMISSED)) {
    return;
  }
  try {
    await userEmailStore.requestEmail();
    needsEmail.value = !userEmailStore.email;
  } catch {
    // Don't prompt if we can't tell whether the user has an email
  }
});

onBeforeUnmount(() => {
  clearInterval(cooldownTimer);
});
</script>
