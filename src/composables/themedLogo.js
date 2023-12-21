import { computed } from 'vue';
import dayjs from 'dayjs';

function getThemedSuffix() {
  const currentMonth = dayjs().month() + 1; // months start at 0
  switch (currentMonth) {
    case 10:
      return '-spooky';
    case 12:
      return '-santa';
    default:
      return '';
  }
}

export function useThemedLogo() {
  const originalSrc = '/img/logo';
  const themedSuffix = getThemedSuffix();
  const extension = '.png';

  const logoSrc = computed(() => originalSrc + themedSuffix + extension);
  return {
    logoSrc
  };
}
