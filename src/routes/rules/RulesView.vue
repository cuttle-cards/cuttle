<template>
  <div class="pa-4 bg-surface-1">
    <v-container>
      <v-row class="mt-10">
        <v-col class="sidebar-container" lg="3" sm="12">
          <ul class="ms-5 sidebar-title mt-8">
            <li v-for="{ title, href } in sectionTitle" :key="title">
              <router-link class="text-surface-2 text-h5 text-decoration-none" :to="{ name: 'Rules', hash: href }">{{t(title)}}</router-link>
            </li>
          </ul>
        </v-col>

        <!-- Rules -->
        <v-col>
          <v-row id="introduction" class="flex-column align-start">
            <div class="mt-8">
              <h1 class="text-h2 text-surface-2 mb-5 section-title">
                {{ t('rules.introduction') }}
              </h1>
              <h1 class="">
                {{ t('rules.cuttleTitle') }}
              </h1>
              <p class="d-block">
                {{ t('rules.cuttleText') }}
              </p>
            </div>
          </v-row>
          <!-- Tutorial -->
          <v-row class="flex-column align-start mt-5">
            <h1 class="">
              {{ t('rules.rulesTitle') }}
            </h1>
            <p>
              {{ t('rules.rulesReadText') }}
              <a href="/img/cuttle_rules.pdf" target="_blank" class="text-anchor"> Cuttle Cheestsheet </a>
              {{ t('rules.rulesWatchText') }}
            </p>
            <div class="w-100 my-4">
              <BaseVideo source="https://www.youtube.com/embed/qOqkNbhMdsI" />
            </div>
          </v-row>
          <!-- Goal -->
          <v-row id="howtoplay" class="flex-column align-start mt-5">
            <h1 class="text-h2 text-surface-2 mb-5 section-title">
              {{ t('rules.howToPlay') }}
            </h1>
            <h1 class="">
              {{ t('rules.goalTitle') }}
            </h1>
            <p class="d-block">
              {{ t('rules.goalText') }}
            </p>
          </v-row>
          <!-- Play -->
          <v-row class="flex-column align-start mt-5">
            <h1 class="d-block">
              {{ t('rules.playTitle') }}
            </h1>
            <p class="d-block">
              {{ t('rules.playText-1') }} <br />
              {{ t('rules.playText-2') }}
            </p>
          </v-row>

          <v-row>
            <h1 class="text-h2 text-surface-2 mt-5 section-title">
              {{ t('rules.actions') }}
            </h1>
          </v-row>
          <v-row
            v-for="(ruleRow, rowIndex) in rules"
            :key="`rule-row-${rowIndex}`"
            align="start"
            class="my-6"
          >
            <div class="flex-column" v-for="rule in ruleRow" :key="rule.title">
              <div class="d-flex">
                <v-img :src="rule.staticImg" class="mr-1 max-w-24" aria-hidden="false" role="img" />
                <h1>
                  {{ t(rule.title) }}
                </h1>
              </div>
              <p class="d-block">
                {{ t(rule.description) }}
              </p>
              <p v-if="rule.title === 'rules.scuttle'" class="d-flex my-5">
                <v-img
                  src="../../../public/img/rulesView/rules_action_clubs.svg"
                  class="mr-1 max-w-24"
                  aria-hidden="false"
                  role="img"
                />
                &nbsp; Clubs (weakest) &lt;
                &nbsp;<v-img
                  src="../../../public/img/rulesView/rules_action_diamond.svg"
                  class="mr-1 max-w-24"
                  aria-hidden="false"
                  role="img"
                />
                &nbsp; Diamonds &lt;
                &nbsp;<v-img
                  src="../../../public/img/rulesView/rules_action_hearts.svg"
                  class="mr-1 max-w-24"
                  aria-hidden="false"
                  role="img"
                />
                &nbsp; Hearts &lt;
                &nbsp;<v-img
                  src="../../../public/img/rulesView/rules_action_spades.svg"
                  class="mr-1 max-w-24"
                  aria-hidden="false"
                  role="img"
                />
                &nbsp; Spades (highest)
              </p>
            </div>
          </v-row>
          <!-- Royals -->
          <section id="royals">
            <v-row class="flex-column">
              <h1 class="text-h2 text-surface-2 mt-5 section-title">
                {{ t('rules.royals.title') }}
              </h1>
            </v-row>
          </section>
          <v-row
            v-for="(ruleRow, rowIndex) in royals"
            :key="`royal-row-${rowIndex}`"
            align="start"
            class="my-6"
          >
            <RulePreview
              v-for="rule in ruleRow"
              :key="rule.title"
              ref="preview"
              :title="t(rule.title)"
              :description="t(rule.description)"
              :animated-img="rule.animatedImg"
              :static-img="rule.staticImg"
              :icon="rule.icon"
              @animate="handleAnimate"
            />
          </v-row>
          <!-- One-Offs -->
          <v-row id="oneoffs">
            <h1 class="text-h2 text-surface-2 mt-5 section-title">
              {{ t('rules.oneoffs.title') }}
            </h1>
          </v-row>
          <v-row
            v-for="(rule, rowIndex) in oneOffs"
            :key="`one-off-row-${rowIndex}`"
            align="start"
            class="my-6"
          >
            <RulePreview
              v-if="rowIndex !== 1"
              ref="preview"
              :title="t(rule.title)"
              :description="t(rule.description)"
              :animated-img="rule.animatedImg"
              :static-img="rule.staticImg"
              :icon="rule.icon"
              @animate="handleAnimate"
            />
            <RulePreview
              v-else
              ref="preview"
              :title="t(rule.title)"
              :description="t(rule.description)"
              :description2="t(rule.description2)"
              :animated-img="rule.animatedImg"
              :static-img="rule.staticImg"
              :icon="rule.icon"
              @animate="handleAnimate"
            />
          </v-row>

          <v-row class="bg-surface-2 pa-8 rounded-xl d-flex flex-column align-center">
            <h2 class="text-surface-1 pa-8">Ready To Play</h2>
            <v-btn to="/" color="newPrimary"> Find A Game </v-btn>
          </v-row>
          <!-- Multiplayer Variants
          <v-row class="d-flex flex-column mb-4">
            <h1 class="">
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
          </v-row> -->
          <!-- FAQ -->
          <v-row id="faq" class="d-flex flex-column mb-4">
            <h1 class="mt-5">
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
            </p>
          </v-row>
          <v-row id="tournaments" class="flex-column">
            <h1 class="text-h2 text-surface-2 my-6 section-title">
              {{ t('rules.tournaments') }}
            </h1>
          </v-row>

          <v-row>
            <p>
              Competitive Cuttle is divided into 4 seasons per year, one per suit: Clubs, Diamonds, Hearts,
              and Spades. At the end of each season, the top 8 players play a double elimination championship
              tournament and the champions are permanently accoladed on the site.
            </p>

            <div class="d-flex flex-column my-5">
              <AwardCard username="Champion player" :place="1" :isCard="false" class="mb-4" />
              <AwardCard username="Second Place Player" :place="2" :isCard="false" class="mb-4" />
              <AwardCard username="Third Place Player" :place="3" :isCard="false" class="mb-4" />
            </div>
            <p>
              Each Season is divided into 13 weeks. For each week, we count the number of best 2/3 ranked
              matches each player wins against unique opponents (ignoring stalemates) and assign players
              points based on their weekly standing.
            </p>
            <v-list class="mt-4 rounded-xl w-100" bg-color="surface-2" base-color="surface-1">
              <v-list-item>
                <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.firstPlace"> 5 Points </v-chip>
                The player with the most wins gets 5 points for the week
              </v-list-item>
              <v-list-item>
                <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.secondPlace"> 4 Points </v-chip>
                The player with the 2nd most wins gets 4 points for the week
              </v-list-item>
              <v-list-item>
                <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.thirdPlace"> 3 Points </v-chip>
                The player with the 3rd most wins gets 3 points for the week
              </v-list-item>
              <v-list-item>
                <v-chip variant="outlined" class="mr-2 mb-1" :color="theme.primary"> 2 Points </v-chip>
                Each other player who won at least one match gets 2 points for the week
              </v-list-item>
              <v-list-item>
                <v-chip variant="outlined" class="mr-2 mb-1" color="#000"> 1 Point </v-chip>
                Each other player who completed a match without winning gets 1 point for the week
              </v-list-item>
            </v-list>
          </v-row>

          <v-row>
            <v-img
              src="../../../../public/img/rulesView/leaderboard_example.jpg"
              alt="leader board"
              class="mr-2 my-3 rounded-xl"
              aria-hidden="false"
              role="img"
            />
          </v-row>
          <v-row>
            <p>*Example of stats / tournament page</p>
          </v-row>
        </v-col>
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
import AwardCard from '../../components/AwardCard.vue';

export default {
  name: 'RulesView',
  components: {
    RulePreview,
    BaseVideo,
    AwardCard,
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
    theme() {
      return this.$vuetify.theme.themes.cuttleTheme.colors;
    },
  },
  created() {
    this.rules = [
      [
        {
          title: 'rules.draw',
          icon: 'cards-playing-spade-multiple',
          description: 'rules.drawDescription',
          staticImg: '/img/rulesView/rules_action_draw.svg',
        },
        {
          title: 'rules.points',
          icon: 'numeric',
          description: 'rules.pointsDescription',
          staticImg: '/img/rulesView/rules_action_points.svg',
        },
      ],
      [
        {
          title: 'rules.scuttle',
          icon: 'skull-crossbones',
          description: 'rules.scuttleDescription',
          staticImg: '/img/rulesView/rules_action_skull.svg',
        },
        {
          title: 'rules.royal',
          icon: 'crown',
          description: 'rules.royalDescription',
          staticImg: '/img/rulesView/rules_action_royals.svg',
        },
      ],
      [
        {
          title: 'rules.oneoff',
          icon: 'delete',
          description: 'rules.oneoffDescription',
          staticImg: '/img/rulesView/rules_action_oneoffs.svg',
        },
      ],
    ];
    this.royals = [
      [
        {
          title: 'rules.royals.king',
          icon: 'crown',
          description: 'rules.royals.kingDescription',
          staticImg: '/img/rulesView/royals_king.svg',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/king.gif?raw=true',
        },
        {
          title: 'rules.royals.queen',
          icon: 'crown',
          description: 'rules.royals.queenDescription',
          staticImg: '/img/rulesView/royals_queen.svg',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/queen.gif?raw=true',
        },
      ],
      [
        {
          title: 'rules.royals.jack',
          icon: 'crown',
          description: 'rules.royals.jackDescription',
          staticImg: '/img/rulesView/royals_jack.svg',
          animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/jack.gif?raw=true',
        },
      ],
    ];
    this.oneOffs = [
      {
        title: 'rules.oneoffs.ace',
        icon: 'delete',
        description: 'rules.oneoffs.aceDescription',
        staticImg: '/img/rulesView/oneoffs_ace.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/ace.gif?raw=true',
      },
      {
        title: 'rules.oneoffs.two',
        icon: 'delete',
        description: 'rules.oneoffs.twoE1Description',
        description2: 'rules.oneoffs.twoE2Description',
        staticImg: '/img/rulesView/oneoffs_two.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/counter.gif?raw=true',
      },
      {
        title: 'rules.oneoffs.three',
        icon: 'delete',
        description: 'rules.oneoffs.threeDescription',
        staticImg: '/img/rulesView/oneoffs_three.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/three.gif?raw=true',
      },
      {
        title: 'rules.oneoffs.four',
        icon: 'delete',
        description: 'rules.oneoffs.fourDescription',
        staticImg: '/img/rulesView/oneoffs_four.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/four.gif?raw=true',
      },
      {
        title: 'rules.oneoffs.five',
        icon: 'delete',
        description: 'rules.oneoffs.fiveDescription',
        staticImg: '/img/rulesView/oneoffs_five.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/five.gif?raw=true',
      },
      {
        title: 'rules.oneoffs.six',
        icon: 'delete',
        description: 'rules.oneoffs.sixDescription',
        staticImg: '/img/rulesView/oneoffs_six.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/six.gif?raw=true',
      },
      {
        title: 'rules.oneoffs.seven',
        icon: 'delete',
        description: 'rules.oneoffs.sevenDescription',
        staticImg: '/img/rulesView/oneoffs_seven.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/seven.gif?raw=true',
      },
      {
        title: 'rules.oneoffs.eight',
        icon: 'delete',
        description: 'rules.oneoffs.eightDescription',
        staticImg: '/img/rulesView/oneoffs_eight.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/seven.gif?raw=true',
      },
      {
        title: 'rules.oneoffs.nine',
        icon: 'delete',
        description: 'rules.oneoffs.nineDescription',
        staticImg: '/img/rulesView/oneoffs_nine.svg',
        animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/nine.gif?raw=true',
      },
    ];
    this.sectionTitle = [
      { title: 'rules.introduction', href: '#introduction' },
      { title: 'rules.howToPlay', href: '#howtoplay' },
      { title: 'rules.royals.title', href: '#royals' },
      { title: 'rules.oneoffs.title', href: '#oneoffs' },
      { title: 'rules.faq.title', href: '#faq' },
      { title: 'rules.tournaments', href: '#tournaments' },
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

::-webkit-scrollbar {
  width: 0px;
}

#logo {
  height: 20vh;
  margin: 0 auto;
}
.sidebar-title {
  
  display: flex;
  gap: 2rem;
}

h1,
h3,
p {
  color: rgba(var(--v-theme-surface-2));
}

.section-title {
  font-family: 'Luckiest Guy', serif !important;
}

.sidebar-title li {
  list-style: none;
}

.max-w-24 {
  max-width: 24px;
}

@media (min-width: 992px) {
  .sidebar-title {
    position: fixed;
    flex-direction: column;
  }
}

@media (max-width: 992px) {
  .sidebar-container{
    background: rgba(var(--v-theme-surface-1));
    position: sticky;
    top: 30px;
    z-index: 999;
  }
  .sidebar-title {
    white-space: nowrap;
    overflow-x: auto;
  }
}

@media (max-width: 768px) {
}
</style>
