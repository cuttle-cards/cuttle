<template>
  <v-menu location="end">
    <template #activator="{ props: activatorProps }">
      <v-list-item
        :class="activatorClass"
        data-cy="language-menu"
        v-bind="activatorProps"
        :prepend-icon="icons.prepend"
        :append-icon="icons.append"
        :title="$i18n.locale"
      />
    </template>

    <v-list data-cy="lang-list" density="compact" class="bg-base-light text-base-dark">
      <v-list-item
        v-for="(lang, i) in sortedLocales"
        :key="`${i}-${lang}`"
        :value="lang"
        :title="lang"
        :active="lang === $i18n.locale"
        :data-lang="lang"
        @click="changeLocale(lang)"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import { setLocalStorage } from '_/utils/local-storage-utils';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { locale, availableLocales } = useI18n();

const props = defineProps({
  variant: {
    type: String,
    default: 'dark',
  },
  hasChevron: {
    type: Boolean,
    default: false,
  }
});

const sortedLocales = computed(() => {
  const currentLang = locale.value;
  return [ ...availableLocales ].sort((a, b) => {
    if (a === currentLang){
      return -1;
    }
    if (b === currentLang){
      return 1;
    }
    return a.localeCompare(b);
  });
});


const activatorClass = computed(() => props.variant === 'dark' ? `bg-base-light text-base-dark` : '');

const icons = computed(() => props.hasChevron ? { prepend: 'mdi-web', append: 'mdi-chevron-right' } : { prepend: 'mdi-web mr-2', append: '' });


const changeLocale = (lang) => {
  locale.value = lang;
  setLocalStorage('preferredLocale', lang);
};
</script>

