import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { cloneDeep } from 'lodash';
import { io } from '@/plugins/sails.js';

/**
 * @returns number of queens a given player has
 * @param player is the player object
 */
function queenCount(player) {
  if (!player) {
    return null;
  }
  return player.faceCards.reduce((queenCount, card) => queenCount + (card.rank === 12 ? 1 : 0), 0);
}

const compareByRankThenSuit = (card1, card2) => {
  return card1.rank - card2.rank || card1.suit - card2.suit;
};

const setPlayers = (player, myPnum, hasGlassesEight, isSpectating) => {
  const sortCards = (cards) => {
    if (isSpectating || hasGlassesEight || player.pNum === myPnum) {
      return cards?.sort(compareByRankThenSuit);
    }
    return cards;
  };

  return {
    ...player,
    hand: sortCards(player.hand)?.map((card) => createGameCard(card)),
    points: sortCards(player.points)?.map((card) => createGameCard(card)),
    faceCards: sortCards(player.faceCards)?.map((card) => createGameCard(card)),
  };
};

class GameCard {
  constructor(card) {
    const str_rank =
      {
        1: 'A',
        11: 'J',
        12: 'Q',
        13: 'K',
      }[card.rank] ?? card.rank;
    // Stringify Suit
    const str_suit = ['♣️', '♦️', '♥️', '♠️'][card.suit];
    this.createdAt = card.createdAt;
    this.updatedAt = card.updatedAt;
    this.id = card.id;
    this.suit = card.suit;
    this.rank = card.rank;
    this.name = str_rank + str_suit;
    this.attachments = card.attachments?.map((attachment) => createGameCard(attachment));
  }
}
const createGameCard = (card) => {
  if (!card) {
    return null;
  }
  return new GameCard(card);
};

export const useGameStore = defineStore('game', {
  state: () => ({
    id: null,
    chat: [],
    deck: [],
    log: [],
    name: null,
    p0Ready: false,
    p1Ready: false,
    p0Rematch: null,
    p1Rematch: null,
    rematchGameId: null,
    passes: 0,
    players: [],
    isSpectating: false,
    spectatingUsers: [],
    scrap: [],
    turn: 0,
    twos: [],
    myPNum: null,
    topCard: null,
    secondCard: null,
    oneOff: null,
    oneOffTarget: null,
    waitingForOpponentToCounter: false,
    myTurnToCounter: false,
    isRanked: false,
    showIsRankedChangedAlert: false,
    // Threes
    waitingForOpponentToPickFromScrap: false,
    pickingFromScrap: false,
    lastEventCardChosen: null,
    lastEventPlayerChoosing: false,
    // Fours
    discarding: false,
    waitingForOpponentToDiscard: false,
    lastEventDiscardedCards: null,
    // Sevens
    playingFromDeck: false,
    waitingForOpponentToPlayFromDeck: false,
    // Last Event
    lastEventChange: null,
    lastEventOneOffRank: null,
    lastEventTargetType: null,
    // GameOver
    gameIsOver: false,
    winnerPNum: null,
    conceded: false,
    waitingForOpponentToStalemate: false,
    consideringOpponentStalemateRequest: false,
    currentMatch: null,
  }),
  getters: {
    player: (state) => {
      return state.players[state.myPNum];
    },
    playerPointTotal: (state) => {
      if (!state.player) {
        return 0;
      }
      return state.player.points.reduce((total, card) => total + card.rank, 0) || 0;
    },
    playerQueenCount: (state) => {
      return queenCount(state.player);
    },
    playerUsername: (state) => {
      if (!state.player) {
        return null;
      }
      return state.player.username;
    },
    opponent: (state) => {
      if (state.players.length < 2) {
        return null;
      }
      return state.players[(state.myPNum + 1) % 2];
    },
    opponentIsReady: (state) => {
      if (!state.opponent) {
        return null;
      }
      return state.myPNum === 0 ? state.p1Ready : state.p0Ready;
    },
    opponentUsername: (state) => {
      if (!state.opponent) {
        return null;
      }
      return state.opponent.username;
    },
    opponentPointTotal: (state) => {
      if (!state.opponent) {
        return 0;
      }
      return state.opponent.points.reduce((total, card) => total + card.rank, 0) || 0;
    },
    opponentQueenCount: (state) => {
      return queenCount(state.opponent);
    },
    playerWins: (state) => {
      return state.gameIsOver && state.winnerPNum === state.myPNum;
    },
    resolvingSeven: (state) => {
      return state.playingFromDeck || state.waitingForOpponentToPlayFromDeck;
    },
    isPlayersTurn: (state) => {
      return state.turn % 2 === state.myPNum;
    },
    hasGlassesEight: (state) => {
      return state.player?.faceCards?.filter((card) => card.rank === 8).length > 0 ?? false;
    },
  },
  actions: {
    updateGame(newGame) {
      this.lastEventChange = newGame.lastEvent?.change ?? null;
      this.lastEventOneOffRank = newGame.lastEvent?.oneOff?.rank ?? null;
      this.lastEventTargetType = newGame.lastEvent?.oneOffTargetType ?? null;
      this.cardChosenFromScrap = newGame.lastEvent?.chosenCard ?? null;
      this.playerChoosingFromScrap = newGame.lastEvent?.pNum === this.myPNum ?? null;
      this.discardedCards = newGame.lastEvent?.discardedCards ?? null;
      this.waitingForOpponentToStalemate = false;
      this.id = newGame.id ?? this.id;
      this.turn = newGame.turn ?? this.turn;
      // this.chat = cloneDeep(newGame.chat);
      this.deck = newGame.deck?.map((card) => createGameCard(card)) ?? this.deck;
      this.scrap = newGame.scrap?.map((card) => createGameCard(card)) ?? this.scrap;
      this.log = cloneDeep(newGame.log) ?? this.log;
      this.name = newGame.name ?? this.name;
      this.p0Ready = newGame.p0Ready ?? this.p0Ready;
      this.p1Ready = newGame.p1Ready ?? this.p1Ready;
      this.passes = newGame.passes ?? this.passes;
      this.players =
        newGame.players?.map((player) =>
          setPlayers(player, this.myPNum, this.hasGlassesEight, this.isSpectating),
        ) ?? this.players;
      this.spectatingUsers = newGame.spectatingUsers ?? this.spectatingUsers;
      this.twos = newGame.twos?.map((card) => createGameCard(card)) ?? this.twos;
      this.topCard = createGameCard(newGame.topCard) ?? null;
      this.secondCard = createGameCard(newGame.secondCard) ?? null;
      this.oneOff = createGameCard(newGame.oneOff) ?? null;
      this.oneOffTarget = createGameCard(newGame.oneOffTarget) ?? null;
      this.isRanked = newGame.isRanked ?? this.isRanked;
      this.currentMatch = newGame.currentMatch ?? this.currentMatch;
      this.p0Rematch = newGame.p0Rematch ?? null;
      this.p1Rematch = newGame.p1Rematch ?? null;
      this.gameIsOver = newGame.gameIsOver ?? false;
    },
    opponentJoined(newPlayer) {
      this.players.push(cloneDeep(newPlayer));
      this.players.sort((player, opponent) => player.pNum - opponent.pNum);
    },
    successfullyJoined(player) {
      this.players.push(cloneDeep(player));
    },
    resetState() {
      this.$reset();
    },
    updateReady(pNum) {
      if (pNum === 0) {
        this.p0Ready = !this.p0Ready;
      } else {
        this.p1Ready = !this.p1Ready;
      }
    },
    opponentLeft() {
      this.players = this.players.filter((player) => player.pNum === this.myPNum);
    },
    // Game Over
    setGameOver({ gameOver, conceded, winner, currentMatch }) {
      this.gameIsOver = gameOver;
      this.conceded = conceded;
      this.winnerPNum = winner;
      this.currentMatch = currentMatch;
    },
    resetPNumIfNullThenUpdateGame(game) {
      this.resetPNumIfNull(game);
      this.updateGame(game);
    },
    setRematch({ pNum, rematch }) {
      this[`p${pNum}Rematch`] = rematch;
    },
    setRematchGameId({ gameId }) {
      this.rematchGameId = gameId;
    },
    resetPNumIfNull(game) {
      const authStore = useAuthStore();
      // Set my pNum if it is null
      if (this.myPNum === null) {
        let myPNum = game.players.findIndex(({ username }) => username === authStore.username);
        if (myPNum === -1) {
          myPNum = null;
        }
        this.myPNum = myPNum;
      }
    },
    /**
     * Updates gamestate to animate scuttle. First removes card from op hand
     * and places it on top of player's point card, then waits 1s
     * and updates complete game which will put both cards in the scrap
     * @returns void
     */
    processScuttle({ game, playedCardId, targetCardId, playedBy }) {
      // Update in one step if this player scuttled or if pNum is not set
      if (!this.player) {
        this.resetPNumIfNullThenUpdateGame(game);
        return;
      }

      const scuttlingPlayer = this.players[playedBy];
      const scuttledPlayer = this.players[(playedBy + 1) % 2];

      // Remove played card from scuttling player's hand and temporarily add to target's attachments
      const playedCardIndex = scuttlingPlayer.hand.findIndex((card) => card.id === playedCardId);
      const targetCardIndex = scuttledPlayer.points.findIndex((card) => card.id === targetCardId);

      // Update game in one-step if moved cards are not found
      if (playedCardIndex === undefined || targetCardIndex === undefined) {
        this.resetPNumIfNullThenUpdateGame(game);
        return;
      }

      const [playedCard] = scuttlingPlayer.hand.splice(playedCardIndex, 1);
      const targetCard = scuttledPlayer.points[targetCardIndex];
      targetCard.scuttledBy = playedCard;

      // Finish complete update of the game state after 1s
      setTimeout(() => {
        this.resetPNumIfNullThenUpdateGame(game);
      }, 1000);
    },
    processThrees(chosenCard, game) {
      this.waitingForOpponentToPickFromScrap = false;
      this.pickingFromScrap = false;
      this.lastEventCardChosen = chosenCard;

      setTimeout(() => {
        this.resetPNumIfNullThenUpdateGame(game);
      }, 1000);
    },
    processFours(discardedCards, game) {
      this.waitingForOpponentToDiscard = false;
      this.discarding = false;
      this.lastEventDiscardedCards = discardedCards;

      setTimeout(() => {
        this.resetPNumIfNullThenUpdateGame(game);
      }, 1000);
    },
    handleGameResponse: (jwres, resolve, reject) => {
      const authStore = useAuthStore();
      switch (jwres.statusCode) {
        case 200:
          return resolve();
        case 403:
          authStore.mustReauthenticate = true;
          return reject(jwres.body.message);
        default:
          return reject(jwres.body.message);
      }
    },

    async requestSubscribe(gameId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/subscribe',
          {
            gameId,
          },
          (res, jwres) => {
            if (jwres.statusCode === 200) {
              this.resetState();
              this.myPNum = res.pNum;
              this.updateGame(res.game);
              this.successfullyJoined({
                username: res.playerUsername,
                pNum: res.pNum,
              });
              return resolve();
            }
            const message = res.message ?? 'error subscribing';
            return reject(new Error(message));
          },
        );
      });
    },

    async requestSpectate(gameId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/spectate',
          {
            gameId,
          },
          (res, jwres) => {
            if (jwres.statusCode === 200) {
              this.myPNum = 0;
              this.isSpectating = true;
              this.updateGame(res);
              return resolve();
            }
            return reject(new Error('Unable to spectate game'));
          },
        );
      });
    },
    async requestSpectateLeave() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/spectateLeave', (res, jwres) => {
          if (jwres.statusCode === 200) {
            this.resetState();
            return resolve();
          }
          return reject(new Error('Error leaving game as spectator'));
        });
      });
    },
    async requestLeaveLobby() {
      return new Promise((resolve, reject) => {
        io.socket.post('/game/leaveLobby', (res, jwres) => {
          if (jwres.statusCode === 200) {
            this.resetState();
            return resolve();
          }
          return reject(new Error('Error leaving lobby'));
        });
      });
    },
    async requestReady() {
      return new Promise((resolve, reject) => {
        io.socket.post('/game/ready', (res, jwres) => {
          if (jwres.statusCode === 200) {
            return resolve(res);
          }
          return reject(new Error('Error readying for game'));
        });
      });
    },
    async requestSetIsRanked({ isRanked }) {
      return new Promise((resolve, reject) => {
        io.socket.post(
          '/game/setIsRanked',
          {
            isRanked,
          },
          (res, jwres) => {
            if (jwres.statusCode === 200) {
              return resolve(res);
            }
            const modeName = isRanked ? 'ranked' : 'casual';
            return reject(new Error(`Unable to change game to ${modeName}`));
          },
        );
      });
    },
    ///////////////////
    // In-Game Moves //
    ///////////////////
    async requestDrawCard() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/draw', (res, jwres) => {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestPlayPoints(cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/points',
          {
            cardId,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayFaceCard(cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/faceCard',
          {
            cardId,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    /**
     *
     * @param cardData @example {cardId: number, targetId: number}
     */
    async requestScuttle(cardData) {
      const { cardId, targetId } = cardData;
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/scuttle',
          {
            cardId,
            targetId,
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayOneOff(cardId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/untargetedOneOff',
          {
            cardId,
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.waitingForOpponentToCounter = true;
        return Promise.resolve();
      });
    },
    async requestPlayTargetedOneOff({ cardId, targetId, pointId, targetType }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/targetedOneOff',
          {
            cardId,
            targetId,
            pointId,
            targetType,
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.waitingForOpponentToCounter = true;
      });
    },
    async requestPlayJack({ cardId, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/jack',
          {
            cardId,
            targetId,
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    /**
     *
     * @param {required} cardId1
     * @param {optional} cardId2
     */
    async requestDiscard({ cardId1, cardId2 }) {
      let reqData = {
        cardId1,
      };
      if (cardId2) {
        reqData = {
          cardId1,
          cardId2,
        };
      }
      return new Promise((resolve, reject) => {
        io.socket.get('/game/resolveFour', reqData, function (res, jwres) {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestResolve() {
      this.myTurnToCounter = false;
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/resolve',
          {
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestResolveThree(cardId) {
      this.myTurnToCounter = false;
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/resolveThree',
          {
            cardId,
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.waitingForOpponentToCounter = false;
      });
    },
    async requestResolveSevenDoubleJacks({ cardId, index }) {
      this.myTurnToCounter = false;
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/jack',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            targetId: -1, // -1 for the double jacks with no points to steal case
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestCounter(twoId) {
      this.myTurnToCounter = false;

      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/counter',
          {
            cardId: twoId,
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.waitingForOpponentToCounter = true;
      });
    },
    ////////////
    // Sevens //
    ////////////
    async requestPlayPointsSeven({ cardId, index }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/points',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestScuttleSeven({ cardId, index, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/scuttle',
          {
            cardId,
            index,
            targetId,
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayJackSeven({ cardId, index, targetId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/jack',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            targetId,
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayFaceCardSeven({ index, cardId }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/faceCard',
          {
            cardId,
            index,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestPlayOneOffSeven({ cardId, index }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/untargetedOneOff',
          {
            cardId,
            index, // 0 if topCard, 1 if secondCard
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.waitingForOpponentToCounter = true;
      });
    },
    async requestPlayTargetedOneOffSeven({ cardId, index, targetId, pointId, targetType }) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/game/seven/targetedOneOff',
          {
            cardId,
            targetId,
            pointId,
            targetType,
            index, // 0 if topCard, 1 if secondCard
            opId: this.opponent.id,
          },
          (res, jwres) => {
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      }).then(() => {
        this.waitingForOpponentToCounter = true;
      });
    },
    async requestPass() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/pass', (res, jwres) => {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestConcede() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/concede', (res, jwres) => {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestStalemate() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/stalemate', (res, jwres) => {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async rejectStalemate() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/reject-stalemate', (res, jwres) => {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestUnsubscribeFromGame() {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/over', (res, jwres) => {
          if (jwres.statusCode === 200) {
            this.resetState();
          }
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestRematch({ gameId, rematch = true }) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/rematch', { gameId, rematch }, (res, jwres) => {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
    async requestJoinRematch({ oldGameId }) {
      return new Promise((resolve, reject) => {
        io.socket.get('/game/join-rematch', { oldGameId }, (res, jwres) => {
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },
  }, // End actions
}); // End game store
