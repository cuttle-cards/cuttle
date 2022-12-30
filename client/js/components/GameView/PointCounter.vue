<template>
  <div class="point-counter__wrapper" :style="{ 'clip-path': clipPath }">
    <div class="d-flex flex-column justify-space-around align-center point-counter">
      <div class="point-counter__current-points">{{ currentPoints }}</div>
      <div class="point-counter__total-points">{{ pointsToWin }}</div>
      <v-menu :top="isPlayer" :bottom="!isPlayer" offset-y>
        <template #activator="{ on, attrs }">
          <v-btn class="mb-2" x-small icon v-bind="attrs" v-on="on">
            <v-icon class="point-counter__icon" color="white" small> mdi-information </v-icon>
          </v-btn>
        </template>
        <v-list class="score-goal-explanation">
          <v-list-item :class="{ 'current-goal': kingCount === 0 }"> 0 Kings: 21pts </v-list-item>
          <v-list-item :class="{ 'current-goal': kingCount === 1 }"> 1 King: 14pts </v-list-item>
          <v-list-item :class="{ 'current-goal': kingCount === 2 }"> 2 Kings: 10pts </v-list-item>
          <v-list-item :class="{ 'current-goal': kingCount === 3 }"> 3 Kings: 5pts </v-list-item>
          <v-list-item :class="{ 'current-goal': kingCount === 4 }"> 4 Kings: 0pts </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PointCounter',
  props: {
    kingCount: {
      required: true,
      type: Number, // 0-4
    },
    pointsToWin: {
      required: true,
      type: Number,
    },
    isPlayer: {
      default: true,
      type: Boolean,
    },
  },
  computed: {
    ...mapGetters([
      'playerPointTotal',
      'opponentPointTotal',
    ]),
    currentPoints() {
      return this.isPlayer ? this.playerPointTotal : this.opponentPointTotal;
    },
    clipPath() {
      return this.isPlayer ?
        'polygon(0 0, 100% 0, 100% 90%, 50% 95%, 0 90%)'
        : 'polygon(0% 100%, 100% 100%, 100% 5%, 50% 0, 0 5%)';
    },
  },
};
</script>

<style scoped>

.point-counter__wrapper {
  background-color: rgba(241, 200, 160, 0.65);
  border: 2px solid rgb(241, 200, 160);
  width: 32px;
}

.point-counter {
  font-weight: bold;
  color: #f3f3f3;
  font-family: 'Cormorant Infant', Century Gothic, CenturyGothic, AppleGothic, sans-serif;
  padding: 0 0.25rem;
  text-shadow: 1px 1px 5px #111111;
}

.point-counter__current-points {
  border-bottom: 2px solid #f3f3f3;
  font-size: 1.5em;
  box-shadow: 0 4px 4px -4px black;
}

.point-counter__total-points {
  font-size: 1.15em;
}
.point-counter__icon {
  text-shadow: 1px 1px 5px #111111;
}

@media screen and (min-width: 1024px) {
  .point-counter {
    padding: 0 0.5rem;
  }
  .point-counter__current-points {
    font-size: 3.5em;
  }

  .point-counter__total-points {
    font-size: 2.5em;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
}
</style>
