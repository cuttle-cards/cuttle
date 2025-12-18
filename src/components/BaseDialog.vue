<template>
  <v-dialog
    v-model="show"
    :persistent="persistent"
    :max-width="maxWidth"
    :scrollable="scrollable"
    elevation
    scrim="surface-1"
  >
    <template #activator="{ props }">
      <span v-bind="props">
        <template v-if="minimizable">
          <v-fab
            :active="isMinimized"
            color="primary"
            class="dialog-activator"
            variant="flat"
            absolute
            location="center center"
            size="large"
            transition="scale-transition"
            data-cy="dialog-activator"
            @click="isMinimized = false"
          >
            {{ title }}
          </v-fab>
        </template>
        <slot v-else name="activator" />
      </span>
    </template>
    <v-card
      :id="id"
      :data-cy="id"
      class="dialog-card"
      :class="variant"
      :color="backgroundColor"
      :style="`opacity:${opacity}`"
    >
      <v-card-title class="d-flex justify-space-between pt-4">
        <template v-if="title">
          <h1>
            {{ title }}
          </h1>
          <v-btn
            v-if="minimizable"
            icon="mdi-window-minimize"
            color="surface-2"
            variant="text"
            data-cy="minimize-dialog-button"
            aria-label="Minimize dialog"
            @click="isMinimized = true"
          />
        </template>

        <slot v-else name="title" />
      </v-card-title>
      <v-card-text>
        <slot name="body" />
      </v-card-text>
      <div class="dialog-actions d-flex justify-end">
        <slot name="actions" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'BaseDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
      default: 'dark',
      validator: (val) => [ 'light', 'dark' ].includes(val),
    },
    scrollable: {
      type: Boolean,
      default: false,
    },
    opacity:{
      type: Number,
      default: .92,
    },
    persistent: {
      type: Boolean,
      default: true
    },
    maxWidth: {
      type: Number,
      default: 650,
    },
    minimizable: {
      type: Boolean,
      default: false,
    },
  },
  emits: [ 'update:modelValue' ],
  data() {
    return {
      isMinimized: false,
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue && !this.isMinimized;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    isLight() {
      return this.variant === 'light';
    },
    backgroundColor() {
      return this.isLight ? 'surface-2': 'surface-1';
    },
    textColor() {
      return this.isLight ? 'surface-1' : 'surface-2';
    },
  },
};
</script>

<style scoped lang="scss">
.dialog-card {
  border-radius: 12px !important;
  border: 4px solid rgba(var(--v-theme-surface-2));
  
  &.dark {
    /* Stuck using important because vuetify applies it to these styles for cards */
    color: rgba(var(--v-theme-surface-2)) !important;
  }

  &.light {
    /* Stuck using important because vuetify applies it to these styles for cards */
    color: rgba(var(--v-theme-surface-1)) !important;
  }
}


.dialog-actions {
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 8px;
  padding-bottom: 2px;
  border-bottom-left-radius: 8px;
  border: none;

  .dark & {
    background-color: rgba(var(--v-theme-surface-2));
  }

}

.dialog-activator :deep(button) {
  position: relative;
  overflow: hidden;
  animation: pulse-glow 2s infinite ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -150%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    animation: strong-shimmer 4s infinite;
    z-index: 1;
  }
  
  &:hover {
    &::before {
      animation: strong-shimmer 2s infinite;
    }
  }
}

@keyframes pulse-glow {
  0%,
    100% {
      box-shadow: 0 0 15px rgba(225, 48, 108, 0.6);
    }
    50% {
      box-shadow: 0 0 35px rgba(225, 48, 108, 1);
    }
  }

@keyframes strong-shimmer {
  0% {
    transform: translateX(-150%) skewX(-20deg);
  }
  100% {
    transform: translateX(150%) skewX(-20deg);
  }
}
</style>
