import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSnackbarStore = defineStore('snackbar', () => {
  const showSnackbar = ref(false);
  const snackMessage = ref('');
  const snackColor = ref('error');

  function alert(message, color = 'error') {
    snackColor.value = color;
    snackMessage.value = message;
  }

  function clear() {
    showSnackbar.value = false;
  }

  return {
    showSnackbar,
    snackMessage,
    snackColor,
    alert,
    clear,
  };
});
