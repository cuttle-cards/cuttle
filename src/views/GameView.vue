<template>
  <div id="game-view-wrapper">
    <!-- Unauthenticated/Must re-log in -->
    <template v-if="$store.state.game.myPNum === null">
      <reauthenticate-dialog v-model="mustReauthenticate" />
    </template>
    <!-- Authenticated View -->
    <template v-else>
      <div id="game-menu-wrapper" class="d-flex flex-column">
        <game-menu />
        <v-icon
          v-if="$vuetify.display.xs"
          color="neutral lighten-1"
          large
          @click.stop="showHistoryDrawer = !showHistoryDrawer"
        >
          mdi-account-clock
        </v-icon>
      </div>

      <!-- Mobile History Drawer -->
      <v-navigation-drawer
        v-if="$vuetify.display.xs"
        v-model="showHistoryDrawer"
        class="c-history-drawer"
        fixed
        right
        app
      >
        <template #prepend>
          <v-list-item two-line>
            <v-list-item-content>
              <h3>History</h3>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon color="neutral" large @click.stop="showHistoryDrawer = !showHistoryDrawer">
                mdi-window-close
              </v-icon>
            </v-list-item-icon>
          </v-list-item>
        </template>

        <v-divider />

        <v-list dense>
          <v-list-item v-for="(log, index) in logs" :key="index">
            <p>
              {{ log }}
            </p>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Opponent Hand -->
      <div class="opponent-hand-container">
        <div id="opponent-hand" class="d-flex flex-column justify-start align-center px-2 pb-2 mx-auto">
          <div class="user-cards-grid-container">
            <username-tool-tip id="opponent-username-container" :username="opponentUsername" />
            <div class="opponent-cards-container">
              <div id="opponent-hand-cards" class="d-flex justify-center align-start">
                <transition name="slide-below" mode="out-in">
                  <transition-group
                    v-if="hasGlassesEight"
                    id="opponent-hand-glasses"
                    key="opponent-hand-glasses"
                    class="opponent-hand-wrapper transition-all"
                    tag="div"
                    name="slide-above"
                  >
                    <v-slide-group
                      v-if="$vuetify.display.xs"
                      key="opponent-slide-group"
                      active-class="success"
                      :show-arrows="true"
                    >
                      <v-slide-item v-for="card in opponent.hand" :key="card.id">
                        <card
                          :key="card.id"
                          :suit="card.suit"
                          :rank="card.rank"
                          :data-opponent-hand-card="`${card.rank}-${card.suit}`"
                          class="transition-all opponent-hand-card-revealed"
                        />
                      </v-slide-item>
                    </v-slide-group>
                    <card
                      v-for="card in opponent.hand"
                      v-else
                      :key="card.id"
                      :suit="card.suit"
                      :rank="card.rank"
                      :data-opponent-hand-card="`${card.rank}-${card.suit}`"
                      class="transition-all opponent-hand-card-revealed"
                    />
                  </transition-group>
                  <transition-group
                    v-else
                    key="opponent-hand"
                    tag="div"
                    name="slide-above"
                    class="opponent-hand-wrapper transition-all"
                  >
                    <card
                      v-for="(card, index) in opponent.hand"
                      :key="index"
                      data-opponent-hand-card
                      class="transition-all opponent-card-back-wrapper opponent-hand-card mx-2"
                    />
                  </transition-group>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Opponent Score -->
      <h3 id="opponent-score" class="mb-3">
        <span>POINTS: {{ opponentPointTotal }}</span>
        <score-goal-tool-tip
          :king-count="opponentKingCount"
          :points-to-win="opponentPointsToWin"
          :is-player="false"
        />
      </h3>

      <!-- Draw / Scrap Piles -->
      <div class="deck-container">
        <div id="field-left">
          <v-card
            id="deck"
            :img="require('@/img/cards/Bg_Deck.png')"
            :class="{ 'reveal-top-two': resolvingSeven }"
            @click="drawCard"
          >
            <template v-if="!resolvingSeven">
              <v-card-actions class="c-deck-count">({{ deckLength }})</v-card-actions>
              <h1 v-if="deckLength === 0" id="empty-deck-text">PASS</h1>
            </template>

            <template v-if="resolvingSeven">
              <p class="mt-2">Play from Deck</p>
              <div class="d-flex">
                <card
                  v-if="topCard"
                  :suit="topCard.suit"
                  :rank="topCard.rank"
                  :data-top-card="`${topCard.rank}-${topCard.suit}`"
                  :is-selected="topCardIsSelected"
                  class="mb-4 resolving-seven-card"
                  @click="selectTopCard"
                />
                <card
                  v-if="secondCard"
                  :suit="secondCard.suit"
                  :rank="secondCard.rank"
                  :data-second-card="`${secondCard.rank}-${secondCard.suit}`"
                  :is-selected="secondCardIsSelected"
                  class="mb-4 resolving-seven-card"
                  @click="selectSecondCard"
                />
              </div>
            </template>
          </v-card>
          <scrap-dialog :scrap="scrap">
            <template #activator>
              <div id="scrap" class="d-flex flex-column align-center">
                <h3>Scrap</h3>
                <span>({{ scrap.length }})</span>
                <v-btn outlined color="primary" class="mt-4"> View </v-btn>
              </div>
            </template>
          </scrap-dialog>
        </div>
      </div>

      <!-- Field -->
      <div class="field-container">
        <div id="field" class="d-flex justify-center align-center p-2 mx-auto">
          <div id="field-center">
            <div id="opponent-field">
              <transition-group :name="opponentPointsTransition" tag="div" class="field-points">
                <div
                  v-for="(card, index) in opponent.points"
                  :key="card.id"
                  class="field-point-container transition-all"
                >
                  <card
                    :suit="card.suit"
                    :rank="card.rank"
                    :is-valid-target="validMoves.includes(card.id)"
                    :data-opponent-point-card="`${card.rank}-${card.suit}`"
                    controlled-by="opponent"
                    :scuttled-by="card.scuttledBy"
                    @click="targetOpponentPointCard(index)"
                  />
                  <div class="jacks-container">
                    <card
                      v-for="jack in card.attachments"
                      :key="jack.id"
                      :suit="jack.suit"
                      :rank="jack.rank"
                      :is-jack="true"
                      :is-valid-target="validMoves.includes(jack.id)"
                      :data-opponent-face-card="`${jack.rank}-${jack.suit}`"
                      @click="targetOpponentFaceCard(-index - 1)"
                    />
                  </div>
                </div>
              </transition-group>
              <transition-group :name="opponentFaceCardsTransition" tag="div" class="field-effects">
                <card
                  v-for="(card, index) in opponent.faceCards"
                  :key="card.id"
                  :suit="card.suit"
                  :rank="card.rank"
                  :is-glasses="card.rank === 8"
                  :is-valid-target="validMoves.includes(card.id)"
                  :data-opponent-face-card="`${card.rank}-${card.suit}`"
                  class="transition-all"
                  @click="targetOpponentFaceCard(index)"
                />
              </transition-group>
            </div>
            <v-divider light />
            <div id="player-field" class="mb-4">
              <transition-group :name="playerPointsTransition" tag="div" class="field-points">
                <div
                  v-for="card in player.points"
                  :key="card.id"
                  class="field-point-container transition-all"
                >
                  <card
                    :suit="card.suit"
                    :rank="card.rank"
                    :jacks="card.attachments"
                    :data-player-point-card="`${card.rank}-${card.suit}`"
                    :scuttled-by="card.scuttledBy"
                    controlled-by="player"
                  />
                  <div class="jacks-container">
                    <card
                      v-for="jack in card.attachments"
                      :key="jack.id"
                      :suit="jack.suit"
                      :rank="jack.rank"
                      :is-jack="true"
                      :data-player-face-card="`${jack.rank}-${jack.suit}`"
                    />
                  </div>
                </div>
              </transition-group>
              <transition-group :name="playerFaceCardsTransition" tag="div" class="field-effects">
                <card
                  v-for="card in player.faceCards"
                  :key="card.id"
                  :suit="card.suit"
                  :rank="card.rank"
                  :is-glasses="card.rank === 8"
                  :data-player-face-card="`${card.rank}-${card.suit}`"
                  class="transition-all"
                />
              </transition-group>
            </div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div v-if="$vuetify.display.smAndUp" class="history-container">
        <div id="field-right">
          <div id="history" class="d-flex flex-column justify-start align-center elevation-10">
            <h3 class="history-title">History</h3>
            <v-divider />
            <div id="history-logs" ref="logsContainer" class="d-flex flex-column">
              <p v-for="(log, index) in logs" :key="index">
                {{ log }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 id="player-score">
        <span>POINTS: {{ playerPointTotal }}</span>
        <score-goal-tool-tip
          :king-count="playerKingCount"
          :points-to-win="playerPointsToWin"
          :is-player="true"
        />
        <span
          id="turn-indicator"
          class="text--darken-1 ml-2"
          :class="{ 'black--text': isPlayersTurn, 'white--text': !isPlayersTurn }"
        >
          {{ turnText }}
        </span>
      </h3>

      <!-- Player Hand -->
      <div class="player-hand-container">
        <div id="player-hand">
          <div
            v-if="!targeting"
            id="player-hand-cards"
            class="user-cards-grid-container"
            :class="{ 'my-turn': isPlayersTurn }"
          >
            <username-tool-tip
              v-if="$vuetify.display.smAndUp"
              id="player-username-container"
              key="player-username"
              :username="playerUsername"
              :is-player="true"
            />
            <div class="player-cards-container">
              <transition-group
                tag="div"
                name="slide-above"
                class="d-flex justify-center align-start player-cards-mobile-overrides"
                :class="{ 'my-turn': isPlayersTurn }"
              >
                <v-slide-group v-if="$vuetify.display.xs" key="slide-group" :show-arrows="true">
                  <v-slide-item v-for="(card, index) in player.hand" :key="card.id">
                    <card
                      :key="card.id"
                      :suit="card.suit"
                      :rank="card.rank"
                      :is-selected="selectedCard && card.id === selectedCard.id"
                      :is-frozen="player.frozenId === card.id"
                      class="mt-2 transition-all"
                      :is-hand-card="true"
                      :data-player-hand-card="`${card.rank}-${card.suit}`"
                      @click="selectCard(index)"
                    />
                  </v-slide-item>
                </v-slide-group>

                <card
                  v-for="(card, index) in player.hand"
                  v-else
                  :key="card.id"
                  :suit="card.suit"
                  :rank="card.rank"
                  :is-selected="selectedCard && card.id === selectedCard.id"
                  :is-frozen="player.frozenId === card.id"
                  class="mt-2 transition-all"
                  :is-hand-card="true"
                  :data-player-hand-card="`${card.rank}-${card.suit}`"
                  @click="selectCard(index)"
                />
              </transition-group>
            </div>
          </div>
          <target-selection-overlay
            v-if="targeting && (selectedCard || cardSelectedFromDeck)"
            id="player-hand-targeting"
            key="target-selection-overlay"
            :value="targeting"
            :selected-card="selectedCard || cardSelectedFromDeck"
            :is-players-turn="isPlayersTurn"
            :move-display-name="targetingMoveDisplayName"
            @cancel="clearSelection"
          />
        </div>
      </div>

      <v-snackbar
        v-model="showSnack"
        :color="snackColor"
        content-class="d-flex justify-space-between align-center"
        data-cy="game-snackbar"
      >
        {{ snackMessage }}
        <v-btn icon>
          <v-icon data-cy="close-snackbar" @click="clearSnackBar"> mdi-close </v-icon>
        </v-btn>
      </v-snackbar>
      <game-overlays
        :targeting="targeting"
        :selected-card="selectedCard"
        :card-selected-from-deck="cardSelectedFromDeck"
        @clear-selection="clearSelection"
        @face-card="playFaceCard"
        @one-off="playOneOff"
        @points="playPoints"
        @target="beginTargeting"
      />
      <game-dialogs @clear-selection="clearSelection" @handle-error="handleError" />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Card from '@/components/GameView/Card.vue';
import GameDialogs from '@/components/GameView/GameDialogs.vue';
import GameMenu from '@/components/GameView/GameMenu.vue';
import GameOverlays from '@/components/GameView/GameOverlays.vue';
import ScoreGoalToolTip from '@/components/GameView/ScoreGoalToolTip.vue';
import ReauthenticateDialog from '@/components/GameView/ReauthenticateDialog.vue';
import TargetSelectionOverlay from '@/components/GameView/TargetSelectionOverlay.vue';
import ScrapDialog from '@/components/GameView/ScrapDialog.vue';
import UsernameToolTip from '@/components/GameView/UsernameToolTip.vue';

export default {
  name: 'GameView',
  components: {
    Card,
    GameDialogs,
    GameMenu,
    GameOverlays,
    ScoreGoalToolTip,
    ReauthenticateDialog,
    TargetSelectionOverlay,
    ScrapDialog,
    UsernameToolTip,
  },
  data() {
    return {
      showSnack: false,
      snackMessage: '',
      snackColor: 'error',
      selectionIndex: null, // when select a card set this value
      targeting: false,
      targetingMoveName: null,
      targetingMoveDisplayName: null,
      targetType: null,
      nineTargetIndex: null,
      showFourDialog: false,
      topCardIsSelected: false,
      secondCardIsSelected: false,
      showHistoryDrawer: false,
    };
  },
  computed: {
    ...mapState({
      waitingForOpponentToPlayFromDeck: ({ game }) => game.waitingForOpponentToPlayFromDeck,
    }),
    ...mapGetters([
      'isPlayersTurn',
      'player',
      'playerPointTotal',
      'playerQueenCount',
      'playerUsername',
      'opponent',
      'opponentPointTotal',
      'opponentQueenCount',
      'opponentUsername',
      'resolvingSeven',
      'hasGlassesEight',
    ]),
    //////////
    // Auth //
    //////////
    mustReauthenticate: {
      get() {
        return this.$store.state.auth.mustReauthenticate;
      },
      set(val) {
        this.$store.commit('setMustReauthenticate', val);
      },
    },
    ////////////////////
    // Responsiveness //
    ////////////////////
    deckLogoWidth() {
      switch (this.$vuetify.display.name) {
        case 'xs':
          return 50;
        case 'sm':
          return 70;
        case 'md':
        case 'lg':
        case 'xl':
        default:
          return 140;
      }
    },
    ///////////////////////////////
    // Game, Deck, Log and Scrap //
    ///////////////////////////////
    game() {
      return this.$store.state.game;
    },
    deck() {
      return this.game.deck;
    },
    scrap() {
      return this.game.scrap;
    },
    logs() {
      return this.game.log;
    },
    deckLength() {
      let res = this.deck.length;
      if (this.game.topCard) res++;
      if (this.game.secondCard) res++;
      return res;
    },
    /////////////////
    // King Counts //
    /////////////////
    playerKingCount() {
      return this.kingCount(this.player);
    },
    opponentKingCount() {
      return this.kingCount(this.opponent);
    },
    ///////////////////
    // Points to Win //
    ///////////////////
    playerPointsToWin() {
      return this.pointsToWin(this.playerKingCount);
    },
    opponentPointsToWin() {
      return this.pointsToWin(this.opponentKingCount);
    },
    ///////////////
    // Game Over //
    ///////////////
    // Handled in GameDialogs.vue
    //
    //////////
    // Twos //
    //////////
    // Handled in GameDialogs.vue
    //
    ///////////////////////////
    // Transition Directions //
    ///////////////////////////
    playerPointsTransition() {
      switch (this.game.lastEventChange) {
        case 'resolve':
          // Different one-offs cause points to move in different directions
          switch (this.game.lastEventOneOffRank) {
            // Twos and Sixes swap control of points between players
            case 2:
            case 6:
              return 'slide-above';
            // For nines, transition direction depends on target type
            case 9:
              switch (this.game.lastEventTargetType) {
                // Nine on jack causes points to swap control
                case 'jack':
                  return 'slide-above';
                // Everything else expect cards to move back to hand
                case 'point':
                case 'faceCard':
                default:
                  return 'slide-below';
              }
            default:
              return 'in-below-out-left';
          }
        case 'jack':
        case 'sevenJack':
          return 'slide-above';
        default:
          return 'in-below-out-left';
      }
    },
    playerFaceCardsTransition() {
      // If a face card is bounced by a nine, slide down to player hand
      if (
        this.game.lastEventChange === 'resolve' &&
        this.game.lastEventOneOffRank === 9 &&
        this.game.lastEventTargetType === 'faceCard'
      ) {
        return 'slide-below';
      }
      // Defaults in below (from hand) out left (to scrap)
      return 'in-below-out-left';
    },
    opponentPointsTransition() {
      switch (this.game.lastEventChange) {
        // Jacks cause point cards to switch control (from/towards player)
        case 'jack':
        case 'sevenJack':
          return 'slide-below';
        case 'resolve':
          // Different one-offs cause different direction transitions
          switch (this.game.lastEventOneOffRank) {
            // Twos and sixes caus point cards to switch control (from/towards player)
            case 2:
            case 6:
              return 'slide-below';
            // Nine transitions depend on the target type
            case 9:
              switch (this.game.lastEventTargetType) {
                // Nine on a jack switches point card control
                case 'jack':
                  return 'slide-below';
                // Everything else returns cards to hand
                default:
                  return 'slide-above';
              }
            default:
              return 'in-above-out-below';
          }
        // Defaults to in above (opponent's hand) out below (to scrap)
        default:
          return 'in-above-out-below';
      }
    },
    opponentFaceCardsTransition() {
      // If a face card is bounced by a nine, slide up to opponent's hand
      if (
        this.game.lastEventChange === 'resolve' &&
        this.game.lastEventOneOffRank === 9 &&
        this.game.lastEventTargetType === 'faceCard'
      ) {
        return 'slide-above';
      }
      // Otherwise in from opponent hand, out towards scrap
      return 'in-above-out-below';
    },
    //////////////////
    // Interactions //
    //////////////////
    selectedCard() {
      return this.selectionIndex !== null ? this.player.hand[this.selectionIndex] : null;
    },
    turnText() {
      return this.isPlayersTurn ? 'YOUR TURN' : "OPPONENT'S TURN";
    },
    validScuttleIds() {
      const selectedCard = this.resolvingSeven ? this.cardSelectedFromDeck : this.selectedCard;
      if (!selectedCard) return [];
      return this.opponent.points
        .filter((potentialTarget) => {
          return (
            selectedCard.rank > potentialTarget.rank ||
            (selectedCard.rank === potentialTarget.rank && selectedCard.suit > potentialTarget.suit)
          );
        })
        .map((validTarget) => validTarget.id);
    },
    validFaceCardTargetIds() {
      switch (this.opponentQueenCount) {
        case 0:
          const opponentFaceCardIds = this.opponent.faceCards.map((card) => card.id);
          const opponentJackIds = [];
          this.opponent.points.forEach((card) => {
            if (card.attachments.length > 0) {
              opponentJackIds.push(card.attachments[card.attachments.length - 1].id);
            }
          });
          return [...opponentFaceCardIds, ...opponentJackIds];
        case 1:
          return [this.opponent.faceCards.find((card) => card.rank === 12).id];
        default:
          return [];
      }
    },
    validMoves() {
      if (!this.isPlayersTurn) return [];
      const selectedCard = this.resolvingSeven ? this.cardSelectedFromDeck : this.selectedCard;
      if (!selectedCard) return [];
      switch (this.targetingMoveName) {
        case 'scuttle':
          return this.validScuttleIds;
        case 'jack':
          return this.opponent.points.map((validTarget) => validTarget.id);
        case 'targetedOneOff':
          // Twos and nines can target face cards
          let res = [...this.validFaceCardTargetIds];
          // Nines can additionally target points if opponent has no queens
          if (selectedCard.rank === 9 && this.opponentQueenCount === 0) {
            res = [...res, ...this.opponent.points.map((validTarget) => validTarget.id)];
          }
          return res;
        default:
          return [];
      }
    },
    nineTarget() {
      switch (this.targetType) {
        case 'point':
          return this.nineTargetIndex !== null ? this.opponent.points[this.nineTargetIndex] : null;
        case 'faceCard':
          return this.nineTargetIndex !== null ? this.opponent.faceCards[this.nineTargetIndex] : null;
        default:
          return null;
      }
    },
    // Sevens
    playingFromDeck() {
      return this.game.playingFromDeck;
    },
    topCard() {
      return this.game.topCard;
    },
    secondCard() {
      return this.game.secondCard;
    },
    cardSelectedFromDeck() {
      if (this.topCardIsSelected) return this.topCard;
      if (this.secondCardIsSelected) return this.secondCard;
      return null;
    },
  },
  watch: {
    logs: function () {
      this.$nextTick(function () {
        this.scrollToLastLog();
      });
    },
  },
  mounted() {
    if (!this.$store.state.auth.authenticated) {
      this.$store.commit('setMustReauthenticate', true);
    }
    document.documentElement.style.setProperty('--browserHeight', `${window.innerHeight / 100}px`);
    window.addEventListener('resize', () => {
      // We execute the same script as before
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--browserHeight', `${vh}px`);
    });
    this.scrollToLastLog();
  },
  methods: {
    clearSnackBar() {
      this.snackMessage = '';
      this.showSnack = false;
    },
    handleError(err) {
      this.snackMessage = err;
      this.snackColor = 'error';
      this.showSnack = true;
      this.clearSelection();
    },
    clearOverlays() {
      this.nineTargetIndex = null;
      this.targetType = null;
      this.targeting = false;
    },
    clearSelection() {
      this.selectionIndex = null;
      this.secondCardIsSelected = false;
      this.topCardIsSelected = false;
      this.targetingMoveName = null;
      this.targetingMoveDisplayName = null;
      this.clearOverlays();
    },
    selectCard(index) {
      if (index === this.selectionIndex) {
        this.clearSelection();
      } else {
        this.selectionIndex = index;
      }
    },
    selectTopCard() {
      if (!this.waitingForOpponentToPlayFromDeck) {
        this.secondCardIsSelected = false;
        this.topCardIsSelected = !this.topCardIsSelected;
      }
    },
    selectSecondCard() {
      if (!this.waitingForOpponentToPlayFromDeck) {
        this.topCardIsSelected = false;
        this.secondCardIsSelected = !this.secondCardIsSelected;
      }
    },
    /**
     * Sets page data to configuring targeting for scuttle or one-off
     * @param move
     * 	{
     *		displayName: String e.g. 'One-Off',
     *		eventName: String e.g. 'oneOff',
     *		moveDescription: String,
     *		disabled: Boolean,
     *		disabledExplanation: Boolean,
     *	}
     */
    beginTargeting(move) {
      this.targeting = true;
      this.targetingMoveName = move.eventName;
      // Change targeting display name for Jack (instead of 'Royal')
      this.targetingMoveDisplayName = move.eventName === 'jack' ? 'Jack' : move.displayName;
    },
    /**
     * @returns number of kings a given player has
     * @param player is the player object
     */
    kingCount(player) {
      return player.faceCards.reduce((kingCount, card) => kingCount + (card.rank === 13 ? 1 : 0), 0);
    },
    /**
     * Returns the number of points to win
     * based on the number of kings a player has
     * @param kingCount: int number of kings (expected 0-4)
     */
    pointsToWin(kingCount) {
      switch (kingCount) {
        case 0:
          return 21;
        case 1:
          return 14;
        case 2:
          return 10;
        case 3:
          return 5;
        case 4:
          return 0;
        default:
          return 21;
      }
    },
    //////////////////
    // Player Moves //
    //////////////////
    drawCard() {
      if (!this.resolvingSeven) {
        if (this.deckLength > 0) {
          this.$store
            .dispatch('requestDrawCard')
            .then(this.clearSelection)
            .catch((err) => {
              this.snackMessage = err;
              this.snackColor = 'error';
              this.showSnack = true;
              this.clearSelection();
            });
        } else {
          this.$store
            .dispatch('requestPass')
            .then(this.clearSelection)
            .catch((err) => {
              this.snackMessage = err;
              this.snackColor = 'error';
              this.showSnack = true;
              this.clearSelection();
            });
        }
      }
    },
    playPoints() {
      this.clearOverlays();
      if (this.resolvingSeven) {
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.$store
          .dispatch('requestPlayPointsSeven', {
            cardId: this.cardSelectedFromDeck.id,
            index: deckIndex,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      } else {
        this.$store
          .dispatch('requestPlayPoints', this.selectedCard.id)
          .then(this.clearSelection)
          .catch(this.handleError);
      }
    },
    playFaceCard() {
      this.clearOverlays();
      if (this.resolvingSeven) {
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.$store
          .dispatch('requestPlayFaceCardSeven', {
            cardId: this.cardSelectedFromDeck.id,
            index: deckIndex,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      } else {
        this.$store
          .dispatch('requestPlayFaceCard', this.selectedCard.id)
          .then(this.clearSelection)
          .catch(this.handleError);
      }
    },
    scuttle(targetIndex) {
      if (this.resolvingSeven) {
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.$store
          .dispatch('requestScuttleSeven', {
            cardId: this.cardSelectedFromDeck.id,
            targetId: this.opponent.points[targetIndex].id,
            index: deckIndex,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      } else {
        this.$store
          .dispatch('requestScuttle', {
            cardId: this.selectedCard.id,
            targetId: this.opponent.points[targetIndex].id,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      }
    },
    playTargetedOneOff(targetIndex, targetType) {
      let target;
      let jackedPointId;
      switch (targetType) {
        case 'faceCard':
          target = this.opponent.faceCards[targetIndex];
          break;
        case 'point':
          target = this.opponent.points[targetIndex];
          break;
        case 'jack':
          if (targetIndex < 0) {
            // targeting the last jack attached to a point card
            const targetJacks = this.opponent.points[-targetIndex - 1].attachments;
            target = targetJacks[targetJacks.length - 1];
            jackedPointId = this.opponent.points[-targetIndex - 1].id;
          }
          break;
      }
      if (this.resolvingSeven) {
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.$store
          .dispatch('requestPlayTargetedOneOffSeven', {
            cardId: this.cardSelectedFromDeck.id,
            targetId: target.id,
            pointId: jackedPointId,
            targetType,
            index: deckIndex,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      } else {
        this.$store
          .dispatch('requestPlayTargetedOneOff', {
            cardId: this.selectedCard.id,
            targetId: target.id,
            pointId: jackedPointId,
            targetType,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      }
    },
    playJack(targetIndex) {
      const target = this.opponent.points[targetIndex];
      if (this.resolvingSeven) {
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.$store
          .dispatch('requestPlayJackSeven', {
            cardId: this.cardSelectedFromDeck.id,
            index: deckIndex,
            targetId: target.id,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      } else {
        this.$store
          .dispatch('requestPlayJack', {
            cardId: this.selectedCard.id,
            targetId: target.id,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      }
    },
    targetOpponentPointCard(targetIndex) {
      if (!this.selectedCard && !this.topCardIsSelected && !this.secondCardIsSelected) return;
      let cardRank;
      if (this.resolvingSeven) {
        if (!this.cardSelectedFromDeck) return;
        cardRank = this.cardSelectedFromDeck.rank;
      } else {
        if (!this.selectedCard) return;
        cardRank = this.selectedCard.rank;
      }
      switch (cardRank) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 10:
          this.scuttle(targetIndex);
          return;
        case 11:
          this.playJack(targetIndex);
          return;
        case 9:
          if (this.targetingMoveName === 'targetedOneOff') {
            this.playTargetedOneOff(targetIndex, 'point');
          } else {
            this.scuttle(targetIndex);
          }
          return;
        default:
          return;
      }
    },
    targetOpponentFaceCard(targetIndex) {
      let cardToPlay = null;
      if (this.resolvingSeven) {
        if (!this.cardSelectedFromDeck) return;
        cardToPlay = this.cardSelectedFromDeck;
      } else {
        if (!this.selectedCard) return;
        cardToPlay = this.selectedCard;
      }

      const targetType = targetIndex < 0 ? 'jack' : 'faceCard';
      switch (cardToPlay.rank) {
        case 2:
        case 9:
          this.playTargetedOneOff(targetIndex, targetType);
          return;
      }
    },
    playOneOff() {
      if (this.resolvingSeven) {
        if (!this.cardSelectedFromDeck) return;

        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.$store
          .dispatch('requestPlayOneOffSeven', {
            cardId: this.cardSelectedFromDeck.id,
            index: deckIndex,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      }
      if (!this.selectedCard) return;

      this.$store
        .dispatch('requestPlayOneOff', this.selectedCard.id)
        .then(this.clearSelection)
        .catch(this.handleError);
    },
    scrollToLastLog() {
      if (this.$refs.logsContainer) {
        this.$refs.logsContainer.scrollTop = this.$refs.logsContainer.scrollHeight;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/////////////////
// Transitions //
/////////////////
.transition-all {
  transition: all 1s;
}
// All list transitions leave with position absolute
.slide-below-leave-active,
.slide-above-leave-active,
.in-below-out-left-leave-active {
  position: absolute;
}
// slide-below (enter and leave below)
.slide-below-enter,
.slide-below-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
// slide-above (enter and leave above)
.slide-above-enter,
.slide-above-leave-to {
  opacity: 0;
  transform: translateY(-32px);
}
// in-below-out-left (enter from below, exit to left)
.in-below-out-left-enter {
  opacity: 0;
  transform: translateY(32px);
}
.in-below-out-left-leave-to {
  opacity: 0;
  transform: translateX(-32px);
}
// in-above-out-below (enter from above, exit below)
.in-above-out-below-enter {
  opacity: 0;
  transform: translateY(-32px);
}
.in-above-out-below-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
// in-below-out-above (enter from below, exit above)
.in-below-out-above-enter {
  opacity: 0;
  transform: translateY(32px);
}
.in-below-out-above-leave-to {
  opacity: 0;
  transform: translateY(-32px);
}
////////////
// Styles //
////////////
#game-view-wrapper {
  color: #fff;
  width: 100vw;
  height: 100%;
  background-image: url('~@/img/game_images/board_background.svg');
  background-size: cover;
  background-position: center;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: 15vh 5vh 55vh 5vh 20vh;
  grid-template-areas:
    'opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand'
    'decks decks opp-score opp-score opp-score opp-score history history'
    'decks decks field field field field history history'
    'player-score player-score player-score player-score player-score player-score player-score player-score'
    'player-hand player-hand player-hand player-hand player-hand player-hand player-hand player-hand';
}

#game-menu-wrapper {
  position: absolute;
  display: inline-block;
  right: 0;
  margin: 10px;
  z-index: 3;
}

.valid-move {
  cursor: pointer;
}

.opponent-hand-container {
  grid-area: opp-hand;
}

#opponent-hand {
  min-width: 50%;
  & #opponent-hand-cards {
    height: 100%;
    background: rgba(0, 0, 0, 0.46);

    & #opponent-hand-glasses {
      .opponent-hand-card-revealed {
        transform: scale(0.8);
      }
    }
    & .opponent-hand-wrapper {
      display: flex;
      justify-content: center;
      position: relative;
      height: 100%;
      width: 100%;
      transform: rotate(180deg);

      & .opponent-card-back-wrapper {
        height: 90%;
        width: 7vw;
        display: inline-block;
        position: relative;
        & .opponent-card-back {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
}

#opponent-score {
  grid-area: opp-score;
  text-align: center;
  z-index: 1;
}

.field-container {
  grid-area: field;
}

#field {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

.deck-container {
  grid-area: decks;
}

#field-left {
  & #deck {
    cursor: pointer;
    position: relative;
    &.reveal-top-two {
      height: auto;
      align-self: start;
      & .resolving-seven-card {
        width: 9.5rem;
      }
    }
    & #empty-deck-text {
      background-color: rgba(0, 0, 0, 0.8);
      padding-top: 50%;
      width: 100%;
      height: 100%;
      text-align: center;
      color: white;
      position: absolute;
    }
    .c-deck-count {
      margin: 8px;
      padding: 4px;
      position: absolute;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
    }
  }
  & #deck,
  & #scrap {
    background-image: url('~@/img/game_images/Bg_Scrap.png');
    background-size: cover;
    position: relative;
    margin: 10px;
    height: 29vh;
    width: calc(29vh / 1.3);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 0.3 ease-in-out;

    &.reveal-top-two {
      width: calc(29vh * 1.5);
      max-width: 300px;
      z-index: 1;
    }
  }
}
#field-center {
  width: 100%;
  height: 100%;
}

.history-container {
  grid-area: history;
}

#field-right {
  height: 100%;
  padding-top: 0.5rem;

  #history,
  #card-preview {
    margin: 0 auto;
    padding: 0.5rem;
    width: 80%;
    max-width: 80%;
    height: 100%;
    border-radius: 20px;
  }
  #history {
    background-color: rgba(241, 200, 160, 0.65);
    color: #111111;
    & #history-logs {
      overflow: auto;
      overflow-wrap: anywhere;
      height: 85%;
      font-size: 0.75em;
      letter-spacing: 0.25px;
      font-family: 'Libre Baskerville', Century Gothic, CenturyGothic, AppleGothic, sans-serif;
    }
  }
}

.history-title {
  font-size: 1.25em;
  font-weight: 700;
  font-family: 'Cormorant Infant', Century Gothic, CenturyGothic, AppleGothic, sans-serif;
}

@media screen and (min-width: 1024px) {
  #field-right {
    height: 100%;

    #history,
    #card-preview {
      height: 90%;
      width: 75%;
      margin-right: 3rem;
      margin-top: 2rem;
      padding: 1rem;
    }
    #history {
      & #history-logs {
        height: 85%;
        width: 100%;
        margin: 0 auto;
        overflow: auto;
        font-size: 1em;
        padding: 0 1.25rem;
      }
    }
  }
  .history-title {
    font-size: 48px;
  }
}

#field-left,
#field-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
#opponent-field,
#player-field {
  position: relative;
  width: 100%;
  height: 29vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 4px solid transparent;
  border-radius: 4px;
}
.field-points {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 50%;

  .field-point-container {
    display: flex;
    flex-direction: row;
    max-height: 20vh;
    width: calc(20vh / 1.75);
    margin: 3px;
    position: relative;

    .jacks-container {
      position: absolute;
      right: -5%;
      top: 0;
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
  }
}
.field-effects {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 50%;
}

#player-score {
  grid-area: player-score;
  text-align: center;
}

.player-hand-container {
  grid-area: player-hand;
}

#player-hand {
  min-width: 50%;
  height: 100%;
  & #player-hand-cards,
  #player-hand-targeting::v-deep {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.46);
    overflow-y: hidden;
    border-radius: 4px;
    transition: all 1s;
    &.my-turn {
      border: 4px solid var(--v-accent-base);
      box-shadow: 0 15px 16px -12px rgba(0, 123, 59, 0.8), 0 24px 38px 12px rgba(0, 123, 59, 0.8),
        0 10px 50px 16px rgba(33, 150, 83, 0.8) !important;
      background: linear-gradient(0deg, rgba(253, 98, 34, 1), rgba(255, 255, 255, 0.3));
    }
    &:not(.my-turn) {
      border: 4px solid transparent;
    }
  }
}

.user-cards-grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  position: relative;
  width: 100%;
}
#player-username-container {
  grid-column-end: span 2;
  align-self: end;
  margin-bottom: 15%;

  &:hover {
    z-index: 1;
  }
}

.player-cards-container {
  grid-column-start: 3;
  grid-column-end: span 8;
}

#opponent-username-container {
  grid-column-end: span 2;

  &:hover {
    z-index: 1;
  }
}
.opponent-cards-container {
  grid-column-start: 3;
  grid-column-end: span 8;
  position: absolute;
  width: 100%;
  height: 100%;
}

/* This function is used to make sure the game's height stays within the viewport */
/* between the url/status bars on mobile devices */
@function bh($quantity) {
  @return calc(var(--browserHeight, 1vh) * #{$quantity});
}

/* Mobile styling overrides */
@media (max-width: 600px) {
  #game-view-wrapper {
    grid-template-rows: bh(7) bh(5) bh(50) bh(20) bh(5) bh(13);
    grid-template-areas:
      'opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand'
      'opp-score opp-score opp-score opp-score opp-score opp-score opp-score opp-score'
      'field field field field field field field field'
      'decks decks decks decks decks decks decks decks'
      'player-score player-score player-score player-score player-score player-score player-score player-score'
      'player-hand player-hand player-hand player-hand player-hand player-hand player-hand player-hand';
  }

  .field-points {
    .field-point-container {
      width: auto;
    }
  }

  #field-left {
    flex-direction: row;
    & #deck,
    & #scrap {
      height: 13vh;
      width: calc(13vh / 1.3);
    }
  }
  #opponent-hand {
    & #opponent-hand-cards {
      height: 80%;
      & #opponent-hand-glasses {
        margin-top: 0;
      }
    }
  }
  .player-cards-container {
    grid-column-start: 1;
    grid-column-end: span 12;
  }
}
</style>
