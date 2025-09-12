<template>
  <BaseDialog id="oauthsignup" v-model="show" title="Oauth Signup">
    <template #body>
      <h2>Login to link your existing account</h2>
      <v-form>
        <v-text-field v-model="username" label="Username" />
        <v-text-field v-model="password" label="Password" />
        <div class="d-flex justify-space-between">
          <v-btn type="submit" color="newPrimary">
            Login
          </v-btn>
          <v-btn variant="text" color="white">
            Don't have an account?
          </v-btn>
        </div>
      </v-form>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from '@/components/BaseDialog.vue';
import { computed, ref } from 'vue';

const username = ref('');
const password = ref('');

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
});

const show = computed({
  get: () => props.modelValue
});


</script>
