<template>
  <v-menu location="end">
    <template #activator="{ props }">
      <v-list-item
        :class="isInUserMenu ? `bg-surface-2 text-surface-1` : ``"
        data-cy="language-menu"
        v-bind="props"
        :prepend-icon="isInUserMenu ? `mdi-web` : `mdi-web mr-2`"
        :append-icon="isInUserMenu ? `mdi-chevron-right` : ``"
        :title="$i18n.locale"
      />
    </template>

    <v-list data-cy="lang-list" density="compact" class="bg-surface-2 text-surface-1">
      <v-list-item
        v-for="(lang, i) in $i18n.availableLocales"
        :key="`${i}-${lang}`"
        :value="lang"
        :title="lang"
        :data-lang="lang"
        @click="changeLocale(lang)"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import { setLocalStorage } from '../../utils/local-storage-utils';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

defineProps({
  isInUserMenu: {
      type: Boolean,
      default: false,
    }
});

const changeLocale = (lang) => {
  locale.value = lang;
  setLocalStorage('preferredLocale', lang);
};
</script>
