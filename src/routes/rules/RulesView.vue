<template>
  <div :class="[ isInModal ? 'bg-surface-1 text-surface-2' : 'pa-4 bg-surface-1 text-surface-2' ]">
    <v-container>
      <BackToTop :parent-modal-id="isInModal ? parentModalId : ''" />

      <v-row>
        <RulesNav 
          v-if="!isInModal"
          :section-titles="sectionTitles" 
          :active-title="activeTitle" 
          :is-in-modal="isInModal"
          @click="goToSection($event)" 
        />

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
              v-intersect="intersectConfig"
              class="flex-column align-start mt-8"
            >
              <h1 class="text-h2 text-surface-2 section-title">
                {{ t('rules.introduction') }}
              </h1>
              <!-- What is Cuttle? -->
              <div>
                <h2 class="text-label-lg">
                  {{ t('rules.cuttleTitle') }}
                </h2>
                <p class="d-block text-lg">
                  {{ t('rules.cuttleText') }}
                </p>
              </div>
            </v-row>

            <!-- Rules of Cuttle -->
            <v-row class="flex-column align-start my-8">
              <h2 class="text-label-lg">
                {{ t('rules.rulesTitle') }}
              </h2>
              <p class="text-lg">
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
              v-intersect="intersectConfig"
              class="flex-column align-start section"
            >
              <h1 class="text-h2 text-surface-2 section-title">
                {{ t('rules.howToPlay') }}
              </h1>
              <h2 class="text-label-lg">
                {{ t('rules.goalTitle') }}
              </h2>
              <p class="d-block text-md">
                {{ t('rules.goalText') }}
              </p>
            </v-row>
            <!-- Play -->
            <v-row class="flex-column align-start mt-8">
              <h2 class="d-block text-label-lg">
                {{ t('rules.playTitle') }}
              </h2>
              <p class="d-block text-md">
                {{ t('rules.playText-1') }} <br>
                {{ t('rules.playText-2') }}
              </p>
            </v-row>
          </section>

          <!-- Actions -->
          <section id="actions" v-intersect="intersectConfig" class="section">
            <v-row>
              <h1 class="text-h2 text-surface-2 section-title">
                {{ t('rules.actions.title') }}
              </h1>
            </v-row>
            <RuleParagraph
              v-for="rule in rules"
              :key="rule.title"
              :rule="rule"
            />
          </section>

          <!-- Royals -->
          <section id="royals" v-intersect="intersectConfig" class="section">
            <div>
              <v-row class="flex-column">
                <h1 class="text-h2 text-surface-2 section-title">
                  {{ t('rules.royals.title') }}
                </h1>
              </v-row>
            </div>
            <v-row
              v-for="rule in royals"
              :key="rule.title"
              align="start"
              class="my-6"
            >
              <RulePreview
                :key="rule.title"
                ref="preview"
                :title="rule.title"
                :description="rule.description"
                :description2="rule.description2"
                :static-img="rule.staticImg"
                :has-video="!!rule.animatedImg"
                @animate="handleAnimate(rule.animatedImg, rule.title)"
              />
            </v-row>
          </section>

          <section id="oneoffs" v-intersect="intersectConfig" class="section">
            <!-- One-Offs -->
            <v-row>
              <h1 class="text-h2 text-surface-2 section-title">
                {{ t('rules.oneoffs.title') }}
              </h1>
            </v-row>
            <v-row
              v-for="rule in oneOffs"
              :key="rule.title"
              align="start"
              class="my-6"
            >
              <RulePreview
                ref="preview"
                :title="rule.title"
                :description="rule.description"
                :description2="rule.description2"
                :static-img="rule.staticImg"
                :icon="rule.icon"
                :has-video="!!rule.animatedImg"
                @animate="handleAnimate(rule.animatedImg, rule.title)"
              />
            </v-row>
          </section>

          <!-- Ready to Play? -->
          <section v-if="!isInModal" class="section">
            <v-row class="bg-surface-2 pa-8 rounded-xl d-flex flex-column align-center">
              <h2 class="text-surface-1 pa-8">
                {{ t('rules.readyToPlay.readyToPlay') }}
              </h2>
              <v-btn to="/" color="newPrimary" data-cy="ready-to-play-button">
                {{ buttonText }}
              </v-btn>
            </v-row>
          </section>

          <!-- Rules for 3-4 Players -->
          <section id="multiplayer" v-intersect="intersectConfig" class="section">
            <v-row>
              <h1 class="text-h2 text-surface-2 section-title">
                {{ t('rules.multiplayerTitle') }}
              </h1>
              <p class="d-block text-lg">
                {{ t('rules.multiplayerText1') }}
                <a href="https://cuttle.cards" class="text-anchor">cuttle.cards</a>
                {{ t('rules.multiplayerText2') }}
              </p>
            </v-row>
            <v-row>
              <MultiplayerRuleBlock
                v-for="(ruleSet, index) in multiplayer"
                :key="index"
                :heading="t(ruleSet.title)"
                :paragraph="t(ruleSet.text)"
                :rules-difference="t(ruleSet.rulesDifference)"
                :rules="ruleSet.rules.map((rule) => t(rule))"
              />
            </v-row>
          </section>

          <!-- FAQ -->
          <section class="section">
            <v-row
              id="faq"
              v-intersect="intersectConfig"
              class="d-flex flex-column mb-4"
            >
              <h1 class="text-h2 text-surface-2 section-title">
                {{ t('rules.faq.title') }}
              </h1>
              <FAQEntry v-for="question in faq" :key="`faq-entry-${question}`" :msg-key="question" />
            </v-row>
          </section>

          <!-- Tournaments -->
          <section class="section">
            <v-row
              id="tournaments"
              v-intersect="intersectConfig"
              class="flex-column"
            >
              <h1 class="text-h2 text-surface-2 section-title">
                {{ t('rules.tournaments.title') }}
              </h1>
            </v-row>
  
            <v-row>
              <p class="text-md">
                {{ t('rules.tournaments.competitiveCuttle1') }}
              </p>
  
              <div class="d-flex flex-column my-5">
                <AwardCard
                  :username="t('rules.tournaments.championPlayer')"
                  :place="1"
                  :is-card="false"
                  class="mb-4"
                />
                <AwardCard
                  :username="t('rules.tournaments.secondPlacePlayer')"
                  :place="2"
                  :is-card="false"
                  class="mb-4"
                />
                <AwardCard
                  :username="t('rules.tournaments.thirdPlacePlayer')"
                  :place="3"
                  :is-card="false"
                  class="mb-4"
                />
              </div>
              <p class="text-md">
                {{ t('rules.tournaments.competitiveCuttle2') }}
              </p>
              <v-list class="mt-4 rounded-xl w-100 my-8" bg-color="surface-2" base-color="surface-1">
                <v-list-item>
                  <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.firstPlace">
                    {{ t('rules.tournaments.scoring.numPoints', 5) }}
                  </v-chip>
                  {{ t('rules.tournaments.scoring.firstPlace') }}
                </v-list-item>
                <v-list-item>
                  <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.secondPlace">
                    {{ t('rules.tournaments.scoring.numPoints', 4) }}
                  </v-chip>
                  {{ t('rules.tournaments.scoring.secondPlace') }}
                </v-list-item>
                <v-list-item>
                  <v-chip variant="elevated" class="mr-2 mb-1" :color="theme.thirdPlace">
                    {{ t('rules.tournaments.scoring.numPoints', 3) }}
                  </v-chip>
                  {{ t('rules.tournaments.scoring.thirdPlace') }}
                </v-list-item>
                <v-list-item>
                  <v-chip variant="outlined" class="mr-2 mb-1" :color="theme.primary">
                    {{ t('rules.tournaments.scoring.numPoints', 2) }}
                  </v-chip>
                  {{ t('rules.tournaments.scoring.oneWin') }}
                </v-list-item>
                <v-list-item>
                  <v-chip variant="outlined" class="mr-2 mb-1" color="#000">
                    {{ t('rules.tournaments.scoring.numPoints') }}
                  </v-chip>
                  &nbsp; {{ t('rules.tournaments.scoring.completedMatch') }}
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
              <p class="text-md">
                *{{ t('rules.tournaments.exampleImgExplanation') }}
              </p>
            </v-row>
          </section>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import { mapStores } from 'pinia';
import { useGoTo } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useThemedLogo } from '@/composables/themedLogo';
import { rules, royals, oneOffs, faq, sectionTitles, multiplayer } from './data/rulesData';
import RulesNav from './components/RulesNav.vue';
import RuleParagraph from './components/RuleParagraph.vue';
import RulePreview from '@/routes/rules/components/RulePreview.vue';
import BaseVideo from '@/components/BaseVideo.vue';
import AwardCard from '../../components/AwardCard.vue';
import RulePreviewDialog from './components/RulePreviewDialog.vue';
import FAQEntry from './components/FAQEntry.vue';
import BackToTop from '@/components/BackToTop.vue';
import MultiplayerRuleBlock from './components/MultiplayerRuleBlock.vue';

export default {
  name: 'RulesView',
  components: {
    RulePreview,
    BaseVideo,
    AwardCard,
    RulePreviewDialog,
    BackToTop,
    RuleParagraph,
    FAQEntry,
    RulesNav,
    MultiplayerRuleBlock,
  },
  props: {
    isInModal : {
      type :Boolean,
      default: false
    },
    parentModalId : {
      type:String,
      default: ''
    },
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
      activeTitle: 'introduction',
      previewDialog: false,
      imageUrl: '',
      previewTitle: ''
    };
  },
  computed: {
    ...mapStores(useAuthStore),
    authenticated() {
      return this.authStore.authenticated;
    },
    buttonText() {
      if (this.authenticated) {
        return this.$t('rules.readyToPlay.findGame');
      }
      return this.$t('rules.readyToPlay.signUp');
    },
    theme() {
      return this.$vuetify.theme.themes.cuttleTheme.colors;
    },
  },
  created() {
    this.rules = rules;
    this.royals = royals;
    this.oneOffs = oneOffs;
    this.sectionTitles = sectionTitles;
    this.faq = faq;
    this.multiplayer = multiplayer;

    // Scrolling
    this.scrollOptions = {
      duration: 1000,
      offset: -100,
      easing: 'easeInOutCubic',
    };

    // Intersection

    const onIntersect = (_isIntersecting, entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.activeTitle = entry.target.id;
        }
      });
    };

    this.intersectConfig = this.isInModal ? {} : {
      handler: onIntersect,
      options: {
        rootMargin: '-150px 0px -500px 0px',
      }
    };
    
  },
  methods: {
    goToSection(url) {
      this.goTo(url, this.scrollOptions);
      window.location.hash = url;
    },
    handleAnimate(imageUrl, title) {
      this.imageUrl = imageUrl;
      this.previewTitle = this.t(title);
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

<style scoped lang="scss">
::-webkit-scrollbar {
  width: 0px;
}

#logo {
  height: 20vh;
  margin: 0 auto;
}

.section-title {
  font-family: 'Luckiest Guy', serif !important;
  background-color: rgba(var(--v-theme-newPrimary));
  width: 100%;
  padding-top: 16px;
  padding-left: 24px;
  border-radius: 16px;
  margin-bottom: 40px;
}

.section {
  margin-top: 64px;
}

.section#multiplayer {
  margin-top: 120px;
}

.text-label-lg {
  margin-bottom: 8px;
}
@media (max-width: 960px) {
  .section-title {
    font-size: 2.4rem !important;
  }
}
</style>
