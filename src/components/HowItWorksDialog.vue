<template>
  <base-dialog
    id="how-it-works"
    v-model="show"
    title="Looking To Play?"
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
        How it works
        <!-- {{ t('home.button') }} -->
      </v-btn>
    </template>
    <template #body>
      <section class="d-flex flex-column">
        <span class="my-2">Our weekly play sessions are open to everyone:</span>
        <li>Wednesday nights at 8:30pm EST</li>
        <li>Thursdays at 12pm EST</li>
        <span class="my-2"> Can&#39;t find a match? Join us on 
          <a 
            class="text-anchor text-decoration-none" 
            href="https://discord.gg/9vrAZ8xGyh" 
            target="_blank"
          >
            discord 
          </a> 
          to chat with other players and to see who is available to play at any time.
        </span>
        <span class="my-2">Want to play solo? Try 
          <a
            data-cy="ai-link"
            class="text-anchor text-decoration-none"
            href="https://human-ai-interaction.github.io/cuttle-bot/"
            target="_blank"
          >
            playing vs AI 
          </a> 
          to learn the ropes and test your mettle.
        </span>
        <span class="my-2">Want to learn more? Check out our 
          <router-link 
            data-cy="rules-link" 
            class="text-anchor text-decoration-none" 
            to="/rules"
          >
            about page 
          </router-link>
          to learn the rules and read about the cuttle.cards project.
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
        Okay
      </v-btn>
    </template>
  </base-dialog>
</template>

<script setup>
// import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import BaseDialog from '@/components/Global/BaseDialog.vue';
// setup() {
//     // Vuetify has its own translation layer that isn't very good
//     // It seems to conflict with the namespace of vue-i18n so we need to import it at the component
//     // level and utilize it this way with a composable. There may be another more global way but
//     // I haven't found anything just yet
//     const { t } = useI18n();
//     return { t };
//   }

const show = ref(false);

const close = () => {
  show.value = false;
};

</script>
