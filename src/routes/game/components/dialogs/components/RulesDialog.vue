<template>
  <BaseDialog id="rulesDialog" :max-width="1250" :persistent="false">
    <template #body>
      <v-btn
        icon 
        aria-label="Close rules dialog"
        color="surface-2" 
        class="position-fixed top-0 closeBtn"
        size="large"
        @click="emit('close')"
      >
        <v-icon
          icon="mdi-close"
          size="large" 
          aria-hidden="true"         
        />
      </v-btn>
      <RulesView :is-in-modal="true" :parent-modal-id="'#rulesDialog'" />
    </template>
    <template #actions>
      <v-btn variant="outlined" color="surface-1" @click="emit('close')">
        Got It!
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from '@/components/BaseDialog.vue';
import RulesView from '@/routes/rules/RulesView.vue';

const emit = defineEmits([ 'close' ]);

</script>

<style lang="scss" scoped>
.rules-button {
  width: 100%;
}
.closeBtn {
  right: 32px;
  z-index: 19;
  top: 16px;
}
@media (max-width: 600px) {
  .closeBtn {
    right: 20px;
  }
}
</style>
