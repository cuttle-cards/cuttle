<template>
  <base-dialog
    :id="`how-it-work-dialog`"
    v-model="show"
    title="Looking TO Play ?"
    :opacity="1"
    data-cy="create-game-dialog"
  >
    <template #activator>
      <v-btn
        color="surface-2"
        variant="text"
        size="medium"
        data-cy="how-it-work-button"
      >
        How it works
      </v-btn>
    </template>
    <template #body>
      <section class="d-flex flex-column">
        <span class="my-2">Our weekly play sessions are open to everyone:</span>
        <li>Wednesday nights at 8:30pm EST</li>
        <li>Thursdays at 12pm EST</li>
        <span class="my-2"> Can’t find a match? Join us on <a class="text-cyan-lighten-2 text-decoration-none" href="https://discord.gg/9vrAZ8xGyh" target="_blank">discord </a> to chat with other players and to see who is available to play at any time.</span>
        <span class="my-2">Want to play solo? Try <a
          data-cy="ai-link"
          class="text-cyan-lighten-2 text-decoration-none"
          href="https://human-ai-interaction.github.io/cuttle-bot/"
          target="_blank"
        > playing vs AI </a> to learn the ropes and test your mettle.</span>
        <span class="my-2">Want to learn more? Check out our <router-link data-cy="rules-link" class="text-cyan-lighten-2 text-decoration-none" to="/rules"> about page </router-link> to learn the rules and read about the cuttle.cards project.</span>
      </section>
    </template>
    <template #actions>
      <v-btn
        data-cy="how-it-work-dialog-okay"
        color="surface-1"
        variant="flat"
        class="text-surface-2"
        @click="cancelCreateGame"
      >
        Okay
      </v-btn>
    </template>
  </base-dialog>
</template>

<script>
import BaseDialog from '@/components/Global/BaseDialog.vue';

export default {
  name: 'HowItWworks',
  components: { BaseDialog },
  emits: ['error'],
  data() {
    return {
      show: false,
    };
  },

  methods: {
    cancelCreateGame() {
      this.show = false;
    },
  },
};
</script>
