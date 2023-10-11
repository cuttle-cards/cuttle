<template>
  <base-dialog
    id="how-it-works"
    :key="i"
    v-model="show"
    :title="t('home.howItWorks.title')"
    :opacity="1"
    data-cy="create-game-dialog"
  >
    <template #activator>
      <v-btn
        color="surface-2"
        class="text-subtitle-1 px-10 px-xl-16"
        variant="text"
        size="x-large"
        data-cy="how-it-works-button"
      >
        {{ t('home.howItWorks.button') }}
      </v-btn>
    </template>
    <template #body>
      <section class="d-flex flex-column">
        <span class="my-2">{{ t('home.howItWorks.content') }}</span>
        <li>{{ t('home.howItWorks.wednesday') }}</li>
        <li>{{ t('home.howItWorks.thursday') }}</li>
        <span class="my-2"> {{ t('home.howItWorks.findMatch') }} 
          <a 
            class="text-anchor text-decoration-none" 
            href="https://discord.gg/9vrAZ8xGyh" 
            target="_blank"
          >
            {{ t('home.howItWorks.discord') }} 
          </a> 
          {{ t('home.howItWorks.content2') }}
        </span>
        <span class="my-2">{{ t('home.howItWorks.playSolo') }} 
          <a
            data-cy="ai-link"
            class="text-anchor text-decoration-none"
            href="https://human-ai-interaction.github.io/cuttle-bot/"
            target="_blank"
          >
            {{ t('home.howItWorks.playAI') }} 
          </a> 
          {{ t('home.howItWorks.mettle') }}
        </span>
        <span class="my-2">{{ t('home.howItWorks.learnMore') }} 
          <router-link 
            data-cy="rules-link" 
            class="text-anchor text-decoration-none" 
            to="/rules"
          >
            {{ t('home.howItWorks.about') }} 
          </router-link>
          {{ t('home.howItWorks.about2') }}
        </span>
      </section>
    </template>
    <template #actions>
      <v-btn
        data-cy="how-it-works-okay"
        color="surface-1"
        variant="flat"
        class="text-surface-2"
        @click="close"
      >
        {{ t('home.howItWorks.okayButton') }}
      </v-btn>
    </template>
  </base-dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import BaseDialog from '@/components/Global/BaseDialog.vue';

const { t } = useI18n();

const show = ref(false);

const close = () => {
  show.value = false;
};

</script>
