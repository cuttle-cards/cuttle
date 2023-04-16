<template>
  <v-dialog v-model="show">
    <v-card class="dialog-card">
      <div class="dialog-content-wrapper">
        <slot />
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'BaseDialog',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
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
}
</script>

<style scoped>
.dialog-card {
  padding: 8px;
  opacity: .95;
  color: #FFF4D7;
}

.dialog-content-wrapper {
  border: 4px solid #FFF4D7;
  border-radius: 8px;
}
</style>