<template>
  <v-card
    class="mx-1 player-card"
    :class="{
      selected: isSelected,
      glasses: isGlasses,
      jack: isJack,
      frozen: isFrozen,
    }"
    :elevation="elevation"
  >
    <v-icon
      v-if="isFrozen"
      class="player-card-icon mr-1 mt-1"
      color="#00a5ff"
      icon="mdi-snowflake"
      aria-label="snowflake icon (card is frozen)"
      aria-hidden="false"
      role="img"
    />
    <v-overlay
      :model-value="isValidTarget"
      contained
      class="valid-move target-overlay"
    />
    <Transition :name="scuttledByTransition">
      <template v-if="scuttledBy">
        <img :class="scuttledByClass" :src="`/img/cards/card-${scuttledBy.suit}-${scuttledBy.rank}.svg`">
      </template>
    </Transition>
    <Transition name="card-flip">
      <img
        v-if="isGlasses"
        :src="`/img/cards/glasses-${suitName.toLowerCase()}.png`"
        :alt="`Glasses - $${cardName}`"
      >
      <img
        v-else-if="isBack"
        src="/img/cards/card-back.png"
        class="opponent-card-back"
        alt="card back"
      >
      <img
        v-else
        :src="`/img/cards/card-${suit}-${rank}.svg`"
        :alt="cardName"
        class="face-card"
      >
    </Transition>
  </v-card>
</template>

<script>
export default {
  name: 'GameCard',
  props: {
    suit: {
      type: Number,
      default: undefined,
    },
    rank: {
      type: Number,
      default: undefined,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isValidTarget: {
      type: Boolean,
      default: false,
    },
    isGlasses: {
      type: Boolean,
      default: false,
    },
    isJack: {
      type: Boolean,
      default: false,
    },
    jacks: {
      type: Array,
      default: null,
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    scuttledBy: {
      type: Object,
      default: null,
    },
    controlledBy: {
      type: String,
      default: '',
      validator: (val) => [ '', 'player', 'opponent' ].includes(val),
    },
    highElevation: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    suitName() {
      switch (this.suit) {
        case 0:
          return 'Clubs';
        case 1:
          return 'Diamonds';
        case 2:
          return 'Hearts';
        case 3:
          return 'Spades';
        default:
          return 'Invalid Suit Error';
      }
    },
    rankName() {
      switch (this.rank) {
        case 1:
          return 'Ace';
        case 2:
          return 'Two';
        case 3:
          return 'Three';
        case 4:
          return 'Four';
        case 5:
          return 'Five';
        case 6:
          return 'Six';
        case 7:
          return 'Seven';
        case 8:
          return 'Eight';
        case 9:
          return 'Nine';
        case 10:
          return 'Ten';
        case 11:
          return 'Jack';
        case 12:
          return 'Queen';
        case 13:
          return 'King';
        default:
          return 'Invalid Rank Error';
      }
    },
    cardName() {
      return `${this.rankName} of ${this.suitName}`;
    },
    elevation() {
      if (this.isGlasses) {
        return '0';
      }
      if (this.highElevation) {
        return '7';
      }
      return '1';
    },
    isBack() {
      return !this.suit && !this.rank;
    },
    scuttledByTransition() {
      switch (this.controlledBy) {
        case 'player':
          return 'slide-above';
        case 'opponent':
          return 'slide-below';
        default:
          return '';
      }
    },
    scuttledByClass() {
      switch (this.controlledBy) {
        case 'player':
          return 'scuttled-by-card scuttled-by-opponent';
        case 'opponent':
          return 'scuttled-by-card scuttled-by-player';
        default:
          return '';
      }
    },
  },
};
</script>
<style scoped lang="scss">
.player-card {
  position: relative;
  max-height: 20vh;
  max-width: calc(20vh / 1.45);
  width: 100%;
  background: transparent;
  flex-grow: 1;
  overflow: visible;

  & img {
    width: 100%;
    display: block;
    position: relative;
  }

  &.glasses {
    max-width: 20vh;
    height: calc(20vh / 1.45);
  }

  & .scuttled-by-card {
    height: 95%;
    left: 16px;
    transition: all 1s ease;
    position: absolute;
    z-index: 1;
    &.scuttled-by-opponent {
      top: -42px;
    }
    &.scuttled-by-player {
      bottom: -32px;
    }
  }
}
.player-card-icon {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
.opponent-card-back {
  border-radius: 5px;
}

.selected {
  img {
    border: 3px solid rgba(var(--v-theme-accent-lighten1));
    border-radius: 10px;
  }
}
.jack {
  height: 50%;
  margin-bottom: -50%;
  width: 50%;
  overflow: visible;
  display: flex;
  position: relative;

  & img {
    height: 100%;
    width: 100%;
    background-size: cover;
    display: block;
    position: relative;
  }
}
.target-overlay {
  cursor: pointer;
  background-color: rgb(var(--v-theme-accent-lighten1));
  opacity: .6;
}

.frozen {
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(#00a5ff, 0.25);
    opacity: 1;
    transition: all 0.3s linear;
  }

  &:hover:after {
    opacity: 0;
  }
}

.slide-below-leave-active,
.slide-above-leave-active,
.in-below-out-left-leave-active {
  position: absolute;
}
// slide-below (enter and leave below)
.slide-below-enter-from,
.slide-below-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
// slide-above (enter and leave above)
.slide-above-enter-from,
.slide-above-leave-to {
  opacity: 0;
  transform: translateY(-32px);
}

.card-flip-enter-active{
  transition: all 1s;
}
.card-flip-enter-from{
  transform: rotateY(-90deg);
}
.card-flip-enter-to{
  transform: rotateY(0deg);
}

@media (max-width: 600px) {
  .player-card {
    max-height: 10vh;
    width: calc(10vh / 1.45);
    &.glasses {
      max-width: 10vh;
      height: calc(10vh / 1.45);
    }
  }

  .jack {
    margin-bottom: -60%;
    width: calc(10vh / 1.85);
  }
}
</style>
