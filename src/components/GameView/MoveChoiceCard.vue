<template>
  <v-hover v-slot="{ hover }">
    <v-card
      ripple
      :disabled="disabled"
      :class="{ pointer: !disabled }"
      class="move-choice-card"
      hover
      :light="hover"
      :width="cardWidth"
      :data-move-choice="eventName"
      @click.stop="$emit('click')"
    >
      <v-card-title class="d-flex justify-center">
        <h2>{{ moveName }}</h2>
      </v-card-title>
      <v-card-text class="d-flex flex-column justify-center align-center">
        <v-icon v-if="iconName" x-large :icon="iconName" />
        <p>{{ moveDescription }}</p>
        <p v-if="disabled && !!disabledExplanation" class="red--text">
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
  border: 2px solid #fff;
  transition: all 0.5s ease;
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
