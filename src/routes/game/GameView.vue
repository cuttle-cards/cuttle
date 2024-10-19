<template>
  <div id="game-view-wrapper">
    <!-- Unauthenticated/Must re-log in/ Unavailable game -->
    <template v-if="gameStore.myPNum === null">
      <GameUnavailableView />
    </template>

    <!-- Authenticated View -->
    <template v-else>
      <div id="game-menu-wrapper" class="d-flex flex-column flex-sm-row align-center" :style="menuWrapperStyle">
        <SpectatorListMenu :spectating-users="spectatingUsers" :vuetify-display="$vuetify" />
        <GameMenu :is-spectating="isSpectating" />
        <v-icon
          v-if="$vuetify.display.xs"
          color="white"
          icon="mdi-account-clock"
          size="large"
          aria-label="Show game history"
          aria-hidden="false"
          role="button"
          @click.stop="showHistoryDrawer = !showHistoryDrawer"
        />
      </div>

      <!-- Mobile History Drawer -->
      <v-navigation-drawer
        v-if="$vuetify.display.xs"
        v-model="showHistoryDrawer"
        class="c-history-drawer"
        location="right"
      >
        <template #prepend>
          <v-list-item>
            <h3>{{ t('game.history.title') }}</h3>
            <template #append>
              <v-btn icon variant="text" @click.stop="showHistoryDrawer = !showHistoryDrawer">
                <v-icon
                  color="neutral"
                  icon="mdi-window-close"
                  size="large"
                  aria-label="window close icon"
                  aria-hidden="false"
                  role="img"
                />
              </v-btn>
            </template>
          </v-list-item>
        </template>

        <v-divider />

        <v-list density="compact">
          <v-list-item v-for="(log, index) in logs" :key="index" class="my-2">
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
            <UsernameToolTip id="opponent-username-container" :username="gameStore.opponentUsername" />
            <div class="opponent-cards-container">
              <div id="opponent-hand-cards" class="d-flex justify-center align-start">
                <Transition name="slide-below" mode="out-in">
                  <TransitionGroup
                    v-if="showOpponentHand"
                    id="opponent-hand-glasses"
                    key="opponent-hand-glasses"
                    class="opponent-hand-wrapper transition-all"
                    tag="div"
                    name="slide-above"
                  >
                    <v-slide-group
                      v-if="$vuetify.display.xs"
                      key="opponent-slide-group"
                      selected-class="success"
                      :show-arrows="true"
                    >
                      <v-slide-group-item v-for="card in gameStore.opponent.hand" :key="card.id">
                        <GameCard
                          :key="card.id"
                          :suit="card.suit"
                          :rank="card.rank"
                          :data-opponent-hand-card="`${card.rank}-${card.suit}`"
                          class="transition-all opponent-hand-card-revealed"
                        />
                      </v-slide-group-item>
                    </v-slide-group>
                    <GameCard
                      v-for="card in gameStore.opponent.hand"
                      v-else
                      :key="card.id"
                      :suit="card.suit"
                      :rank="card.rank"
                      :data-opponent-hand-card="`${card.rank}-${card.suit}`"
                      class="transition-all opponent-hand-card-revealed"
                    />
                  </TransitionGroup>
                  <TransitionGroup
                    v-else
                    key="opponent-hand"
                    tag="div"
                    name="slide-above"
                    class="opponent-hand-wrapper transition-all"
                  >
                    <GameCard
                      v-for="(card) in gameStore.opponent.hand"
                      :key="card.id"
                      :suit="isBeingDiscarded(card) ? card.suit : undefined"
                      :rank="isBeingDiscarded(card) ? card.rank : undefined"
                      data-opponent-hand-card
                      class="transition-all opponent-card-back-wrapper opponent-hand-card mx-2"
                    />
                  </TransitionGroup>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Opponent Score -->
      <h3 id="opponent-score" class="mb-3">
        <span>{{ t('game.score.points') }}: {{ gameStore.opponentPointTotal }}</span>
        <ScoreGoalToolTip
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
            :class="{ 'reveal-top-two': gameStore.resolvingSeven }"
            elevation="0"
            @click="drawCard"
          >
            <template v-if="!gameStore.resolvingSeven">
              <v-card-actions class="c-deck-count">
                ({{ deckLength }})
              </v-card-actions>
              <h1 v-if="deckLength === 0" id="empty-deck-text">
                {{ t('game.pass') }}
              </h1>
            </template>

            <template v-if="gameStore.resolvingSeven">
              <p class="mt-2">
                {{ t('game.playFromDeck') }}
              </p>
              <div class="d-flex">
                <GameCard
                  v-if="topCard"
                  :suit="topCard.suit"
                  :rank="topCard.rank"
                  :data-top-card="`${topCard.rank}-${topCard.suit}`"
                  :is-selected="topCardIsSelected"
                  class="mb-4 resolving-seven-card"
                  @click="selectTopCard"
                />
                <GameCard
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
          <ScrapDialog :scrap="scrap">
            <template #activator>
              <div id="scrap" class="d-flex flex-column align-center">
                <Transition :name="threesTransition">
                  <GameCard
                    v-if="showScrapChoice"
                    :suit="gameStore.lastEventCardChosen.suit"
                    :rank="gameStore.lastEventCardChosen.rank"
                    class="gameCard"
                    data-cy="scrap-chosen-card"
                  />
                  <div v-else class="d-flex flex-column align-center scrapPile">
                    <h3>{{ $t('game.scrap') }}</h3>
                    <span>({{ scrap.length }})</span>
                    <v-btn variant="outlined" color="primary" class="mt-4">
                      {{ $t('game.view') }}
                    </v-btn>
                  </div>
                </Transition>
              </div>
            </template>
          </ScrapDialog>
        </div>
      </div>

      <!-- Field -->
      <div class="field-container">
        <div id="field" class="d-flex justify-center align-center p-2 mx-auto">
          <div id="field-center">
            <div id="opponent-field">
              <TransitionGroup :name="opponentPointsTransition" tag="div" class="field-points">
                <div
                  v-for="(card, index) in gameStore.opponent.points"
                  :key="card.id"
                  class="field-point-container transition-all"
                >
                  <GameCard
                    :suit="card.suit"
                    :rank="card.rank"
                    :is-valid-target="validMoves.includes(card.id)"
                    :data-opponent-point-card="`${card.rank}-${card.suit}`"
                    controlled-by="opponent"
                    :scuttled-by="card.scuttledBy"
                    @click="targetOpponentPointCard(index)"
                  />
                  <div class="jacks-container">
                    <GameCard
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
              </TransitionGroup>
              <TransitionGroup :name="opponentFaceCardsTransition" tag="div" class="field-effects">
                <GameCard
                  v-for="(card, index) in gameStore.opponent.faceCards"
                  :key="card.id"
                  :suit="card.suit"
                  :rank="card.rank"
                  :is-glasses="card.rank === 8"
                  :is-valid-target="validMoves.includes(card.id)"
                  :data-opponent-face-card="`${card.rank}-${card.suit}`"
                  class="transition-all"
                  @click="targetOpponentFaceCard(index)"
                />
              </TransitionGroup>
            </div>
            <v-divider light />
            <div id="player-field" class="mb-4">
              <TransitionGroup :name="playerPointsTransition" tag="div" class="field-points">
                <div
                  v-for="card in gameStore.player.points"
                  :key="card.id"
                  class="field-point-container transition-all"
                >
                  <GameCard
                    :suit="card.suit"
                    :rank="card.rank"
                    :jacks="card.attachments"
                    :data-player-point-card="`${card.rank}-${card.suit}`"
                    :scuttled-by="card.scuttledBy"
                    controlled-by="player"
                  />
                  <div class="jacks-container">
                    <GameCard
                      v-for="jack in card.attachments"
                      :key="jack.id"
                      :suit="jack.suit"
                      :rank="jack.rank"
                      :is-jack="true"
                      :data-player-face-card="`${jack.rank}-${jack.suit}`"
                    />
                  </div>
                </div>
              </TransitionGroup>
              <TransitionGroup :name="playerFaceCardsTransition" tag="div" class="field-effects">
                <GameCard
                  v-for="card in gameStore.player.faceCards"
                  :key="card.id"
                  :suit="card.suit"
                  :rank="card.rank"
                  :is-glasses="card.rank === 8"
                  :data-player-face-card="`${card.rank}-${card.suit}`"
                  class="transition-all"
                />
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div v-if="$vuetify.display.smAndUp" class="history-container">
        <div id="field-right">
          <div id="history" class="d-flex flex-column justify-start align-center elevation-10">
            <h3 class="history-title">
              {{ $t('game.history.title') }}
            </h3>
            <v-divider />
            <div id="history-logs" ref="logsContainer" class="d-flex flex-column">
              <p v-for="(log, index) in logs" :key="index" class="my-2">
                {{ log }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 id="player-score">
        <span>{{ t('game.score.points') }}: {{ gameStore.playerPointTotal }}</span>
        <ScoreGoalToolTip
          :king-count="playerKingCount"
          :points-to-win="playerPointsToWin"
          :is-player="true"
        />
        <span
          id="turn-indicator"
          class="ml-2"
          :class="{ 'text-black': gameStore.isPlayersTurn, 'text-white': !gameStore.isPlayersTurn }"
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
            :class="{ 'my-turn': gameStore.isPlayersTurn }"
          >
            <UsernameToolTip
              v-if="$vuetify.display.smAndUp"
              id="player-username-container"
              key="player-username"
              :username="gameStore.playerUsername"
              :is-player="true"
            />
            <div class="player-cards-container">
              <TransitionGroup
                tag="div"
                name="slide-above"
                class="d-flex justify-center align-start player-cards-mobile-overrides"
                :class="{ 'my-turn': gameStore.isPlayersTurn }"
              >
                <v-slide-group v-if="$vuetify.display.xs" key="slide-group" :show-arrows="true">
                  <v-slide-group-item v-for="(card, index) in gameStore.player.hand" :key="card.id">
                    <GameCard
                      :key="card.id"
                      :suit="card.suit"
                      :rank="card.rank"
                      :is-selected="selectedCard && card.id === selectedCard.id"
                      :is-frozen="gameStore.player.frozenId === card.id || card.isFrozen"
                      class="mt-2 transition-all"
                      :is-hand-card="true"
                      :data-player-hand-card="`${card.rank}-${card.suit}`"
                      @click="selectCard(index)"
                    />
                  </v-slide-group-item>
                </v-slide-group>

                <GameCard
                  v-for="(card, index) in gameStore.player.hand"
                  v-else
                  :key="card.id"
                  :suit="card.suit"
                  :rank="card.rank"
                  :is-selected="selectedCard && card.id === selectedCard.id"
                  :is-frozen="gameStore.player.frozenId === card.id || card.isFrozen"
                  class="mt-2 transition-all"
                  :is-hand-card="true"
                  :data-player-hand-card="`${card.rank}-${card.suit}`"
                  @click="selectCard(index)"
                />
              </TransitionGroup>
            </div>
          </div>
          <TargetSelectionOverlay
            v-if="targeting && (selectedCard || cardSelectedFromDeck)"
            id="player-hand-targeting"
            key="target-selection-overlay"
            :selected-card="selectedCard || cardSelectedFromDeck"
            :is-players-turn="gameStore.isPlayersTurn"
            :move-display-name="targetingMoveDisplayName"
            @cancel="clearSelection"
          />
        </div>
      </div>

      <BaseSnackbar
        v-model="showSnackbar"
        :message="snackBarMessage"
        :color="snackBarColor"
        data-cy="game-snackbar"
        @clear="clearSnackBar"
      />
      <GameOverlays
        :targeting="targeting"
        :selected-card="selectedCard"
        :card-selected-from-deck="cardSelectedFromDeck"
        @clear-selection="clearSelection"
        @face-card="playFaceCard"
        @one-off="playOneOff"
        @points="playPoints"
        @target="beginTargeting"
      />
      <GameDialogs @clear-selection="clearSelection" @handle-error="handleError" />
    </template>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import BaseSnackbar from '@/components/BaseSnackbar.vue';
import UsernameToolTip from '@/routes/game/components/UsernameToolTip.vue';
import GameCard from '@/routes/game/components/GameCard.vue';
import GameDialogs from '@/routes/game/components/dialogs/GameDialogs.vue';
import GameMenu from '@/routes/game/components/GameMenu.vue';
import GameOverlays from '@/routes/game/components/GameOverlays.vue';
import ScoreGoalToolTip from '@/routes/game/components/ScoreGoalToolTip.vue';
import GameUnavailableView from '@/routes/game/components/GameUnavailableView.vue';
import TargetSelectionOverlay from '@/routes/game/components/TargetSelectionOverlay.vue';
import ScrapDialog from '@/routes/game/components/dialogs/components/ScrapDialog.vue';
import SpectatorListMenu from '@/routes/game/components/SpectatorListMenu.vue';

export default {
  name: 'GameView',
  components: {
    GameCard,
    GameDialogs,
    GameMenu,
    GameOverlays,
    ScoreGoalToolTip,
    GameUnavailableView,
    TargetSelectionOverlay,
    ScrapDialog,
    UsernameToolTip,
    BaseSnackbar,
    SpectatorListMenu,
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      showSnackbar: false,
      snackBarMessage: '',
      snackBarColor: 'error',
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
    ...mapStores(useGameStore),
    ...mapStores(useAuthStore),
    isSpectating() {
      return this.gameStore.isSpectating;
    },
    menuWrapperStyle() {
      return {
        zIndex: this.isSpectating ? 2411 : 3 // Allows spectators to access game menu wrapper in any moment
      };
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
    /////////////////////////////////////////////
    // Game, Deck, Log, Scrap, and Spectators //
    ///////////////////////////////////////////
    deck() {
      return this.gameStore.deck;
    },
    scrap() {
      return this.gameStore.scrap;
    },
    logs() {
      return this.gameStore.log;
    },
    deckLength() {
      let res = this.deck.length;
      if (this.gameStore.topCard) {
        res++;
      }
      if (this.gameStore.secondCard) {
        res++;
      }
      return res;
    },
    spectatingUsers() {
      return this.gameStore.spectatingUsers;
    },
    /////////////////
    // King Counts //
    /////////////////
    playerKingCount() {
      return this.kingCount(this.gameStore.player);
    },
    opponentKingCount() {
      return this.kingCount(this.gameStore.opponent);
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
    ///////////////////////////
    // Transition Directions //
    ///////////////////////////
    showScrapChoice() {
      return (
        this.gameStore.lastEventCardChosen &&
        this.gameStore.scrap?.some(({ id }) => id === this.gameStore.lastEventCardChosen.id)
      );
    },
    threesTransition() {
      return this.gameStore.lastEventPlayerChoosing ? `threes-player` : `threes-opponent`;
    },
    playerPointsTransition() {
      switch (this.gameStore.lastEventChange) {
        case 'resolve':
          // Different one-offs cause points to move in different directions
          switch (this.gameStore.lastEventOneOffRank) {
            // Twos and Sixes swap control of points between players
            case 2:
            case 6:
              return 'slide-above';
            // For nines, transition direction depends on target type
            case 9:
              switch (this.gameStore.lastEventTargetType) {
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
        this.gameStore.lastEventChange === 'resolve' &&
        this.gameStore.lastEventOneOffRank === 9 &&
        this.gameStore.lastEventTargetType === 'faceCard'
      ) {
        return 'slide-below';
      }
      // Defaults in below (from hand) out left (to scrap)
      return 'in-below-out-left';
    },
    opponentPointsTransition() {
      switch (this.gameStore.lastEventChange) {
        // Jacks cause point cards to switch control (from/towards player)
        case 'jack':
        case 'sevenJack':
          return 'slide-below';
        case 'resolve':
          // Different one-offs cause different direction transitions
          switch (this.gameStore.lastEventOneOffRank) {
            // Twos and sixes caus point cards to switch control (from/towards player)
            case 2:
            case 6:
              return 'slide-below';
            // Nine transitions depend on the target type
            case 9:
              switch (this.gameStore.lastEventTargetType) {
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
        this.gameStore.lastEventChange === 'resolve' &&
        this.gameStore.lastEventOneOffRank === 9 &&
        this.gameStore.lastEventTargetType === 'faceCard'
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
      return this.selectionIndex !== null ? this.gameStore.player.hand[this.selectionIndex] : null;
    },
    turnText() {
      return this.t(this.gameStore.isPlayersTurn ? 'game.turn.yourTurn' : 'game.turn.opponentTurn');
    },
    validScuttleIds() {
      const selectedCard = this.gameStore.resolvingSeven ? this.cardSelectedFromDeck : this.selectedCard;
      if (!selectedCard) {
        return [];
      }
      return this.gameStore.opponent.points
        .filter((potentialTarget) => {
          return (
            selectedCard.rank > potentialTarget.rank ||
            (selectedCard.rank === potentialTarget.rank && selectedCard.suit > potentialTarget.suit)
          );
        })
        .map((validTarget) => validTarget.id);
    },
    validFaceCardTargetIds() {
      switch (this.gameStore.opponentQueenCount) {
        case 0: {
          const opponentFaceCardIds = this.gameStore.opponent.faceCards.map((card) => card.id);
          const opponentJackIds = [];
          this.gameStore.opponent.points.forEach((card) => {
            if (card.attachments.length > 0) {
              opponentJackIds.push(card.attachments[card.attachments.length - 1].id);
            }
          });
          return [ ...opponentFaceCardIds, ...opponentJackIds ];
        }
        case 1:
          return [ this.gameStore.opponent.faceCards.find((card) => card.rank === 12).id ];
        default:
          return [];
      }
    },
    validMoves() {
      if (!this.gameStore.isPlayersTurn) {
        return [];
      }
      const selectedCard = this.gameStore.resolvingSeven ? this.cardSelectedFromDeck : this.selectedCard;
      if (!selectedCard) {
        return [];
      }
      switch (this.targetingMoveName) {
        case 'scuttle':
          return this.validScuttleIds;
        case 'jack':
          return this.gameStore.opponent.points.map((validTarget) => validTarget.id);
        case 'targetedOneOff': {
          // Twos and nines can target face cards
          let res = [ ...this.validFaceCardTargetIds ];
          // Nines can additionally target points if opponent has no queens
          if (selectedCard.rank === 9 && this.gameStore.opponentQueenCount === 0) {
            res = [ ...res, ...this.gameStore.opponent.points.map((validTarget) => validTarget.id) ];
          }
          return res;
        }
        default:
          return [];
      }
    },
    nineTarget() {
      switch (this.targetType) {
        case 'point':
          return this.nineTargetIndex !== null ? this.gameStore.opponent.points[this.nineTargetIndex] : null;
        case 'faceCard':
          return this.nineTargetIndex !== null
            ? this.gameStore.opponent.faceCards[this.nineTargetIndex]
            : null;
        default:
          return null;
      }
    },
    // Sevens
    playingFromDeck() {
      return this.gameStore.playingFromDeck;
    },
    topCard() {
      return this.gameStore.topCard;
    },
    secondCard() {
      return this.gameStore.secondCard;
    },
    cardSelectedFromDeck() {
      if (this.topCardIsSelected) {
        return this.topCard;
      }
      if (this.secondCardIsSelected) {
        return this.secondCard;
      }
      return null;
    },
    showOpponentHand() {
      return this.gameStore.hasGlassesEight || this.isSpectating || !this.topCard;
    },
  },
  watch: {
    logs: function () {
      this.$nextTick(function () {
        this.scrollToLastLog();
      });
    },
    topCard(newTopCard, oldTopCard) {
      if (this.gameStore.id && oldTopCard && !newTopCard) {
        this.showCustomSnackbarMessage('game.snackbar.draw.exhaustedDeck');
      }
    }
  },
  async mounted() {
    if (!this.authStore.authenticated) {
      this.authStore.mustReauthenticate = true;
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
      this.snackBarMessage = '';
      this.showSnackbar = false;
    },
    handleError(messageKey) {
      this.snackBarMessage = this.t(messageKey);
      this.showSnackbar = true;
      this.snackBarColor = 'error';
      this.clearSelection();
    },
    showCustomSnackbarMessage(messageKey) {
      this.snackBarMessage = this.t(messageKey);
      this.showSnackbar = true;
      this.snackBarColor = 'surface-1';
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
      if (!this.gameStore.waitingForOpponentToPlayFromDeck) {
        this.secondCardIsSelected = false;
        this.topCardIsSelected = !this.topCardIsSelected;
      }
    },
    selectSecondCard() {
      if (!this.gameStore.waitingForOpponentToPlayFromDeck) {
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
    async drawCard() {
      if (!this.gameStore.resolvingSeven) {
        try {
          const drawCard = this.deckLength > 0;
          if (!drawCard) {
            await this.gameStore.requestPass();
          } else {
            await this.gameStore.requestDrawCard();
          }
        } catch (messageKey) {
          this.handleError(messageKey);
        } finally {
          this.clearSelection();
        }
      }
    },
    async playPoints() {
      this.clearOverlays();
      try {
        const { resolvingSeven } = this.gameStore;
        if (!resolvingSeven) {
          await this.gameStore.requestPlayPoints(this.selectedCard.id);
        } else {
          const deckIndex = this.topCardIsSelected ? 0 : 1;
          await this.gameStore.requestPlayPointsSeven({
            cardId: this.cardSelectedFromDeck.id,
            index: deckIndex,
          });
        }
      } catch (error) {
        this.handleError(error);
      } finally {
        this.clearSelection();
      }
    },
    async playFaceCard() {
      this.clearOverlays();
      try {
        const { resolvingSeven } = this.gameStore;
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        if (!resolvingSeven) {
          await this.gameStore
            .requestPlayFaceCard(this.selectedCard.id);
        } else {
          await this.gameStore
            .requestPlayFaceCardSeven({
              cardId: this.cardSelectedFromDeck.id,
              index: deckIndex,
            });
        }
      } catch(messageKey){
        this.handleError(messageKey);
      } finally {
        this.clearSelection();
      }
    },
    scuttle(targetIndex) {
      if (this.gameStore.resolvingSeven) {
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.gameStore
          .requestScuttleSeven({
            cardId: this.cardSelectedFromDeck.id,
            targetId: this.gameStore.opponent.points[targetIndex].id,
            index: deckIndex,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      } else {
        this.gameStore
          .requestScuttle({
            cardId: this.selectedCard.id,
            targetId: this.gameStore.opponent.points[targetIndex].id,
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
          target = this.gameStore.opponent.faceCards[targetIndex];
          break;
        case 'point':
          target = this.gameStore.opponent.points[targetIndex];
          break;
        case 'jack':
          if (targetIndex < 0) {
            // targeting the last jack attached to a point card
            const targetJacks = this.gameStore.opponent.points[-targetIndex - 1].attachments;
            target = targetJacks[targetJacks.length - 1];
            jackedPointId = this.gameStore.opponent.points[-targetIndex - 1].id;
          }
          break;
      }
      if (this.gameStore.resolvingSeven) {
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.gameStore
          .requestPlayTargetedOneOffSeven({
            cardId: this.cardSelectedFromDeck.id,
            targetId: target.id,
            pointId: jackedPointId,
            targetType,
            index: deckIndex,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      } else {
        this.gameStore
          .requestPlayTargetedOneOff({
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
      const target = this.gameStore.opponent.points[targetIndex];
      if (this.gameStore.resolvingSeven) {
        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.gameStore
          .requestPlayJackSeven({
            cardId: this.cardSelectedFromDeck.id,
            index: deckIndex,
            targetId: target.id,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      } else {
        this.gameStore
          .requestPlayJack({
            cardId: this.selectedCard.id,
            targetId: target.id,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      }
    },
    targetOpponentPointCard(targetIndex) {
      if (!this.selectedCard && !this.topCardIsSelected && !this.secondCardIsSelected) {
        return;
      }
      let cardRank;
      if (this.gameStore.resolvingSeven) {
        if (!this.cardSelectedFromDeck) {
          return;
        }
        cardRank = this.cardSelectedFromDeck.rank;
      } else {
        if (!this.selectedCard) {
          return;
        }
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
      if (this.gameStore.resolvingSeven) {
        if (!this.cardSelectedFromDeck) {
          return;
        }
        cardToPlay = this.cardSelectedFromDeck;
      } else {
        if (!this.selectedCard) {
          return;
        }
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
      if (this.gameStore.resolvingSeven) {
        if (!this.cardSelectedFromDeck) {
          return;
        }

        const deckIndex = this.topCardIsSelected ? 0 : 1;
        this.gameStore
          .requestPlayOneOffSeven({
            cardId: this.cardSelectedFromDeck.id,
            index: deckIndex,
          })
          .then(this.clearSelection)
          .catch(this.handleError);
      }
      if (!this.selectedCard) {
        return;
      }

      this.gameStore
        .requestPlayOneOff(this.selectedCard.id)
        .then(this.clearSelection)
        .catch(this.handleError);
    },
    scrollToLastLog() {
      if (this.$refs.logsContainer) {
        this.$refs.logsContainer.scrollTop = this.$refs.logsContainer.scrollHeight;
      }
    },
    isBeingDiscarded(card) {
      return this.gameStore.lastEventDiscardedCards?.some(id => id === card.id); 
    }
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
.slide-below-enter-from,
.slide-below-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
// slide-above (enter and leave above)
.slide-above-enter-from,
.slide-above-leave-to {
  opacity: 0;
  transform: translateY(-32px);
}
// in-below-out-left (enter from below, exit to left)
.in-below-out-left-enter-from {
  opacity: 0;
  transform: translateY(32px);
}
.in-below-out-left-leave-to {
  opacity: 0;
  transform: translateX(-32px);
}
// in-above-out-below (enter from above, exit below)
.in-above-out-below-enter-from {
  opacity: 0;
  transform: translateY(-32px);
}
.in-above-out-below-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
// in-below-out-above (enter from below, exit above)
.in-below-out-above-enter-from {
  opacity: 0;
  transform: translateY(32px);
}
.in-below-out-above-leave-to {
  opacity: 0;
  transform: translateY(-32px);
}
.gameCard {
  position: absolute;
  transition: all 1s ease-out;
}

.scrapPile {
  transition: all 1s ease;
}

.threes-player-enter-from.scrapPile,
.threes-opponent-enter-from.scrapPile {
  opacity: 0;
}
.threes-player-leave-to.gameCard {
  opacity: 0;
  transform: translate(200px, 50px);
}

.threes-opponent-leave-to.gameCard {
  transform: translate(200px, -200px);
  opacity: 0;
}

@media (max-width: 600px) {
  .threes-player-leave-to {
    opacity: 0;
    transform: translateY(200px);
  }

  .threes-opponent-leave-to {
    transform: translate(-200px);
    opacity: 0;
  }
}
////////////
// Styles //
////////////
#game-view-wrapper {
  color: #fff;
  width: 100vw;
  height: 100%;
  background-image: url('/img/game/board-background.webp');
  background-size: cover;
  background-position: center;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: 15vh 5vh 55vh 5vh 20vh;
  grid-template-areas:
    'opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand opp-hand'
    'decks decks opp-score opp-score opp-score opp-score history history'
    'decks decks field field field field history history'
    'score score score score score score score score'
    'hand hand hand hand hand hand hand hand';
}

#game-menu-wrapper {
  position: absolute;
  display: inline-block;
  right: 0;
  margin: 10px;
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
    background-color: rgba(255, 255, 255, 0);
    &.reveal-top-two {
      height: auto;
      align-self: start;
      color: white;
      background-image: none;
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
  & #deck {
    background-image: url('/img/game/bg-deck.png');
  }
  & #scrap {
    background-image: url('/img/game/bg-scrap.png');
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
      font-family:
        'Libre Baskerville',
        Century Gothic,
        CenturyGothic,
        AppleGothic,
        sans-serif;
    }
  }
}

.history-title {
  font-size: 1.25em;
  font-weight: 700;
  font-family:
    'Cormorant Infant',
    Century Gothic,
    CenturyGothic,
    AppleGothic,
    sans-serif;
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
  grid-area: score;
  text-align: center;
}

.player-hand-container {
  grid-area: hand;
}

#player-hand {
  min-width: 50%;
  height: 100%;
  & #player-hand-cards,
  & :deep(#player-hand-targeting) {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.46);
    overflow-y: hidden;
    border-radius: 4px;
    transition: all 1s;
    &.my-turn {
      border: 4px solid rgba(var(--v-theme-accent));
      box-shadow:
        0 15px 16px -12px rgba(0, 123, 59, 0.8),
        0 24px 38px 12px rgba(0, 123, 59, 0.8),
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
      'score score score score score score score score'
      'hand hand hand hand hand hand hand hand';
  }

  .field-points {
    .field-point-container {
      width: auto;

      .jacks-container {
        right: -25%;
        width: auto;
      }
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

@media (max-width: 960px) and (orientation: landscape) {
  #player-score {
    margin-top: -16px;
  }
}
</style>
