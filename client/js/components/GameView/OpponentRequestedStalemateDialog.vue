<template>
  <v-dialog v-model="show" persistent>
    <v-card id="opponent-requested-stalemate-dialog">
      <v-card-title>Accept Stalemate?</v-card-title>
      <v-card-text>
        <p>Your opponent has requested a stalemate. If you accept, the game will end in a tie.</p>
        <div class="d-flex justify-center">
          <v-icon class="mr-8" size="80px">mdi-offer</v-icon>
          <v-icon size="80px">mdi-help-circle</v-icon>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn outlined color="primary" class="mr-4" :diabled="loading">Reject Request</v-btn>
        <v-btn
          color="error"
          depressed
          data-cy="accept-stalemate"
          :loading="loading"
          @click="acceptStalemate"
        >
          Accept Stalemate
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'OpponentRequestedStalemateDialog',
  props: {
    value: Boolean,
  },
  data() {
    return {
      loading: false,
    };
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
  methods: {
    async acceptStalemate() {
      this.loading = true;
      try {
        await this.$store.dispatch('requestStalemate');
      } finally {
        this.loading = false;
        this.show = false;
      }
    },
  },
};
</script>
