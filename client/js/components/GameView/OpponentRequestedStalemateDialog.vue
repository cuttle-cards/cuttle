<template>
  <v-dialog v-model="show" persistent>
    <v-card id="opponent-requested-stalemate-dialog">
      <v-card-title>Accept Stalemate?</v-card-title>
      <v-card-text>
        <p>Your opponent has requested a stalemate. If you accept, the game will end in a tie.</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'OpponentRequestedStalemateDialog',
  props: {
    value: Boolean,
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>
