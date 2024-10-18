<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"  
      ripple
      :disabled="disabled"
      :class="{ pointer: !disabled }"
      class="move-choice-card mx-4"
      hover
      :theme="isHovering ? 'light': 'dark'"
      :width="cardWidth"
      :data-move-choice="eventName"
      :aria-label="`Choose Move: ${moveName}`"
      @click.stop="$emit('choose-move')"
    >
      <v-card-title class="d-flex justify-center">
        <h2>{{ moveName }}</h2>
      </v-card-title>
      <v-card-text class="d-flex flex-column justify-center align-center">
        <v-icon
          v-if="iconName"
          size="x-large"
          :icon="iconName" 
          aria-hidden="true"
        />
        <p>{{ moveDescription }}</p>
        <p v-if="disabled && !!disabledExplanation" class="text-red">
          {{ disabledExplanation }}
        </p>
      </v-card-text>
    </v-card>
  </v-hover>
</template>
<script>
export default {
  name: 'MoveChoiceCard',
  props: {
    moveName: {
      type: String,
      required: true,
    },
    moveDescription: {
      type: String,
      default: '',
    },
    // Under-the-hood name for the move e.g. oneOff
    eventName: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledExplanation: {
      type: String,
      default: '',
    },
    cardWidth: {
      type: String,
      default: '30%',
    },
  },
  emits: [ 'choose-move' ],
  computed: {
    /**
     * Returns string name of which icon to display
     */
    iconName() {
      switch (this.moveName) {
        case 'Points':
          return 'mdi-numeric';
        case 'Scuttle':
          return 'mdi-skull-crossbones';
        case 'One-Off':
          return 'mdi-delete';
        case 'Glasses':
          return 'mdi-sunglasses';
        case 'Royal':
          return 'mdi-crown';
        default:
          return null;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.pointer {
  cursor: pointer;
}
.move-choice-card {
  background-color: rgba(var(--v-theme-surface-1));
  color: rgba(var(--v-theme-surface-2)) !important;
  border: 2px solid rgba(var(--v-theme-surface-2));;
  transition: all 0.5s ease;
  opacity: .95;
}
.move-choice-card:hover {
  background-color: rgba(var(--v-theme-surface-2)) !important;
  color: rgba(var(--v-theme-surface-1)) !important;
}
p {
  text-align: center;
}

@media (max-width: 600px) {
  .move-choice-card {
    margin-bottom: 16px;
  }
}
</style>
