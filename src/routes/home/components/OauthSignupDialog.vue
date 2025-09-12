<template>
  <BaseDialog id="oauthsignup" v-model="show" title="Oauth Signup">
    <template #body>
      <h2 class="mb-6">
        {{ titleText }}
      </h2>
      <v-form id="form" @submit.prevent="completeOauth">
        <v-text-field v-model="username" label="Username" />
        <v-text-field v-if="!noAccount" v-model="password" label="Password" />
      </v-form>
    </template>
    <template #actions>
      <div class=" d-flex justify-space-between">
        <v-btn variant="text" color="surface-1" @click="switchModes">
          {{ buttonText }}
        </v-btn>
        <v-btn form="form" type="submit" color="newPrimary">
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
const noAccount = ref(false);

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
};

const titleText = computed(() =>
  noAccount.value ? 'Create a Username for your new account' : 'Login to link your existing account',
);

const submitText = computed(() => (t(noAccount.value ? 'global.signup' : 'global.login')));

const buttonText = computed(() => (t(noAccount.value ?  'login.haveAccount' : 'login.noAccount' )));

const completeOauth = async() => {
  try{
    debugger;
    await authStore.completeOAuth(provider, { username: username.value, password:password.value });
    gameListStore.requestGameList();
    router.replace('/');
    show.value = false;
  }catch {
    router.push('/signup');
  }
};
</script>
