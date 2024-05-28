<template>
  <BaseDialog id="rulesDialog" max-width="1250">
    <template #title>
      <v-btn
        icon 
        aria-label="Close rules dialog"
        color="surface-2" 
        class="position-fixed top-0 right-10"
        @click="close"
      >
        <v-icon
          icon="mdi-close"
          size="large" 
          aria-hidden="true"         
        />
      </v-btn>
    </template>
    <template #body>
      <RulesView :is-modal="true" />
    </template>
    <template #actions>
      <v-btn variant="outlined" color="surface-1" @click="close">
        Got It!
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/BaseDialog.vue';
import RulesView from '@/routes/rules/RulesView.vue';
export default {
  name: 'RulesDialog',
  components: {
    BaseDialog,
    RulesView,
  },
  emits: ['close'],
  computed: {
    buttonSize() {
      return this.$vuetify.display.mdAndDown ? 'small' : 'medium';
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>
<style lang="scss" scoped>
.rules-button {
  width: 100%;
}
.right-10{
  right:25px;
  z-index: 19;
}
</style>
