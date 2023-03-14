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
        <v-menu :location="isPlayer ? 'top' : 'bottom'">
          <template #activator="{ props }">
            <v-btn class="point-counter__btn" icon v-bind="props" variant="plain">
              <v-icon color="black" icon="mdi-information" :size="[$vuetify.display.smAndDown ? 'small' : 'large']" />
            </v-btn>
          </template>
          <v-list class="score-goal-explanation">
            <v-list-item v-for="(points, idx) in kingPointsToWin" :class="{ 'current-goal': kingCount === idx }"> {{ idx }} Kings: {{ points }}pts </v-list-item>
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
    kingPointsToWin() {
      return [0, 5, 10, 14, 21];
    },
  },
};
</script>

<style lang="scss" scoped>

* {
  --main-border__color: #FFFFFF;
  --main-text__color: rgba(27, 27, 27);
  font-family: 'Cormorant Infant', Century Gothic, CenturyGothic, AppleGothic, sans-serif;
}

.point-counter {
  filter: drop-shadow(2px 6px 3px rgba(50, 50, 0, 0.5));
  line-height: 1.1;

  &__wrapper {
    position: relative;
    background-color: rgba(255, 255, 255, 0.25);
    width: 25px;
    height: 100px;
    box-sizing: border-box;
  }

  &__inner-container {
    position: absolute;
    font-weight: bold;
    background-color: rgba(241, 200, 160, 0.65);
    top: 1px;
    left: 1px;
    width: 23px;
    height: 98px;
    color: rgba(27, 27, 27);
  }

  &__btn {
    margin-top: -0.8em;
  }

  &__current-points {
    font-size: 1.4em;
    border-bottom: 1px solid rgba(27, 27, 27);
  }

  &__total-points {
    font-size: 1em;
  }

  &__player {
    clip-path: polygon(0 0, 100% 0, 100% 90%, 50% 95%, 0 90%);
  }

  &__opponent {
    clip-path: polygon(0% 100%, 100% 100%, 100% 10%, 50% 5%, 0 10%);
  }

  &__current-opponent {
    margin-top: 0.8em;
  }

  &__current-player {
    margin-top: 0.55em;
  }
}

@media only screen and (max-device-width: 400px) and (orientation: portrait) {
  .point-counter {
    line-height: 1.1;

    &__wrapper {
      width: 30px;
      height: 125px;
    }

    &__inner-container {
      top: 2px;
      left: 2px;
      width: 26px;
      height: 121px;
    }

    &__current-points {
      font-size: 1.8em;
    }

    &__total-points {
      font-size: 1.7em;
    }
  }
}

@media screen and (min-width: 900px) {
  .point-counter {
    line-height: 1.1;

    &__wrapper {
      width: 38px;
      height: 150px;
    }

    &__inner-container {
      top: 2px;
      left: 2px;
      width: 34px;
      height: 146px;
      font-size: 0.75rem;
    }

    &__current-points {
      font-size: 3em;
    }

    &__total-points {
      font-size: 2.5em;
    }

    &__current-player {
      margin-top: 0.5em;
    }
  }
}

@media screen and (min-width: 1024px) {
  .point-counter {
    line-height: 1.2;

    &__wrapper {
      width: 50px;
      height: 200px;
    }

    &__inner-container {
      top: 2px;
      left: 2px;
      width: 46px;
      height: 196px;
    }

    &__current-points {
      font-size: 3.5em;
      border-bottom: 2px solid rgba(27, 27, 27);
    }

    &__total-points {
      font-size: 2.75em;
    }

    &__btn {
      margin-top: 0.1em;
    }

    &__current-opponent {
      margin-top: 0.8em;
    }

    &__current-player {
      margin-top: 0.5em;
    }
  }

}
</style>