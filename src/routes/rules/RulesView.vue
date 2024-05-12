<template>
  <div class="pa-4 bg-surface-1 text-surface-2">
    <v-container>
      <BackToTop />
      <v-row>
        <v-col class="sidebar-container" lg="3" sm="12">
          <ul class="ms-5 sidebar-title mt-8">
            <li
              v-for="{ title, href, id } in sectionTitle"
              :id="'listItem_' + id"
              :key="title"
              ref="items"
            >
              <button
                :class="[
                  activeTitle === id ? 'text-newPrimary' : 'text-surface-2',
                  'text-h5 text-decoration-none',
                ]"
                @click="goToSection(href)"
              >
                {{ t(title) }}
              </button>
            </li>
          </ul>
        </v-col>

        <v-col>
          <RulePreviewDialog
            v-model="previewDialog"
            :image-url="imageUrl"
            :title="previewTitle"
            @close="closeAnimate"
          />

          <!-- Introduction -->
          <section>
            <v-row
              id="introduction"
              v-intersect="{
                handler: onIntersect,
              }"
              class="flex-column align-start"
            >
              <!-- What is Cuttle? -->
              <div class="mt-8">
                <h1 class="text-h2 text-surface-2 mb-5 section-title">
                  {{ t('rules.introduction') }}
                </h1>
                <h1>
                  {{ t('rules.cuttleTitle') }}
                </h1>
                <p class="d-block">
                  {{ t('rules.cuttleText') }}
                </p>
              </div>
            </v-row>

            <!-- Tutorial -->
            <v-row class="flex-column align-start my-8">
              <h1>
                {{ t('rules.rulesTitle') }}
              </h1>
              <p>
                {{ t('rules.rulesReadText') }}
                <a href="/img/cuttle_rules.pdf" target="_blank" class="text-anchor"> Cuttle Cheatsheet</a>
                {{ t('rules.rulesWatchText') }}
              </p>
              <div class="w-100 my-4">
                <BaseVideo source="https://www.youtube.com/embed/qOqkNbhMdsI" />
              </div>
            </v-row>
          </section>

          <!-- How to Play -->
          <section class="section">
            <!-- Goal -->
            <v-row
              id="howtoplay"
              v-intersect="{
                handler: onIntersect,
              }"
              class="flex-column align-start section"
            >
              <h1 class="text-h2 text-surface-2 mb-5 section-title">
                {{ t('rules.howToPlay') }}
              </h1>
              <h1>
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
                {{ t('rules.playText-1') }} <br>
                {{ t('rules.playText-2') }}
              </p>
            </v-row>
          </section>

          <!-- Actions -->
          <section class="section">
            <v-row>
              <h1 class="text-h2 text-surface-2 mt-5 section-title">
                {{ t('rules.actions.title') }}
              </h1>
            </v-row>
            <v-row
              v-for="(ruleRow, rowIndex) in rules"
              :key="`rule-row-${rowIndex}`"
              align="start"
              class="my-6"
            >
              <div v-for="rule in ruleRow" :key="rule.title" class="flex-column">
                <div class="d-flex">
                  <v-img
                    :src="rule.staticImg"
                    class="mr-1 max-w-24"
                    aria-hidden="false"
                    role="img"
                  />
                  <h1>
                    {{ t(rule.title) }}
                  </h1>
                </div>
                <p class="d-block">
                  {{ t(rule.description) }}
                </p>
                <p v-if="rule.title === 'rules.scuttle'" class="d-flex my-5">
                  <v-img
                    src="img/rulesView/rules_action_clubs.svg"
                    class="mr-1 max-w-24"
                    aria-hidden="false"
                    role="img"
                  />
                  &nbsp;
                  {{ t('rules.actions.clubs') }}
                  &lt; &nbsp;

                  <v-img
                    src="img/rulesView/rules_action_diamond.svg"
                    class="mr-1 max-w-24"
                    aria-hidden="false"
                    role="img"
                  />
                  &nbsp;
                  {{ t('rules.actions.diamonds') }}
                  &lt; &nbsp;

                  <v-img
                    src="img/rulesView/rules_action_hearts.svg"
                    class="mr-1 max-w-24"
                    aria-hidden="false"
                    role="img"
                  />
                  &nbsp;
                  {{ t('rules.actions.hearts') }}
                  &lt; &nbsp;

                  <v-img
                    src="img/rulesView/rules_action_spades.svg"
                    class="mr-1 max-w-24"
                    aria-hidden="false"
                    role="img"
                  />
                  &nbsp;
                  {{ t('rules.actions.spades') }}
                </p>
              </div>
            </v-row>
          </section>

          <!-- Royals -->
          <section class="section">
            <div
              id="royals"
              v-intersect="{
                handler: onIntersect,
              }"
            >
              <v-row class="flex-column">
                <h1 class="text-h2 text-surface-2 mt-5 section-title">
                  {{ t('rules.royals.title') }}
                </h1>
              </v-row>
            </div>
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
                :static-img="rule.staticImg"
                :icon="rule.icon"
                @animate="handleAnimate(rule.animatedImg,t(rule.title))"
              />
            </v-row>
          </section>

          <section class="section">
            <!-- One-Offs -->
            <v-row
              id="oneoffs"
              v-intersect="{
                handler: onIntersect,
              }"
            >
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
                :static-img="rule.staticImg"
                :icon="rule.icon"
                @animate="handleAnimate(rule.animatedImg, t(rule.title))"
              />
              <RulePreview
                v-else
                ref="preview"
                :title="t(rule.title)"
                :description="t(rule.description)"
                :description2="t(rule.description2)"
                :static-img="rule.staticImg"
                :icon="rule.icon"
                @animate="handleAnimate(rule.animatedImg, t(rule.title))"
              />
            </v-row>
          </section>

          <!-- Ready to Play? -->
          <section class="section">
            <v-row class="bg-surface-2 pa-8 rounded-xl d-flex flex-column align-center">
              <h2 class="text-surface-1 pa-8">
                {{ t('rules.readyToPlay.readyToPlay') }}
              </h2>
              <v-btn to="/" color="newPrimary">
                {{ t('rules.readyToPlay.findAGame') }}
              </v-btn>
            </v-row>
          </section>

          <!-- FAQ -->
          <section class="section">
            <v-row
              id="faq"
              v-intersect="{
                handler: onIntersect,
              }"
              class="d-flex flex-column mb-4"
            >
              <h1 class="text-h2 text-surface-2 my-6 section-title">
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
          </section>

          <section class="section">
            <v-row
              id="tournaments"
              v-intersect="{
                handler: onIntersect,
              }"
              class="flex-column"
            >
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
                <AwardCard
                  username="Champion player"
                  :place="1"
                  :is-card="false"
                  class="mb-4"
                />
                <AwardCard
                  username="Second Place Player"
                  :place="2"
                  :is-card="false"
                  class="mb-4"
                />
                <AwardCard
                  username="Third Place Player"
                  :place="3"
                  :is-card="false"
                  class="mb-4"
                />
              </div>
              <p>
                Each Season is divided into 13 weeks. For each week, we count the number of best 2/3 ranked
                matches each player wins against unique opponents (ignoring stalemates) and assign players
                points based on their weekly standing.
              </p>
              <v-list class="mt-4 rounded-xl w-100 my-8" bg-color="surface-2" base-color="surface-1">
                <v-list-item>
                  <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.firstPlace">
                    5 Points
                  </v-chip>
                  The player with the most wins gets 5 points for the week
                </v-list-item>
                <v-list-item>
                  <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.secondPlace">
                    4 Points
                  </v-chip>
                  The player with the 2nd most wins gets 4 points for the week
                </v-list-item>
                <v-list-item>
                  <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.thirdPlace">
                    3 Points
                  </v-chip>
                  The player with the 3rd most wins gets 3 points for the week
                </v-list-item>
                <v-list-item>
                  <v-chip variant="outlined" class="mr-2 mb-1" :color="theme.primary">
                    2 Points
                  </v-chip>
                  Each other player who won at least one match gets 2 points for the week
                </v-list-item>
                <v-list-item>
                  <v-chip variant="outlined" class="mr-2 mb-1" color="#000">
                    1 Point
                  </v-chip>
                  Each other player who completed a match without winning gets 1 point for the week
                </v-list-item>
              </v-list>
            </v-row>
  
            <v-row>
              <v-img
                src="/img/rulesView/leaderboard_example.jpg"
                alt="leader board"
                class="mr-2 my-3 rounded-xl"
                aria-hidden="false"
                role="img"
              />
            </v-row>
            <v-row>
              <p>*Example of stats / tournament page</p>
            </v-row>
          </section>
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
import { rules, royals, oneOffs, sectionTitle } from './data/rulesData';
import RulePreviewDialog from './components/RulePreviewDialog.vue';
import { useGoTo } from 'vuetify';
import BackToTop from '@/components/BackToTop.vue';

export default {
  name: 'RulesView',
  components: {
    RulePreview,
    BaseVideo,
    AwardCard,
    RulePreviewDialog,
    BackToTop
  },
  setup() {
    const goTo = useGoTo();
    const { t } = useI18n();
    const { logoSrc } = useThemedLogo();
    return {
      t,
      logoSrc,
      goTo
    };
  },
    data() {
    return {
      scorllOptions:{
        duration: 1000,
      offset: -100,
      easing: 'easeInOutCubic',
      },
      activeTitle: 'introduction',
      previewDialog: false,
      imageUrl: '',
      previewTitle: ''
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
    (this.rules = rules),
      (this.royals = royals),
      (this.oneOffs = oneOffs),
      (this.sectionTitle = sectionTitle);
  },
  methods: {
    goToSection(url) {
      this.goTo(url, this.scorllOptions);
    },
    onIntersect(isIntersecting, entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.activeTitle = entry.target.id;
        }
      });
    },
    handleAnimate(imageUrl, title) {
      this.imageUrl = imageUrl;
      this.previewTitle = title;
      this.previewDialog = true;
    },
    closeAnimate() {
      this.imageUrl = '';
      this.previewTitle = '';
      this.previewDialog = false;
    }
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

.section-title {
  font-family: 'Luckiest Guy', serif !important;
}

.sidebar-title li {
  list-style: none;
}

.max-w-24 {
  max-width: 24px;
}

.section {
  margin-top: 64px;
}

@media (min-width: 992px) {
  .sidebar-title {
    position: sticky;
    top: 130px;
    flex-direction: column;
  }
}

@media (max-width: 992px) {
  .sidebar-container {
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
</style>
