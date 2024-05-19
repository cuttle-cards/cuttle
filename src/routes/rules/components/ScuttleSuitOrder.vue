<template>
  <p class="d-flex my-5 align-center justify-center">
    <v-img
      src="img/rulesView/rules_action_clubs.svg"
      class="mr-1 max-w-24"
      aria-hidden="false"
      role="img"
    />
    &nbsp;
    <template v-if="!smAndDown">
      {{ t('rules.actions.clubs') }}
    </template>
    ( {{ t('rules.actions.weakest') }} )
    &lt; &nbsp;

    <v-img
      src="img/rulesView/rules_action_diamond.svg"
      class="mr-1 max-w-24"
      aria-hidden="false"
      role="img"
    />
    &nbsp;
    <template v-if="!smAndDown">
      {{ t('rules.actions.diamonds') }}
    </template>
    &lt; &nbsp;

    <v-img
      src="img/rulesView/rules_action_hearts.svg"
      class="mr-1 max-w-24"
      aria-hidden="false"
      role="img"
    />
    &nbsp;
    <template v-if="!smAndDown">
      {{ t('rules.actions.hearts') }}
    </template>
    &lt; &nbsp;

    <v-img
      src="img/rulesView/rules_action_spades.svg"
      class="mr-1 max-w-24"
      aria-hidden="false"
      role="img"
    />
    &nbsp;
    <template v-if="!smAndDown">
      {{ t('rules.actions.spades') }}
    </template>
    ( {{ t('rules.actions.strongest') }} )
  </p>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify/lib/framework.mjs';

const { t } = useI18n();

const { smAndDown } = useDisplay();
</script>

<style scoped>
.max-w-24 {
  max-width: 24px;
}
</style>
