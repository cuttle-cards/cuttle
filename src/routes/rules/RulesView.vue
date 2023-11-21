<template>
  <div class="pa-4">
    <v-container>
      <v-row>
        <img
          id="logo"
          alt="Cuttle logo"
          :src="logoSrc"
          height="20vh"
          class="mb-8"
        >
      </v-row>

      <!-- Rules -->
      <v-row class="flex-column align-start mt-5">
        <div>
          <h1 class="gradient-text">
            {{ t('rules.cuttleTitle') }}
          </h1>
          <p class="d-block">
            {{ t('rules.cuttleText') }}
          </p>
          <div class="d-flex justify-center mt-5">
            <v-btn to="/" color="primary" data-cy="top-home-button">
              {{ buttonText }}
            </v-btn>
          </div>
        </div>
      </v-row>

      <!-- Tutorial -->
      <v-row class="flex-column align-start mt-5">
        <h1 class="gradient-text">
          {{ t('rules.rulesTitle') }}
        </h1>
        <p>
          {{ t('rules.rulesReadText') }} 
          <a href="/img/cuttle_rules.pdf" target="_blank"> Cuttle Cheestsheet </a>
          {{ t('rules.rulesWatchText') }}
        </p>
        <div class="w-50 my-4 mx-auto">
          <BaseVideo source="https://www.youtube.com/embed/qOqkNbhMdsI" />
        </div>
      </v-row>

      <!-- Goal -->
      <v-row class="flex-column align-start mt-5">
        <h1 class="gradient-text">
          {{ t('rules.goalTitle') }}
        </h1>
        <p class="d-block">
          {{ t('rules.goalText') }}
        </p>
      </v-row>

      <!-- Play -->
      <v-row class="flex-column align-start mt-5">
        <h1 class="d-block gradient-text">
          {{ t('rules.playTitle') }}
        </h1>
        <p class="d-block">
          {{ t('rules.playText') }}
        </p>
      </v-row>
      <v-row
        v-for="(ruleRow, rowIndex) in rules"
        :key="`rule-row-${rowIndex}`"
        align="start"
        class="my-6"
      >
        <v-col
          v-for="(rule) in ruleRow"
          :key="rule.title"
          md="6"
          sm="12"
          class="my-4"
        >
          <RulePreview v-bind="rule" ref="preview" @animate="handleAnimate" />
        </v-col>
      </v-row>

      <!-- Royals -->
      <v-row class="flex-column">
        <div class="d-flex">
          <v-icon
            size="x-large"
            color="black"
            class="mr-4"
            icon="mdi-crown"
            aria-label="crown icon"
            aria-hidden="false"
            role="img"
          />
          <h1 class="gradient-text">
            {{ t('rules.royals.title') }}
          </h1>
        </div>
        <p class="d-block">
          {{ t('rules.royals.text') }}
        </p>
      </v-row>
      <v-row
        v-for="(ruleRow, rowIndex) in royals"
        :key="`royal-row-${rowIndex}`"
        align="start"
        class="my-6"
      >
        <v-col
          v-for="(rule) in ruleRow"
          :key="rule.title"
          md="6"
          sm="12"
          class="my-4"
        >
          <RulePreview v-bind="rule" ref="preview" @animate="handleAnimate" />
        </v-col>
      </v-row>

      <!-- One-Offs -->
      <v-row>
        <div class="d-flex">
          <v-icon
            size="x-large"
            color="black"
            class="mr-4"
            icon="mdi-delete"
            aria-label="one-off icon"
            aria-hidden="false"
            role="img"
          />
          <h1 class="gradient-text">
            {{ t('rules.oneoffs.title') }}
          </h1>
        </div>
        <p>
          {{ t('rules.oneoffs.text') }}
        </p>
      </v-row>
      <v-row
        v-for="(ruleRow, rowIndex) in oneOffs"
        :key="`one-off-row-${rowIndex}`"
        align="start"
        class="my-6"
      >
        <v-col
          v-for="(rule) in ruleRow"
          :key="rule.title"
          md="6"
          sm="12"
          class="my-4"
        >
          <RulePreview v-bind="rule" ref="preview" @animate="handleAnimate" />
        </v-col>
      </v-row>

      <!-- Multiplayer Variants -->
      <v-row class="d-flex flex-column mb-4">
        <h1 class="gradient-text">
          {{ t('rules.multiplayerTitle') }}
        </h1>
        <p class="mb-4">
          {{ t('rules.multiplayerText1') }}
          <a href="https://www.cuttle.cards"> www.cuttle.cards</a>
          {{ t('rules.multiplayerText2') }}
        </p>
        <h3>{{ t('rules.3Players.title') }}</h3>
        <p class="mb-4">
          {{ t('rules.3Players.text') }}
        </p>
        <p>{{ t('rules.3Players.rules') }}</p>
        <ul class="mb-4">
          <li>
            {{ t('rules.3Players.rule1') }}
          </li>
          <li>
            {{ t('rules.3Players.rule2') }}
          </li>
          <li>
            {{ t('rules.3Players.rule3') }}
          </li>
          <li>{{ t('rules.3Players.rule4') }}</li>
        </ul>

        <h3>{{ t('rules.4Players.title') }}</h3>
        <p class="mb-4">
          {{ t('rules.4Players.text') }}
        </p>
        <p>
          {{ t('rules.4Players.rules') }}
        </p>
        <ul>
          <li>
            {{ t('rules.4Players.rule1') }}
          </li>
          <li>
            {{ t('rules.4Players.rule2') }}
          </li>
          <li>{{ t('rules.4Players.rule3') }}</li>
          <li>
            {{ t('rules.4Players.rule4') }}
          </li>
          <li>
            {{ t('rules.4Players.rule5') }}
          </li>
        </ul>
      </v-row>

      <!-- FAQ -->
      <v-row class="d-flex flex-column mb-4">
        <h1 class="gradient-text">
          {{ t('rules.faq.title') }}
        </h1>
        <h3>{{ t('rules.faq.twoCounter') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.twoCounterAnswer') }}
        </p>
        <h3>{{ t('rules.faq.queenProtectTwo') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.queenProtectTwoAnswer') }}
        </p>
        <h3>{{ t('rules.faq.queenProtectScuttle') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.queenProtectScuttleAnswer') }}
        </p>
        <h3>{{ t('rules.faq.twoOnTwo') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.twoOnTwoAnswer') }}
        </p>
        <h3>{{ t('rules.faq.kingWin') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.kingWinAnswer') }}
        </p>
        <h3>{{ t('rules.faq.aceDestruction') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.aceDestructionAnswer') }}
        </p>
        <h3>{{ t('rules.faq.revealNoPoints') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.revealNoPointsAnswer') }}
        </p>
        <h3>{{ t('rules.faq.revealOneLeft') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.revealOneLeftAnswer') }}
        </p>
        <h3>{{ t('rules.faq.deckExhaust') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.deckExhaustAnswer') }}
        </p>
        <h3>{{ t('rules.faq.whereToPlay') }}</h3>
        <p class="mb-4">
          {{ t('rules.faq.whereToPlayAnswer') }}
          <a href="https://www.cuttle.cards"> www.cuttle.cards </a>
        </p>
        <v-btn
          to="/"
          width="300px"
          color="primary"
          class="align-self-center"
          data-cy="bottom-home-button"
        >
          {{ buttonText }}
        </v-btn>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import { useI18n } from 'vue-i18n';
import { mapStores } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import RulePreview from '@/routes/rules/components/RulePreview.vue';
import BaseVideo from '@/components/BaseVideo.vue';
import { useThemedLogo } from '@/composables/themedLogo';

export default {
  name: 'RulesView',
  components: {
    RulePreview,
    BaseVideo
  },
  setup() {
    const { t } = useI18n();
    const { logoSrc } = useThemedLogo();
    return {
      t,
      logoSrc,
    };
  },
  computed: {
    ...mapStores(useAuthStore),
    buttonText() {
      if (this.authStore.username) {
        return this.$t('rules.findGame');
      }
      return this.$t('rules.signUp');
    },
  },
  created() {
    this.rules = [
      // First Row
      [
        {
          title: this.$t('rules.draw'),
          icon: 'cards-playing-spade-multiple',
          description: this.$t('rules.drawDescription'),
          staticImg: '/img/game/cuttle-board.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/draw.gif?raw=true',
        },
        {
          title: this.$t('rules.points'),
          icon: 'numeric',
          description: this.$t('rules.pointsDescription'),
          staticImg: '/img/game/cuttle-points.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/points.gif?raw=true',
        },
      ],
      // Second Row
      [
        {
          title: this.$t('rules.scuttle'),
          icon: 'skull-crossbones',
          description: this.$t('rules.scuttleDescription'),
          staticImg: '/img/game/cuttle-scuttle.png',
          animatedImg:
            'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/scuttling.gif?raw=true',
        },
        {
          title: this.$t('rules.royal'),
          icon: 'crown',
          description: this.$t('rules.royalDescription'),
          staticImg: '/img/game/cuttle-king.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/king.gif?raw=true',
        },
      ],
      // Third Row
      [
        {
          title: this.$t('rules.oneoff'),
          icon: 'delete',
          description: this.$t('rules.oneoffDescription'),
          staticImg: '/img/game/cuttle-one-off-six.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/six.gif?raw=true',
        },
        {
          title: this.$t('rules.glasses'),
          icon: 'sunglasses',
          description: this.$t('rules.glassesDescription'),
          staticImg: '/img/game/cuttle-glasses.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/glasses.gif?raw=true',
        },
      ],
    ];
    this.royals = [
      [
        {
          title: this.$t('rules.royals.king'),
          icon: 'crown',
          description: this.$t('rules.royals.kingDescription'),
          staticImg: '/img/game/cuttle-king.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/king.gif?raw=true',
        },
        {
          title: this.$t('rules.royals.queen'),
          icon: 'crown',
          description: this.$t('rules.royals.queenDescription'),
          staticImg: '/img/game/cuttle-queen.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/queen.gif?raw=true',
        },
      ],
      [
        {
          title: this.$t('rules.royals.jack'),
          icon: 'crown',
          description: this.$t('rules.royals.jackDescription'),
          staticImg: '/img/game/cuttle-jack.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/jack.gif?raw=true',
        },
      ],
    ];
    this.oneOffs = [
      [
        {
          title: this.$t('rules.oneoffs.ace'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.aceDescription'),
          staticImg: '/img/game/cuttle-one-off-ace.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/ace.gif?raw=true',
        },
        {
          title: this.$t('rules.oneoffs.twoE1'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.twoE1Description'),
          staticImg: '/img/game/cuttle-counter.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/counter.gif?raw=true',
        },
      ],
      [
        {
          title: this.$t('rules.oneoffs.twoE2'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.twoE2Description'),
          staticImg: '/img/game/cuttle-one-off-two.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/two.gif?raw=true',
        },
        {
          title: this.$t('rules.oneoffs.three'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.threeDescription'),
          staticImg: '/img/game/cuttle-one-off-three.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/three.gif?raw=true',
        },
      ],
      [
        {
          title: this.$t('rules.oneoffs.four'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.fourDescription'),
          staticImg: '/img/game/cuttle-one-off-four.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/four.gif?raw=true',
        },
        {
          title: this.$t('rules.oneoffs.five'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.fiveDescription'),
          staticImg: '/img/game/cuttle-one-off-five.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/five.gif?raw=true',
        },
      ],
      [
        {
          title: this.$t('rules.oneoffs.six'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.sixDescription'),
          staticImg: '/img/game/cuttle-one-off-six.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/six.gif?raw=true',
        },
        {
          title: this.$t('rules.oneoffs.seven'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.sevenDescription'),
          staticImg: '/img/game/cuttle-one-off-seven.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/seven.gif?raw=true',
        },
      ],
      [
        {
          title: this.$t('rules.oneoffs.nine'),
          icon: 'delete',
          description: this.$t('rules.oneoffs.nineDescription'),
          staticImg: '/img/game/cuttle-one-off-nine.png',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/nine.gif?raw=true',
        },
      ],
    ];
  },
  methods: {
    handleAnimate(cmp) {
      const { animate } = cmp;
      if (!animate) {
        return;
      }
      // reset other previews if we're currently animating
      this.$refs.preview.filter((c) => c !== cmp).forEach((c) => (c.animate = false));
    },
  },
};
</script>
<style scoped>
#logo {
  height: 20vh;
  margin: 0 auto;
}


</style>
