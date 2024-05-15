<template>
  <p class="d-flex my-5">
    <v-img
      src="img/rulesView/rules_action_clubs.svg"
      class="mr-1 max-w-24"
      aria-hidden="false"
      role="img"
    />
        &nbsp;
    {{ t('rules.actions.clubs') }}
    &lt; &nbsp;

    <v-img
      src="img/rulesView/rules_action_diamond.svg"
      class="mr-1 max-w-24"
      aria-hidden="false"
      role="img"
    />
        &nbsp;
    {{ t('rules.actions.diamonds') }}
    &lt; &nbsp;

    <v-img
      src="img/rulesView/rules_action_hearts.svg"
      class="mr-1 max-w-24"
      aria-hidden="false"
      role="img"
    />
        &nbsp;
    {{ t('rules.actions.hearts') }}
    &lt; &nbsp;

    <v-img
      src="img/rulesView/rules_action_spades.svg"
      class="mr-1 max-w-24"
      aria-hidden="false"
      role="img"
    />
        &nbsp;
    {{ t('rules.actions.spades') }}
  </p>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.max-w-24 {
  max-width: 24px;
}
</style>