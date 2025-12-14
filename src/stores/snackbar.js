import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSnackbarStore = defineStore('snackbar', () => {
  const showSnackbar = ref(false);
  const snackMessage = ref('');
  const snackColor = ref('');
  const snackTimeout = ref(0);

  function alert(message, color = 'error', timeout = 5000) {
    snackColor.value = color;
    snackMessage.value = message;
    snackTimeout.value = timeout;
    showSnackbar.value = true;
  }

  function clear() {
    showSnackbar.value = false;
    snackMessage.value = '';
  }

  return {
    showSnackbar,
    snackMessage,
    snackColor,
    snackTimeout,
    alert,
    clear,
  };
});
