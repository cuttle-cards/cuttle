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
import { setLocalStorage } from '_/utils/local-storage-utils';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

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

const activatorClass = computed(() => props.variant === 'dark' ? `bg-surface-2 text-surface-1` : '');
const icons = computed(() => props.hasChevron ? { prepend: 'mdi-web', append: 'mdi-chevron-right' } : { prepend: 'mdi-web mr-2', append: '' });

const changeLocale = (lang) => {
  locale.value = lang;
  setLocalStorage('preferredLocale', lang);
};
</script>
