<template>
  <v-dialog v-model="show" persistent max-width="650">
    <v-card id="opponent-requested-stalemate-dialog">
      <v-card-title>Accept Stalemate?</v-card-title>
      <v-card-text>
        <p>Your opponent has requested a stalemate. If you accept, the game will end in a tie.</p>
        <div class="d-flex justify-center">
          <v-icon class="mr-8" size="80px" icon="mdi-offer" />
          <v-icon size="80px" icon="mdi-help-circle" />
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          variant="outlined"
          color="primary"
          class="mr-4"
          :diabled="loadingAccept"
          :loading="loadingReject"
          data-cy="reject-stalemate"
          @click="rejectStalemate"
        >
          Reject Request
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          data-cy="accept-stalemate"
          :loading="loadingAccept"
          :disabled="loadingReject"
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
    modelValue: Boolean,
  },
  data() {
    return {
      loadingAccept: false,
      loadingReject: false,
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set() {
        // do nothing - parent controls whether dialog is open
      },  
    },
  },
  methods: {
    async acceptStalemate() {
      this.loadingAccept = true;
      try {
        await this.$store.dispatch('requestStalemate');
      } finally {
        this.loadingAccept = false;
        this.show = false;
      }
    },
    async rejectStalemate() {
      this.loadingReject = true;
      try {
        await this.$store.dispatch('rejectStalemate');
      } finally {
        this.loadingReject = false;
        this.show = false;
      }
    },
  },
};
</script>
