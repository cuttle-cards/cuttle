<template>
  <BaseDialog
    id="oauthsignup"
    v-model="show"
    title="Oauth Signup"
    persistent
  >
    <template #body>
      <h2 class="mb-6">
        {{ titleText }}
      </h2>
      <v-form id="form" v-model="isFormValid" @submit.prevent="completeOauth">
        <v-text-field
          v-model="username"
          label="Username"
          :rules="isAlphaNumeric"
          :density="$vuetify.display.mdAndDown ? 'compact' : 'default'"
        />
        <v-text-field
          v-if="!noAccount"
          id="password"
          v-model="password"
          label="Password"
          :rules="passwordRules"
          :density="$vuetify.display.mdAndDown ? 'compact' : 'default'"
          :type="showPass ? 'text' : 'password'"
          :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPass = !showPass"
        />
      </v-form>
    </template>
    <template #actions>
      <div class=" d-flex justify-space-between">
        <v-btn variant="text" color="game-board" @click="switchModes">
          {{ buttonText }}
        </v-btn>
        <v-btn
          form="form"
          type="submit"
          :loading="loading"
          :disabled="!isFormValid"
          :color="isFormValid ? 'primary' : 'disabled'"
        >
          {{ submitText }}
        </v-btn>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from '@/components/BaseDialog.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useGameListStore } from '@/stores/gameList';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const authStore = useAuthStore();
const gameListStore = useGameListStore();
const route = useRoute();
const router = useRouter();
const provider = route.query.oauthsignup;

const username = ref('');
const password = ref('');
const showPass = ref(false);
const loading = ref(false);
const noAccount = ref(false);
const isFormValid = ref(false);

const passwordRules = [ (val) => val.length >= 8 || 'Password must contain at least eight characters' ];
const isAlphaNumeric = [ (val) => /^[\w.@-]+$/.test(val) || 'Username must contain only letters or numbers' ];

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
});
const emit = defineEmits([ 'update:modelValue' ]);

const show = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  }
});

const switchModes = () => {
  noAccount.value = !noAccount.value;
  password.value = '';
};

const titleText = computed(() =>
  t(noAccount.value ? 'login.createUsername' : 'login.linkAccount'),
);

const submitText = computed(() => (t(noAccount.value ? 'global.signup' : 'global.login')));

const buttonText = computed(() => (t(noAccount.value ?  'login.haveAccount' : 'login.noAccount' )));

const completeOauth = async() => {
  try {
    loading.value = true;
    await authStore.completeOAuth(provider, { username: username.value, password:password.value });
    gameListStore.requestGameList();
    show.value = false;
    loading.value = false;
  } catch (e) {
    router.push(`/login?error=${e.message}`);
  }
};
</script>
