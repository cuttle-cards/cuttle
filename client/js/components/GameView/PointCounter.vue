<template>
  <div class="point-counter">
    <div
      class="point-counter__wrapper"
      :class="[isPlayer ? 'point-counter__player' : 'point-counter__opponent']"
    >
      <div
        class="d-flex flex-column align-center point-counter__inner-container"
        :class="[isPlayer ? 'point-counter__player' : 'point-counter__opponent']"
      >
        <div
          class="point-counter__current-points"
          :class="[ isPlayer ? 'point-counter__current-player' : 'point-counter__current-opponent' ]"
        >
          {{ currentPoints }}
        </div>
        <div class="point-counter__total-points">{{ pointsToWin }}</div>
        <v-menu :top="isPlayer" :bottom="!isPlayer" offset-y>
          <template #activator="{ on, attrs }">
            <v-btn x-small icon v-bind="attrs" v-on="on">
              <v-icon class="point-counter__icon" color="white" v-bind="iconSize">
                mdi-information
              </v-icon>
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
    ...mapGetters(['playerPointTotal', 'opponentPointTotal']),
    currentPoints() {
      return this.isPlayer ? this.playerPointTotal : this.opponentPointTotal;
    },
    iconSize() {
      return {
        small: this.$vuetify.breakpoint.mdAndDown,
        large: this.$vuetify.breakpoint.lgAndUp,
      };
    },
  },
};
</script>

<style scoped>
.point-counter {
  filter: drop-shadow(2px 6px 3px rgba(50, 50, 0, 0.75));
  line-height: 1.2;
}

.point-counter__wrapper {
  position: relative;
  background: #ffffff;
  width: 25px;
  height: 100px;
  box-sizing: border-box;
}

.point-counter__inner-container {
  position: absolute;
  font-weight: bold;
  font-size: 1.25rem;
  background-color: rgba(241, 200, 160, 0.85);
  top: 1px;
  left: 1px;
  width: 23px;
  height: 98px;
  color: #f3f3f3;
  font-family: 'Cormorant Infant', Century Gothic, CenturyGothic, AppleGothic, sans-serif;
  text-shadow: 1px 1px 5px rgba(50, 50, 0, 0.75);
}

.point-counter__icon {
  text-shadow: 1px 1px 5px rgba(50, 50, 0, 0.75);
}

.point-counter__current-points {
  font-size: 1.3em;
  border-bottom: 1px solid #ffffff;
}

.point-counter__player {
  clip-path: polygon(0 0, 100% 0, 100% 90%, 50% 95%, 0 90%);
}

.point-counter__opponent {
  clip-path: polygon(0% 100%, 100% 100%, 100% 10%, 50% 5%, 0 10%);
}

.point-counter__current-player {
}

@media screen and (min-width: 1024px) {
  .point-counter__wrapper {
    width: 50px;
    height: 200px;
  }

  .point-counter__inner-container {
    top: 2px;
    left: 2px;
    width: 46px;
    height: 196px;
    font-size: 0.75rem;
  }

  .point-counter__current-points {
    font-size: 3.5em;
  }

  .point-counter__total-points {
    font-size: 2.5em;
  }

  .point-counter__icon {
    margin-top: 3rem;
  }

  .point-counter__current-opponent {
    margin-top: 0.8em;
  }

  .point-counter__current-player {
    margin-top: 0.5em;
  }
}
</style>
