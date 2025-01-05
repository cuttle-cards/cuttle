import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { cloneDeep } from 'lodash';
import { io } from '@/plugins/sails.js';
import MoveType from '../../utils/MoveType.json';
import { sleep } from '../util/sleep';

/**
 * @returns number of queens a given player has
 * @param player is the player object
 */
function queenCount(player) {
  if (!player?.faceCards) {
    return 0;
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
    const str_suit = [ '♣️', '♦️', '♥️', '♠️' ][card.suit];
    this.createdAt = card.createdAt;
    this.updatedAt = card.updatedAt;
    this.id = card.id;
    this.suit = card.suit;
    this.rank = card.rank;
    this.isFrozen = card.isFrozen;
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
    showResolveFour: false,
    waitingForOpponentToDiscard: false,
    lastEventDiscardedCards: null,
    // fives
    showResolveFive: false,
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
    iWantToContinueSpectating: false,
  }),
  getters: {
    player: (state) => {
      return state.players[state.myPNum];
    },
    playerPointTotal: (state) => {
      if (!state.player) {
        return 0;
      }
      return state.player?.points?.reduce((total, card) => total + card.rank, 0) || 0;
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
      return state.opponent?.points?.reduce((total, card) => total + card.rank, 0) || 0;
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
    iWantRematch: (state) => {
      if (state.myPNum === null) {
        return false;
      }
      const key = `p${state.myPNum}Rematch`;
      return state[key];
    },
    // `null` if deciding, false if declined, true if accepted
    opponentWantsRematch: (state) => {
      if (state.myPNum === null) {
        return false;
      }
      const key = `p${(state.myPNum + 1) % 2}Rematch`;
      return state[key];
    },
    opponentDeclinedRematch() {
      return this.opponentWantsRematch === false;
    },
    someoneDeclinedRematch() {
      return this.iWantRematch === false || this.opponentDeclinedRematch;
    },
  },
  actions: {
    updateGame(newGame) {
      this.lastEventChange = newGame.lastEvent?.change ?? null;
      this.lastEventOneOffRank = newGame.lastEvent?.oneOff?.rank ?? null;
      this.lastEventTargetType = newGame.lastEvent?.oneOffTargetType ?? null;
      this.lastEventCardChosen = newGame.lastEvent?.chosenCard ?? null;
      this.lastEventPlayerChoosing = newGame.lastEvent?.pNum === this.myPNum ?? null;
      this.lastEventDiscardedCards = newGame.lastEvent?.discardedCards ?? null;
      this.waitingForOpponentToStalemate =
        (newGame.lastEvent?.requestedByPNum === this.myPNum && !newGame.gameIsOver) ?? false;
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
      // Add player, sort by pNum
      this.players.push(cloneDeep(player));
      this.players.sort((player, opponent) => player.pNum - opponent.pNum);
    },
    removeSpectator(username) {
      this.spectatingUsers = this.spectatingUsers.filter((spectator) => spectator !== username);
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
      const opponentPnum = this.opponent.pNum;
      this[`p${opponentPnum}Ready`] = false;

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
    async processScuttle({ game, playedCardId, targetCardId, playedBy }) {
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

      const [ playedCard ] = scuttlingPlayer.hand.splice(playedCardIndex, 1);
      const targetCard = scuttledPlayer.points[targetCardIndex];
      targetCard.scuttledBy = playedCard;

      // Finish complete update of the game state after 1s
      await sleep(1000);
      this.resetPNumIfNullThenUpdateGame(game);
    },
    async processThrees(chosenCard, game) {
      this.waitingForOpponentToPickFromScrap = false;
      this.pickingFromScrap = false;
      this.lastEventCardChosen = chosenCard;

      await sleep(1000);
      this.resetPNumIfNullThenUpdateGame(game);
    },
    async processFours(discardedCards, game) {
      this.waitingForOpponentToDiscard = false;
      this.showResolveFour = false;
      this.lastEventDiscardedCards = discardedCards;

      await sleep(1000);
      this.resetPNumIfNullThenUpdateGame(game);
    },
    async processFives(discardedCards, game) {
      this.waitingForOpponentToDiscard = false;
      this.showResolveFive = false;
      this.lastEventDiscardedCards = discardedCards;

      // Animate discard then update full game to animate draw
      if (discardedCards?.length) {
        await sleep(1000);
        const opponentHandAfterDiscard = this.opponent.hand.filter(
          (card) => !discardedCards.includes(card.id),
        );
        const playerHandAfterDiscard = this.player.hand.filter((card) => !discardedCards.includes(card.id));

        this.opponent.hand = opponentHandAfterDiscard;
        this.player.hand = playerHandAfterDiscard;
        await sleep(1000);
      }

      this.resetPNumIfNullThenUpdateGame(game);
    },
    handleGameResponse: (jwres, resolve, reject) => {
      const authStore = useAuthStore();
      switch (jwres.statusCode) {
        case 200:
          return resolve(jwres);
        case 403:
          authStore.mustReauthenticate = true;
          return reject(jwres.body.message);
        default:
          return reject(jwres.body.message);
      }
    },
    transformGameUrl(slug) {
      if (import.meta.env.VITE_USE_GAMESTATE_API !== 'true') {
        return `/api/game/${slug}`;
      }

      switch (slug) {
        case 'draw':
        case 'points':
        case 'faceCard':
        case 'scuttle':
        case 'untargetedOneOff':
        case 'targetedOneOff':
        case 'jack':
        case 'counter':
        case 'resolve':
        case 'resolveThree':
        case 'resolveFour':
        case 'resolveFive':
        case 'seven/points':
        case 'seven/scuttle':
        case 'seven/faceCard':
        case 'seven/jack':
        case 'seven/untargetedOneOff':
        case 'seven/targetedOneOff':
        case 'pass':
        case 'concede':
          // add all the move-making ones here
          return `/api/game/${this.id}/move`;
        case 'rematch':
          return `/api/game/${this.id}/rematch`;
        default:
          return `/api/game/${slug}`;
      }
    },
    makeSocketRequest(slug, data, method = 'POST') {
      const url = this.transformGameUrl(slug);
      return new Promise((resolve, reject) => {
        io.socket.request(
          {
            method,
            url,
            data,
          },
          (_res, jwres) => {
            if (import.meta.env.VITE_USE_GAMESTATE_API === 'true' && jwres.statusCode === 404) {
              reject('This action is not supported yet in GameState API');
            }
            return this.handleGameResponse(jwres, resolve, reject);
          },
        );
      });
    },
    async requestSubscribe(gameId) {
      return new Promise((resolve, reject) => {
        io.socket.get(
          '/api/game/subscribe',
          {
            gameId,
          },
          (res, jwres) => {
            if (jwres.statusCode === 200) {
              this.resetState();
              this.myPNum = res.pNum;
              this.updateGame(res.game);
              this.successfullyJoined({
                username: res.username,
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
      // TODO #965 - Remove dynamic gamestate slug
      const slug = import.meta.env.VITE_USE_GAMESTATE_API === 'true' ? `${gameId}/spectate/join` : 'spectate';
      try {
        const res = await this.makeSocketRequest(slug, { gameId });
        this.myPNum = 0;
        this.isSpectating = true;
        this.updateGame(res.body);
      } catch (err) {
        const message = err?.message ?? 'Unable to spectate game';
        throw(new Error(message));
      }
    },
    async requestSpectateLeave() {
      return new Promise((resolve, reject) => {
        io.socket.get('/api/game/spectateLeave', (res, jwres) => {
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
        io.socket.post('/api/game/leaveLobby', (res, jwres) => {
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
        io.socket.post('/api/game/ready', (res, jwres) => {
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
          '/api/game/setIsRanked',
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
      const moveType = MoveType.DRAW;
      await this.makeSocketRequest('draw', { moveType });
    },
    async requestPlayPoints(cardId) {
      const moveType = MoveType.POINTS;
      await this.makeSocketRequest('points', { moveType, cardId });
    },
    async requestPlayFaceCard(cardId) {
      const moveType = MoveType.FACE_CARD;
      await this.makeSocketRequest('faceCard', { moveType, cardId });
    },
    /**
     *
     * @param cardData @example {cardId: number, targetId: number}
     */
    async requestScuttle(cardData) {
      const moveType = MoveType.SCUTTLE;
      const { cardId, targetId } = cardData;
      await this.makeSocketRequest('scuttle', { moveType, cardId, targetId, opId: this.opponent.id });
    },

    async requestPlayOneOff(cardId) {
      const moveType = MoveType.ONE_OFF;
      await this.makeSocketRequest('untargetedOneOff', {
        moveType,
        cardId,
        opId: this.opponent.id
      });
      this.waitingForOpponentToCounter = true;
      return Promise.resolve();
    },

    async requestPlayTargetedOneOff({ cardId, targetId, pointId, targetType }) {
      const moveType = MoveType.ONE_OFF;
      await this.makeSocketRequest('targetedOneOff', {
        moveType,
        cardId,
        targetId,
        pointId,
        targetType,
        opId: this.opponent.id,
      });
      this.waitingForOpponentToCounter = true;
    },

    async requestPlayJack({ cardId, targetId }) {

      const moveType = MoveType.JACK;
      await this.makeSocketRequest('jack', {
        moveType,
        cardId,
        targetId,
        opId: this.opponent.id,
      });
    },

    /**
     *
     * @param {required} cardId1
     * @param {optional} cardId2
     */
    async requestDiscard({ cardId1, cardId2 }) {
      const moveType = MoveType.RESOLVE_FOUR;
      const reqData = cardId2 ? { moveType, cardId1, cardId2 } : { moveType, cardId1 };

      await this.makeSocketRequest('resolveFour', reqData);
    },

    async requestResolve() {
      this.myTurnToCounter = false;
      const moveType = MoveType.RESOLVE;
      await this.makeSocketRequest('resolve', { moveType, opId: this.opponent.id });
    },

    async requestResolveThree(cardId) {
      this.myTurnToCounter = false;
      const moveType = MoveType.RESOLVE_THREE;

      await this.makeSocketRequest('resolveThree', {
        moveType,
        cardId,
        opId: this.opponent.id,
      });
      this.waitingForOpponentToCounter = false;
    },

    async requestResolveFive(cardId) {
      this.myTurnToCounter = false;
      this.waitingForOpponentToCounter = false;
      const moveType = MoveType.RESOLVE_FIVE;

      await this.makeSocketRequest('resolveFive', { moveType, cardId });
    },

    async requestCounter(twoId) {
      this.myTurnToCounter = false;
      const moveType = MoveType.COUNTER;

      await this.makeSocketRequest('counter', {
        moveType,
        cardId: twoId,
        opId: this.opponent.id
      });
      this.waitingForOpponentToCounter = true;
    },

    ////////////
    // Sevens //
    ////////////
    async requestPlayPointsSeven({ cardId, index }) {
      await this.makeSocketRequest('seven/points', {
        moveType: MoveType.SEVEN_POINTS,
        cardId,
        index, // 0 if topCard, 1 if secondCard
      });
    },

    async requestScuttleSeven({ cardId, index, targetId }) {
      await this.makeSocketRequest('seven/scuttle', {
        moveType: MoveType.SEVEN_SCUTTLE,
        cardId,
        index,
        targetId,
        opId: this.opponent.id,
      });
    },

    async requestPlayJackSeven({ cardId, index, targetId }) {
      await this.makeSocketRequest('seven/jack', {
        moveType: MoveType.SEVEN_JACK,
        cardId,
        index, // 0 if topCard, 1 if secondCard
        targetId,
        opId: this.opponent.id,
      });
    },

    async requestResolveSevenDoubleJacks({ cardId, index }) {
      this.myTurnToCounter = false;

      await this.makeSocketRequest('seven/jack', {
        moveType: MoveType.SEVEN_DISCARD,
        cardId,
        index, // 0 if topCard, 1 if secondCard
        targetId: -1, // TODO #965 - remove this
        opId: this.opponent.id, // TODO #965 - remove this
      });

    },

    async requestPlayFaceCardSeven({ index, cardId }) {
      await this.makeSocketRequest('seven/faceCard', {
        moveType: MoveType.SEVEN_FACE_CARD,
        cardId,
        index,
      });
    },

    async requestPlayOneOffSeven({ cardId, index }) {
      await this.makeSocketRequest('seven/untargetedOneOff', {
        moveType: MoveType.SEVEN_ONE_OFF,
        cardId,
        index, // 0 if topCard, 1 if secondCard
        opId: this.opponent.id,
      });
      this.waitingForOpponentToCounter = true;
    },

    async requestPlayTargetedOneOffSeven({ cardId, index, targetId, pointId, targetType }) {
      await this.makeSocketRequest('seven/targetedOneOff', {
        moveType: MoveType.SEVEN_ONE_OFF,
        cardId,
        targetId,
        pointId,
        targetType,
        index, // 0 if topCard, 1 if secondCard
        opId: this.opponent.id,
      });
      this.waitingForOpponentToCounter = true;
    },

    async requestPass() {
      const moveType = MoveType.PASS;
      await this.makeSocketRequest('pass', { moveType });
    },

    async requestConcede() {
      await this.makeSocketRequest('concede', { moveType: MoveType.CONCEDE });
    },

    async requestStalemate() {
      await this.makeSocketRequest('stalemate').then(() => {
        this.consideringOpponentStalemateRequest = false;
      });
    },

    async rejectStalemate() {
      await this.makeSocketRequest('reject-stalemate').then(() => {
        this.consideringOpponentStalemateRequest = false;
      });
    },

    async requestUnsubscribeFromGame() {
      return new Promise((resolve, reject) => {
        io.socket.get('/api/game/over', (res, jwres) => {
          if (jwres.statusCode === 200) {
            this.resetState();
          }
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },

    async requestRematch({ gameId, rematch = true }) {
      await this.makeSocketRequest('rematch', { gameId, rematch });
    },

    async requestJoinRematch({ oldGameId }) {
      return new Promise((resolve, reject) => {
        io.socket.get('/api/game/join-rematch', { oldGameId }, (res, jwres) => {
          if (jwres.statusCode === 200) {
            this.resetState();
          }
          return this.handleGameResponse(jwres, resolve, reject);
        });
      });
    },

  }, // End actions
}); // End game store
