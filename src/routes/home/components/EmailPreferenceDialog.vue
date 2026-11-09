<template>
  <BaseDialog
    id="email-preference-dialog"
    v-model="isOpen"
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
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import EmailValidation from '_/utils/EmailValidation.json';
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

const { t, te } = useI18n();
const authStore = useAuthStore();
const snackbarStore = useSnackbarStore();

const show = ref(false);
// Read at mount like the other home page dialogs. Only prompt once per page load
const hasPrompted = ref(!!getLocalStorage(LS_EMAIL_PROMPT_DISMISSED));
// Stay hidden while another home page dialog is open. The announcement reports that it's open
// after this component mounts, so this can't rely on the order the dialogs start up in
const isOpen = computed({
  get: () => show.value && !props.waiting,
  set: (value) => {
    show.value = value;
  },
});
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

// Same rules as the hasValidEmail policy
const emailPattern = new RegExp(EmailValidation.pattern);
const emailRules = [ (val) => {
  const trimmed = val?.trim() ?? '';
  return (trimmed.length <= EmailValidation.maxLength && emailPattern.test(trimmed))
    || t('emailPreference.error.invalidEmail');
} ];

// The API rejects with an i18n key. Anything else (e.g. a network failure) gets the fallback
function errorText(err, fallbackKey) {
  const key = err?.message ?? err;
  return te(key) ? t(key) : t(fallbackKey);
}

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
    await authStore.requestEmailCode(email.value.trim(), promotional.value);
    code.value = '';
    step.value = STEPS.CODE;
    startCooldown();
  } catch (err) {
    errorMessage.value = errorText(err, 'emailPreference.error.sendFailed');
  } finally {
    loading.value = false;
  }
}

async function resendCode() {
  resending.value = true;
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.requestEmailCode(email.value.trim(), promotional.value);
    startCooldown();
  } catch (err) {
    errorMessage.value = errorText(err, 'emailPreference.error.sendFailed');
  } finally {
    loading.value = false;
    resending.value = false;
  }
}

async function verifyCode() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.verifyEmailCode(code.value);
    show.value = false;
    snackbarStore.alert(t('emailPreference.verified'), 'success');
  } catch (err) {
    errorMessage.value = errorText(err, 'emailPreference.error.verifyFailed');
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

// Don't prompt if we can't tell whether the user has an email
const needsEmail = computed(() => authStore.authenticated && authStore.hasLoadedEmail && !authStore.email);

watch(
  [ needsEmail, () => props.waiting ],
  ([ needs, waiting ]) => {
    if (needs && !waiting && !hasPrompted.value) {
      show.value = true;
      hasPrompted.value = true;
    }
  },
  { immediate: true },
);

// Login and signup don't return the email, so load it for whichever account is signed in.
// Runs again when the account changes, e.g. after finishing OAuth signup or switching accounts
function loadEmail() {
  if (authStore.authenticated && !authStore.hasLoadedEmail) {
    authStore.requestStatus(true);
  }
}

watch(() => authStore.userId, loadEmail);

onMounted(loadEmail);

onBeforeUnmount(() => {
  clearInterval(cooldownTimer);
});
</script>
