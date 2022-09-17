<template>
  <div id="game-view-wrapper">
    <!-- Unauthenticated/Must re-log in -->
    <template v-if="$store.state.game.myPNum === null">
      <reauthenticate-dialog v-model="mustReauthenticate" />
    </template>
    <!-- Authenticated View -->
    <template v-else>
      <div id="game-menu-wrapper">
        <game-menu />
      </div>

      <!-- Opponent Hand -->
      <div
        id="opponent-hand"
        class="d-flex flex-column justify-start align-center px-2 pb-2 mx-auto"
      >
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
                  name="slide-below"
                >
                  <card
                    v-for="card in opponent.hand"
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
                  name="slide-below"
                  class="opponent-hand-wrapper transition-all"
                >
                  <div
                    v-for="(card, index) in opponent.hand"
                    :key="index + 0"
                    class="transition-all opponent-card-back-wrapper opponent-hand-card mx-2"
                  >
                    <v-card class="opponent-card-back" data-opponent-hand-card>
                      <v-img :src="require('../img/logo_head.svg')" contain />
                    </v-card>
                  </div>
                </transition-group>
              </transition>
            </div>
          </div>
        </div>
        <h3 id="opponent-score">
          <span>POINTS: {{ opponentPointTotal }}</span>
          <score-goal-tool-tip
            :king-count="opponentKingCount"
            :points-to-win="opponentPointsToWin"
            :is-player="false"
          />
        </h3>
      </div>
      <!-- Field -->
      <div id="field" class="d-flex justify-center align-center p-2 mx-auto">
        <div id="field-left">
          <v-card
            id="deck"
            :class="{ 'reveal-top-two': resolvingSeven, 'my-turn': isPlayersTurn }"
            @click="drawCard"
          >
            <template v-if="!resolvingSeven">
              <v-img :src="require('../img/logo_head.svg')" :width="deckLogoWidth" contain />
              <v-card-actions>({{ deckLength }})</v-card-actions>
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
                  class="mb-4"
                  @click="selectTopCard"
                />
                <card
                  v-if="secondCard"
                  :suit="secondCard.suit"
                  :rank="secondCard.rank"
                  :data-second-card="`${secondCard.rank}-${secondCard.suit}`"
                  :is-selected="secondCardIsSelected"
                  class="mb-4"
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
        <div id="field-right">
          <div id="history" class="rounded d-flex flex-column justify-start">
            <h3>History</h3>
            <v-divider />
            <div
              id="history-logs"
              ref="logsContainer"
              class="d-flex flex-column justify-start mt-2 text-caption"
            >
              <p v-for="(log, index) in logs" :key="index">
                {{ log }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Hand -->
      <div id="player-hand" class="d-flex flex-column justify-end align-center px-2 pt-2 mx-auto">
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
        <div
          v-if="!targeting"
          id="player-hand-cards"
          class="user-cards-grid-container"
          :class="{ 'my-turn': isPlayersTurn }"
        >
          <username-tool-tip
            id="player-username-container"
            key="player-username"
            :username="playerUsername"
            :is-player="true"
          />
          <div class="player-cards-container">
            <transition-group
              tag="div"
              name="slide-above"
              class="d-flex justify-center align-start"
              :class="{ 'my-turn': isPlayersTurn }"
            >
              <card
                v-for="(card, index) in player.hand"
                :key="card.id"
                :suit="card.suit"
                :rank="card.rank"
                :is-selected="selectedCard && card.id === selectedCard.id"
                :is-frozen="player.frozenId === card.id"
                class="mt-8 transition-all"
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
import ScrapDialog from '@/components/GameView/ScrapDialog';
import UsernameToolTip from '@/components/GameView/UsernameToolTip';

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
    };
  },
  computed: {
    ...mapState({
      waitingForOpponentToPlayFromDeck: ({ game }) => game.waitingForOpponentToPlayFromDeck,
    }),
    ...mapGetters([
      'cards',
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
      switch (this.$vuetify.breakpoint.name) {
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
          return this.nineTargetIndex !== null
            ? this.opponent.faceCards[this.nineTargetIndex]
            : null;
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
        const container = this.$refs.logsContainer;
        if (container) {
          container.scrollTop = container.scrollHeight + 120;
        }
      });
    },
  },
  mounted() {
    if (!this.$store.state.auth.authenticated) {
      this.$store.commit('setMustReauthenticate', true);
    }
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
      return player.faceCards.reduce(
        (kingCount, card) => kingCount + (card.rank === 13 ? 1 : 0),
        0
      );
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
          return 7;
        case 4:
          return 5;
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
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #6202ee 14.61%, #fd6222 100%), #c4c4c4;
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

#opponent-hand {
  min-width: 50%;
  height: 20vh;
  & #opponent-score {
    z-index: 1;
  }
  & #opponent-hand-cards {
    height: 80%;
    background: rgba(0, 0, 0, 0.46);

    & #opponent-hand-glasses {
      margin-top: -48px;
      .opponent-hand-card-revealed {
        transform: scale(0.8);
      }
    }
    & .opponent-hand-wrapper {
      display: flex;
      position: relative;
      height: 100%;

      & .opponent-card-back-wrapper {
        height: 90%;
        width: 10vw;
        display: inline-block;
        position: relative;
        & .opponent-card-back {
          height: 100%;
          width: 100%;
          transform: rotate(180deg);
        }
      }
    }
  }
}
#field {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 50vh;
}
#field-left {
  width: 20%;
  & #deck {
    cursor: pointer;
    &.reveal-top-two {
      height: auto;
      align-self: start;
    }
    & #empty-deck-text {
      position: absolute;
    }
    &.my-turn {
      border: 4px solid var(--v-accent-base);
    }
  }
  & #deck,
  & #scrap {
    position: relative;
    margin: 10px;
    height: 29vh;
    width: calc(29vh / 1.3);
    border: 1px solid #fff;
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
  width: 60%;
}
#field-right {
  height: 100%;
  width: 20%;

  #history,
  #card-preview {
    margin: 0 auto;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid #fff;
    width: 80%;
    max-width: 80%;
    height: 100%;
  }
  #history {
    & #history-logs {
      height: 80%;
      overflow: auto;
    }
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
    width: calc(20vh / 1.45);
    margin: 3px;
    position: relative;

    .jacks-container {
      position: absolute;
      right: -20%;
      top: 0;
      width: auto;
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

#player-hand {
  min-width: 50%;
  height: 30vh;
  & #player-hand-cards,
  #player-hand-targeting::v-deep {
    width: 100%;
    height: 80%;
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
}
</style>
