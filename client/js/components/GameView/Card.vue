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
    @click="$emit('click')"
  >
    <v-icon v-if="isFrozen" class="player-card-icon mr-1 mt-1" color="#00a5ff"> mdi-snowflake </v-icon>
    <v-overlay
      v-ripple
      :value="isValidTarget"
      absolute
      color="accent"
      class="valid-move target-overlay"
      opacity=".8"
    />
    <img
      v-if="isGlasses"
      :src="require(`../../img/cards/Glasses_${suitName}.jpg`)"
      :alt="`Glasses - $${cardName}`"
    />
    <img v-else :src="require(`../../img/cards/card_${suit}_${rank}.png`)" :alt="cardName" />
  </v-card>
</template>

<script>
export default {
  name: 'Card',
  props: {
    suit: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
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
      return this.isGlasses ? '0' : '1';
    },
  },
};
</script>
<style scoped lang="scss">
.player-card {
  position: relative;
  max-height: 20vh;
  max-width: calc(20vh / 1.45);
  background: transparent;
  flex-grow: 1;

  & img {
    width: 100%;
    display: block;
    position: relative;
  }

  &.glasses {
    max-width: 20vh;
    height: calc(20vh / 1.45);
  }
}
.player-card-icon {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.selected {
  // transform: scale(1.23);
  img {
    border: 3px solid var(--v-accent-lighten1);
    border-radius: 5px;
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

@media (max-width: 600px) {
  .player-card {
    max-height: 10vh;
    max-width: calc(10vh / 1.45);
    &.glasses {
      max-width: 10vh;
      height: calc(10vh / 1.45);
    }
  }
}
</style>
