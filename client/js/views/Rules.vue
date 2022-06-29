<template>
  <div class="pa-4">
    <v-container>
      <v-row>
        <img id="logo" alt="Cuttle logo" src="../img/logo.png" height="20vh" class="mb-8" />
      </v-row>
      <!-- Rules -->
      <div>
        <h1 class="gradient-text">
          Rules of Cuttle
        </h1>
        <p class="d-block">
          Cuttle is a 2 player battle card game played with a standard 52-card deck of cards. It has
          the strategic nuance of trading card games like Magic, with the elegant balance of a
          standard deck--and you can play it for free! Test your mettle in the deepest cardgame
          under the sea!
        </p>
        <div class="d-flex justify-center">
          <v-btn to="/" color="primary" data-cy="top-home-button">
            {{ buttonText }}
          </v-btn>
        </div>
      </div>
      <!-- Tutorial -->
      <v-row class="flex-column align-start mt-5">
        <h1 class="gradient-text">Tutorial Video</h1>
        <p>
          Watch the official cuttle.cards tutorial to learn the rules and get a feel for the flow of
          the game.
        </p>
        <div class="video-container__wrapper align-self-center my-4">
          <div class="video-container">
            <iframe
              class="video-container__video"
              src="https://www.youtube.com/embed/qOqkNbhMdsI"
              title="Cuttle Game Tutorial -- Youtube Player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
      </v-row>
      <!-- Goal -->
      <v-row class="flex-column align-start mt-5">
        <h1 class="gradient-text">
          Goal
        </h1>
        <p class="d-block">
          The goal is to be the first player to have 21 or more points worth of point cards on your
          field. The first player to reach the goal wins immediately. One player (traditionally the
          dealer) is dealt 6 cards, and their opponent is dealt 5. The player with 5 cards goes
          first.
        </p>
      </v-row>
      <!-- Play -->
      <v-row class="flex-column">
        <h1 class="d-block gradient-text">
          Play
        </h1>
        <p class="d-block">
          On your turn you must perform exactly one of the following actions:
        </p>
      </v-row>
      <v-row
        v-for="(ruleRow, rowIndex) in rules"
        :key="`rule-row-${rowIndex}`"
        align="start"
        class="my-6"
      >
        <v-col v-for="(rule, colIndex) in ruleRow" :key="rule.title" md="6" sm="12" class="my-4">
          <rule-preview
            v-bind="rule"
            :animate="isRuleSelected(rowIndex, colIndex)"
            @click="selectRule(rowIndex, colIndex)"
          />
        </v-col>
      </v-row>
      <!-- Royals -->
      <v-row class="flex-column">
        <div class="d-flex">
          <v-icon x-large color="black" class="mr-4">
            mdi-crown
          </v-icon>
          <h1 class="gradient-text">
            Royals
          </h1>
        </div>
        <p class="d-block">
          Royals (Kings, Queens, and Jacks) may be played to the field for a persistent benefit that
          remains in effect until the card is scrapped. Each Royal gives a different effect.
        </p>
      </v-row>
      <v-row
        v-for="(ruleRow, rowIndex) in royals"
        :key="`royal-row-${rowIndex}`"
        align="start"
        class="my-6"
      >
        <v-col v-for="(rule, colIndex) in ruleRow" :key="rule.title" md="6" sm="12" class="my-4">
          <rule-preview
            v-bind="rule"
            :animate="isRoyalSelected(rowIndex, colIndex)"
            @click="selectRoyal(rowIndex, colIndex)"
          />
        </v-col>
      </v-row>
      <!-- One-Offs -->
      <v-row>
        <div class="d-flex">
          <v-icon x-large color="black" class="mr-4">
            mdi-delete
          </v-icon>
          <h1 class="gradient-text">
            One-Offs
          </h1>
        </div>
        <p>
          Number cards (except 8’s and 10’s) can be played for a One-Off effect, which scraps the
          card for an effect based on the rank of the card played. Whenever a one-off is played, the
          other player may counter it using a two to cancel the effect.
        </p>
      </v-row>
      <v-row
        v-for="(ruleRow, rowIndex) in oneOffs"
        :key="`one-off-row-${rowIndex}`"
        align="start"
        class="my-6"
      >
        <v-col v-for="(rule, colIndex) in ruleRow" :key="rule.title" md="6" sm="12" class="my-4">
          <rule-preview
            v-bind="rule"
            :animate="isOneOffSelected(rowIndex, colIndex)"
            @click="selectOneOff(rowIndex, colIndex)"
          />
        </v-col>
      </v-row>
      <!-- FAQ -->
      <v-row class="d-flex flex-column mb-4">
        <h1 class="gradient-text">
          FAQ
        </h1>
        <h3>Can I play a two to counter a point card? What about a scuttle?</h3>
        <p class="mb-4">
          Nope! Twos can only counter One-Offs. You can play a two to destroy a Royal or Glasses
          Eight, but this takes your turn, unlike countering.
        </p>
        <h3>Do Queens protect against countering with a two?</h3>
        <p class="mb-4">
          Yes! Queens protect against targeting, when a card applies a unique effect to one specific
          card. This means your other cards (not the Queen, herself) are protected against Twos
          (either effect), Nines, and Jacks.
        </p>
        <h3>Do Queens protect against scuttling? What about Aces & Sixes?</h3>
        <p class="mb-4">
          No! Scuttling doesn't count as targeting, and neither do the board-wiping effects of Aces
          or Sixes. Queens only protect against the effects of Twos, Nines, and Jacks.
        </p>
        <h3>Can I counter a Two with a Two?</h3>
        <p class="mb-4">
          Heck yeah! Playing a Two to counter is a One-Off, which can be countered with a two.
          Stacked counters make for exciting plays and pivotal strategic moments.
        </p>
        <h3>Can I win by playing a King?</h3>
        <p class="mb-4">
          Yes! If you meet the required number of points, you win immediately. This means if you
          play a King when you already have enough points to meet the new limit, you win on that
          turn.
        </p>
        <h3>If I play an Ace or a Six, are my cards destroyed as well?</h3>
        <p class="mb-4">
          Yes. Aces and Sixes destroy all Point Cards and all Royals plus Glasses Eights,
          respectively. That includes any that you have out. Try to avoid destroying too many of
          your own cards!
        </p>
        <h3>
          Where can I play Cuttle?
        </h3>
        <p class="mb-4">
          You can play Cuttle anywhere you have a deck of cards and a friend! If you want to play
          online, there is only one place:
          <a href="https://www.cuttle.cards">
            www.cuttle.cards
          </a>
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
import RulePreview from '@/components/RulePreview.vue';

export default {
  name: 'Rules',
  components: {
    RulePreview,
  },
  data() {
    return {
      // Indices in 2d array of rules for active rule
      activeRuleIndices: [],
      // 2D array of rule objects
      rules: [
        // First Row
        [
          {
            title: 'Draw',
            icon: 'cards-playing-spade-multiple',
            description: 'Take one card from the Deck. You may not draw past the 8-card hand limit',
            staticImg: 'cuttle_board.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/draw.gif?raw=true',
          },
          {
            title: 'Points',
            icon: 'numeric',
            description:
              'Play a number card from your hand. Worth its rank in points, lasts until scrapped',
            staticImg: 'cuttle_points.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/points.gif?raw=true',
          },
        ],
        // Second Row
        [
          {
            title: 'Scuttle',
            icon: 'skull-crossbones',
            description: 'Scrap an opponent’s point card with a bigger one from your hand',
            staticImg: 'cuttle_scuttle.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/scuttling.gif?raw=true',
          },
          {
            title: 'Royal',
            icon: 'crown',
            description:
              'Play a face card for a persistent benefit based on rank (lasts until scrapped)',
            staticImg: 'cuttle_king.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/king.gif?raw=true',
          },
        ],
        // Third Row
        [
          {
            title: 'One-Off',
            icon: 'delete',
            description: 'Scrap a number card for an effect based on the rank of the card.',
            staticImg: 'cuttle_one_off_six.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/six.gif?raw=true',
          },
          {
            title: 'Glasses',
            icon: 'sunglasses',
            description: 'Play an Eight to reveal your opponent’s hand (lasts until scrapped)',
            staticImg: 'cuttle_glasses.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/glasses.gif?raw=true',
          },
        ],
      ],
      activeRoyalIndices: [],
      royals: [
        [
          {
            title: 'King',
            icon: 'crown',
            description:
              'Reduce the number of points you need to win (21, 14, 10, 7, 5 points with 0, 1, 2, 3, 4 kings)',
            staticImg: 'cuttle_king.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/king.gif?raw=true',
          },
          {
            title: 'Queen',
            icon: 'crown',
            description:
              'Protects your other cards from being targeted by the effects of other cards. This protects your cards against 2’s (both effects), 9’s, and Jacks, but not scuttling.',
            staticImg: 'cuttle_queen.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/queen.gif?raw=true',
          },
        ],
        [
          {
            title: 'Jack',
            icon: 'crown',
            description:
              'Play on an opponent’s point card to steal it. Point card returns to opponent if the jack is scrapped or if another jack is used to steal it back.',
            staticImg: 'cuttle_jack.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/jack.gif?raw=true',
          },
        ],
      ],
      activeOneOffIndices: [],
      oneOffs: [
        [
          {
            title: 'Ace',
            icon: 'delete',
            description: 'Scrap all point cards on the field',
            staticImg: 'cuttle_one_off_ace.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/ace.gif?raw=true',
          },
          {
            title: 'Two - Effect 1',
            icon: 'delete',
            description: 'Twos have two alternative one-off effects: Counter target One-Off Effect',
            staticImg: 'cuttle_counter.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/counter.gif?raw=true',
          },
        ],
        [
          {
            title: 'Two - Effect 2',
            icon: 'delete',
            description: 'Twos have two alternative one-off effects: Scrap target Royal',
            staticImg: 'cuttle_one_off_two.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/two.gif?raw=true',
          },
          {
            title: 'Three',
            icon: 'delete',
            description: 'Choose a card in the scrap pile and put it in your hand',
            staticImg: 'cuttle_one_off_three.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/three.gif?raw=true',
          },
        ],
        [
          {
            title: 'Four',
            icon: 'delete',
            description: 'Your opponent discards two cards of their choice',
            staticImg: 'cuttle_one_off_four.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/four.gif?raw=true',
          },
          {
            title: 'Five',
            icon: 'delete',
            description: 'Draw two cards from the deck (Up to the 8 card hand limit)',
            staticImg: 'cuttle_one_off_five.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/five.gif?raw=true',
          },
        ],
        [
          {
            title: 'Six',
            icon: 'delete',
            description: 'Scrap all Royals and Glasses Eights on the field',
            staticImg: 'cuttle_one_off_six.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/six.gif?raw=true',
          },
          {
            title: 'Seven',
            icon: 'delete',
            description:
              'Choose one of the top two cards from the deck and play it however you choose.',
            staticImg: 'cuttle_one_off_seven.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/seven.gif?raw=true',
          },
        ],
        [
          {
            title: 'Nine',
            icon: 'delete',
            description:
              'Return a card from your opponent’s field to their hand. They cannot play it next turn.',
            staticImg: 'cuttle_one_off_nine.png',
            animatedImg:
              'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/nine.gif?raw=true',
          },
        ],
      ],
    };
  },
  computed: {
    buttonText() {
      if (this.$store.state.auth.username) {
        return 'Find a Game';
      }
      return 'Sign Up to Play Online';
    },
  },
  methods: {
    selectRule(rowIndex, colIndex) {
      if (this.isRuleSelected(rowIndex, colIndex)) {
        this.activeRuleIndices = [];
      } else {
        this.activeRuleIndices = [rowIndex, colIndex];
      }
    },
    isRuleSelected(rowIndex, colIndex) {
      return (
        this.activeRuleIndices.length === 2 &&
        rowIndex === this.activeRuleIndices[0] &&
        colIndex === this.activeRuleIndices[1]
      );
    },
    isRoyalSelected(rowIndex, colIndex) {
      return (
        this.activeRoyalIndices.length === 2 &&
        rowIndex === this.activeRoyalIndices[0] &&
        colIndex === this.activeRoyalIndices[1]
      );
    },
    selectRoyal(rowIndex, colIndex) {
      if (this.isRoyalSelected(rowIndex, colIndex)) {
        this.activeRoyalIndices = [];
      } else {
        this.activeRoyalIndices = [rowIndex, colIndex];
      }
    },
    isOneOffSelected(rowIndex, colIndex) {
      return (
        this.activeOneOffIndices.length === 2 &&
        rowIndex === this.activeOneOffIndices[0] &&
        colIndex == this.activeOneOffIndices[1]
      );
    },
    selectOneOff(rowIndex, colIndex) {
      if (this.isOneOffSelected(rowIndex, colIndex)) {
        this.activeOneOffIndices = [];
      } else {
        this.activeOneOffIndices = [rowIndex, colIndex];
      }
    },
  },
};
</script>
<style scoped>
#logo {
  height: 20vh;
  margin: 0 auto;
}

.video-container__wrapper {
  width: 65%;
}

/* https://css-tricks.com/fluid-width-video/ */
.video-container {
  position: relative;
  padding: 0 0 56.25%;
  height: 0;
  width: 100%;
  margin: 0 auto;
}

.video-container__video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
