import { ref } from 'vue';

let fullScreenState = ref({
  isFullScreen: false,
  text: 'full screen',
  icon: 'mdi-fullscreen'
});

export function useFullScreen() {

  const toggleFullScreen = () => {
    if (!fullScreenState.value.isFullScreen) {
      document.documentElement.requestFullscreen();
      fullScreenState.value.text = 'exit full screen';
      fullScreenState.value.icon = 'mdi-fullscreen-exit';
    } else {
      document.exitFullscreen();
      fullScreenState.value.text = 'full screen';
      fullScreenState.value.icon = 'mdi-fullscreen';
    }
    fullScreenState.value.isFullScreen = !fullScreenState.value.isFullScreen;
  };

  return {
    fullScreenState,
    toggleFullScreen,
  };
}