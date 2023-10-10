import { computed } from 'vue';

export function useThemedLogo() {
  const originalSrc = '/img/logo';
  const themedSuffix = '-spooky';
  const extension = '.png';

  const logoSrc = computed(() => originalSrc + themedSuffix + extension);
  return {
    logoSrc
  };
}
