import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useGameHistoryStore } from '@/stores/gameHistory';
import { cloneDeep } from 'lodash';
import { io } from '@/plugins/sails.js';
import MoveType from '../../utils/MoveType.json';
import GameStatus from '../../utils/GameStatus.json';
import GamePhase from '../../utils/GamePhase.json';
import { sleep } from '../util/sleep';
import { handleInGameEvents } from '@/plugins/sockets/inGameEvents';

/**
 * @returns number of queens a given player has
 * @param player is the player object
 */
function queenCount(player) {
  if (!player?.faceCards) {
    return 0;
  }
  return player?.faceCards?.reduce((queenCount, card) => queenCount + (card.rank === 12 ? 1 : 0), 0) ?? 0;
}

const compareByRankThenSuit = (card1, card2) => {
  if (card1.isHidden || card2.isHidden) {
    return 0;
  }
  return card1.rank - card2.rank || card1.suit - card2.suit;
};

const setPlayers = (player) => {
  const sortCards = (cards) => {
    return cards?.sort(compareByRankThenSuit);
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
  // Short-circuit hidden cards to leave them as-is
  if (card.isHidden) {
    return card;
  }
  return new GameCard(card);
};

export const useGameStore = defineStore('game', () => {
  // State
  const id = ref(null);
  const chat = ref([]);
  const deck = ref([]);
  const log = ref([]);
  const name = ref(null);
  const p0Ready = ref(false);
  const p1Ready = ref(false);
  const p0Rematch = ref(null);
  const p1Rematch = ref(null);
  const rematchGameId = ref(null);
  const phase = ref(null);
  const passes = ref(0);
  const players = ref([]);
  const spectatingUsers = ref([]);
  const scrap = ref([]);
  const turn = ref(0);
  const twos = ref([]);
  const oneOff = ref(null);
  const oneOffTarget = ref(null);
  const isRanked = ref(false);
  const showIsRankedChangedAlert = ref(false);
  // Threes
  const lastEventCardChosen = ref(null);
  const lastEventPlayerChoosing = ref(false);
  // Fours
  const lastEventDiscardedCards = ref(null);
  // Last Event
  const lastEventChange = ref(null);
  const lastEventOneOffRank = ref(null);
  const lastEventTargetType = ref(null);
  const lastEventPlayedBy = ref(null);
  // GameOver
  const gameIsOver = ref(false);
  const winnerPNum = ref(null);
  const conceded = ref(false);
  const currentMatch = ref(null);
  const iWantToContinueSpectating = ref(false);
  const status = ref(GameStatus.ARCHIVED);

  // Stores
  const authStore = useAuthStore();
  const gameHistoryStore = useGameHistoryStore();

  // Computed (getters)
  const myPNum = computed(() => {
    if (gameHistoryStore.isSpectating) {
      return 0;
    }
    const pNum = players.value.findIndex(({ username }) => username === authStore.username);
    return pNum > -1 ? pNum : null;
  });
  const player = computed(() => players.value[myPNum.value]);
  const playerPointTotal = computed(() => player.value?.points?.reduce((total, card) => total + card.rank, 0) || 0);
  const playerQueenCount = computed(() => queenCount(player.value));
  const playerUsername = computed(() => player.value?.username ?? null);
  const opponent = computed(() => players.value.length < 2 ? null : players.value[(myPNum.value + 1) % 2]);
  const opponentIsReady = computed(() => opponent.value ? (myPNum.value === 0 ? p1Ready.value : p0Ready.value) : null);
  const opponentUsername = computed(() => opponent.value?.username ?? null);
  const opponentPointTotal = computed(() => opponent.value?.points?.reduce((total, card) => total + card.rank, 0) || 0);
  const opponentQueenCount = computed(() => queenCount(opponent.value));
  const playerWins = computed(() => gameIsOver.value && winnerPNum.value === myPNum.value);
  const resolvingSeven = computed(() => phase.value === GamePhase.RESOLVING_SEVEN);
  const isPlayersTurn = computed(() => turn.value % 2 === myPNum.value);
  const hasGlassesEight = computed(() => player.value?.faceCards?.filter((card) => card.rank === 8).length > 0 ?? false);
  const iWantRematch = computed(() => {
    if (myPNum.value === null) {
      return false;
    }
    const key = myPNum.value === 0 ? p0Rematch : p1Rematch;
    return key.value;
  });
  const opponentWantsRematch = computed(() => {
    if (myPNum.value === null) {
      return false;
    }
    const key = myPNum.value === 0 ? p1Rematch : p0Rematch;
    return key.value;
  });
  const opponentDeclinedRematch = computed(() => opponentWantsRematch.value === false);
  const someoneDeclinedRematch = computed(() => iWantRematch.value === false || opponentDeclinedRematch.value);
  const waitingForOpponentToCounter = computed(() => {
    const counteringPhase = phase.value === GamePhase.COUNTERING;
    const numTwosIsEven = twos.value.length % 2 === 0;
    return counteringPhase && isPlayersTurn.value === numTwosIsEven;
  });
  const myTurnToCounter = computed(() => {
    const counteringPhase = phase.value === GamePhase.COUNTERING;
    const numTwosIsEven = twos.value.length % 2 === 0;
    return counteringPhase && isPlayersTurn.value !== numTwosIsEven;
  });
  const waitingForOpponentToPickFromScrap = computed(() => phase.value === GamePhase.RESOLVING_THREE && !isPlayersTurn.value);
  const pickingFromScrap = computed(() => phase.value === GamePhase.RESOLVING_THREE && isPlayersTurn.value);
  const showResolveFour = computed(() => phase.value === GamePhase.RESOLVING_FOUR && !isPlayersTurn.value);
  const waitingForOpponentToDiscard = computed(() => {
    switch (phase.value) {
      case GamePhase.RESOLVING_FOUR:
        return isPlayersTurn.value;
      case GamePhase.RESOLVING_FIVE:
        return !isPlayersTurn.value;
      default:
        return false;
    }
  });
  const showResolveFive = computed(() => phase.value === GamePhase.RESOLVING_FIVE && isPlayersTurn.value);
  const playingFromDeck = computed(() => phase.value === GamePhase.RESOLVING_SEVEN && isPlayersTurn.value);
  const waitingForOpponentToPlayFromDeck = computed(() => phase.value === GamePhase.RESOLVING_SEVEN && !isPlayersTurn.value);
  const waitingForOpponentToStalemate = computed(() => phase.value === GamePhase.CONSIDERING_STALEMATE && lastEventPlayedBy.value === myPNum.value);
  const consideringOpponentStalemateRequest = computed(() => phase.value === GamePhase.CONSIDERING_STALEMATE && lastEventPlayedBy.value !== myPNum.value);
  const topCard = computed(() => deck.value[0] ?? null);
  const secondCard = computed(() => deck.value[1] ?? null);

  // Actions
  function updateGame(newGame) {
    lastEventChange.value = newGame.lastEvent?.change ?? null;
    lastEventOneOffRank.value = newGame.lastEvent?.oneOff?.rank ?? null;
    lastEventTargetType.value = newGame.lastEvent?.oneOffTargetType ?? null;
    lastEventCardChosen.value = newGame.lastEvent?.chosenCard ?? null;
    lastEventPlayerChoosing.value = newGame.lastEvent?.pNum === myPNum.value ?? null;
    lastEventDiscardedCards.value = newGame.lastEvent?.discardedCards ?? null;
    lastEventPlayedBy.value = newGame.lastEvent?.pNum ?? null;
    id.value = newGame.id ?? id.value;
    turn.value = newGame.turn ?? turn.value;
    deck.value = newGame.deck?.map((card) => createGameCard(card)) ?? deck.value;
    scrap.value = newGame.scrap?.map((card) => createGameCard(card)) ?? scrap.value;
    log.value = cloneDeep(newGame.log) ?? log.value;
    name.value = newGame.name ?? name.value;
    p0Ready.value = newGame.p0Ready ?? p0Ready.value;
    p1Ready.value = newGame.p1Ready ?? p1Ready.value;
    passes.value = newGame.passes ?? passes.value;
    players.value = newGame.players?.map((player) => setPlayers(player)) ?? players.value;
    spectatingUsers.value = newGame.spectatingUsers ?? spectatingUsers.value;
    twos.value = newGame.twos?.map((card) => createGameCard(card)) ?? twos.value;
    oneOff.value = createGameCard(newGame.oneOff) ?? null;
    oneOffTarget.value = createGameCard(newGame.oneOffTarget) ?? null;
    isRanked.value = newGame.isRanked ?? isRanked.value;
    currentMatch.value = newGame.currentMatch ?? currentMatch.value;
    p0Rematch.value = newGame.p0Rematch ?? null;
    p1Rematch.value = newGame.p1Rematch ?? null;
    rematchGameId.value = newGame.rematchGame ?? null;
    gameIsOver.value = newGame.gameIsOver ?? false;
    status.value = newGame.status ?? GameStatus.ARCHIVED;
    phase.value = newGame.phase ?? GamePhase.MAIN;
    gameHistoryStore.gameStates = newGame.gameStates ?? [];
  }
  function opponentJoined(newPlayer) {
    players.value.push(cloneDeep(newPlayer));
    players.value.sort((player, opponent) => player.pNum - opponent.pNum);
  }
  function removeSpectator(username) {
    spectatingUsers.value = spectatingUsers.value.filter((spectator) => spectator !== username);
  }
  function resetState() {
    id.value = null;
    chat.value = [];
    deck.value = [];
    log.value = [];
    name.value = null;
    p0Ready.value = false;
    p1Ready.value = false;
    p0Rematch.value = null;
    p1Rematch.value = null;
    rematchGameId.value = null;
    phase.value = null;
    passes.value = 0;
    players.value = [];
    spectatingUsers.value = [];
    scrap.value = [];
    turn.value = 0;
    twos.value = [];
    oneOff.value = null;
    oneOffTarget.value = null;
    isRanked.value = false;
    showIsRankedChangedAlert.value = false;
    lastEventCardChosen.value = null;
    lastEventPlayerChoosing.value = false;
    lastEventDiscardedCards.value = null;
    lastEventChange.value = null;
    lastEventOneOffRank.value = null;
    lastEventTargetType.value = null;
    lastEventPlayedBy.value = null;
    gameIsOver.value = false;
    winnerPNum.value = null;
    conceded.value = false;
    currentMatch.value = null;
    iWantToContinueSpectating.value = false;
    status.value = GameStatus.ARCHIVED;
  }
  function updateReady(pNumArg) {
    if (pNumArg === 0) {
      p0Ready.value = !p0Ready.value;
    } else {
      p1Ready.value = !p1Ready.value;
    }
  }
  function opponentLeft() {
    const opponentPnum = opponent.value.pNum;
    if (opponentPnum === 0) {
      p0Ready.value = false;
    } else {
      p1Ready.value = false;
    }
    players.value = players.value.filter((player) => player.pNum === myPNum.value);
  }
  async function setGameOver({ gameOver, conceded: c, winner, currentMatch: cm }) {
    await sleep(1000);
    gameIsOver.value = gameOver;
    conceded.value = c;
    winnerPNum.value = winner;
    currentMatch.value = cm;
  }
  function setRematch({ pNum: p, rematch }) {
    if (p === 0) {
      p0Rematch.value = rematch;
    } else {
      p1Rematch.value = rematch;
    }
  }
  async function processScuttle({ game, playedCard, targetCard, playedBy }) {
    if (!player.value) {
      updateGame(game);
      return;
    }
    const scuttlingPlayer = players.value[playedBy];
    const scuttledPlayer = players.value[(playedBy + 1) % 2];
    const playedCardIndex = scuttlingPlayer.hand.findIndex((card) => card.id === playedCard.id);
    const targetCardIndex = scuttledPlayer.points.findIndex((card) => card.id === targetCard.id);

    if (targetCardIndex === -1) {
      updateGame(game);
      return;
    }

    scuttlingPlayer.hand.splice(playedCardIndex, 1);

    const targetCardOnField = scuttledPlayer.points[targetCardIndex];
    targetCardOnField.scuttledBy = playedCard;
    await sleep(1000);
    updateGame(game);
  }
  async function processThrees(chosenCard, game) {
    phase.value = GamePhase.MAIN;
    lastEventCardChosen.value = chosenCard;
    await sleep(1000);
    updateGame(game);
  }
  async function processFours(discardedCards, game) {
    phase.value = GamePhase.MAIN;
    lastEventDiscardedCards.value = discardedCards;
    await sleep(1000);
    updateGame(game);
  }
  async function processFives(discardedCards, game) {
    phase.value = GamePhase.MAIN;
    lastEventDiscardedCards.value = discardedCards;
    if (discardedCards?.length) {
      await sleep(1000);
      opponent.value.hand = opponent.value.hand.filter((card) => !discardedCards.includes(card.id));
      player.value.hand = player.value.hand.filter((card) => !discardedCards.includes(card.id));
      await sleep(1000);
    }
    updateGame(game);
  }
  function handleGameResponse(jwres, resolve, reject) {
    switch (jwres.statusCode) {
      case 200:
        return resolve(jwres);
      case 401:
        authStore.mustReauthenticate = true;
        return reject(jwres.body.message);
      default:
        return reject(jwres.body.message);
    }
  }
  function transformGameUrl(slug) {
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
      case 'stalemate':
      case 'stalemate-accept':
      case 'stalemate-reject':
        return `/api/game/${id.value}/move`;
      case 'rematch':
        return `/api/game/${id.value}/rematch`;
      default:
        return `/api/game/${slug}`;
    }
  }
  function makeSocketRequest(slug, data, method = 'POST') {
    const url = transformGameUrl(slug);
    return new Promise((resolve, reject) => {
      io.socket.request(
        {
          method,
          url,
          data,
        },
        (_res, jwres) => {
          return handleGameResponse(jwres, resolve, reject);
        },
      );
    });
  }
  async function requestSubscribe(gameId) {
    return new Promise((resolve, reject) => {
      io.socket.post(
        `/api/game/${gameId}/join`,
        (res, jwres) => {
          if (jwres.statusCode === 200) {
            resetState();
            updateGame(res.game);
            return resolve(res);
          }
          const message = res.message ?? 'error subscribing';
          return reject(new Error(message));
        },
      );
    });
  }
  function requestGameState(gameId, gameStateIndex = -1, route = null) {
    return new Promise((resolve, reject) => {
      io.socket.get(`/api/game/${gameId}?gameStateIndex=${gameStateIndex}`, (res, jwres) => {
        switch (jwres.statusCode) {
          case 200:
            resetState();
            updateGame(res.game);
            return handleInGameEvents(res, route).then(() => {
              return resolve(res);
            });
          case 401:
            authStore.mustReauthenticate = true;
            return resolve(jwres.body.message);
          default:
            return reject(jwres.body.message);
        }
      });
    });
  }
  async function requestSpectate(gameId, gameStateIndex = 0, route = null) {
    const slug = `${gameId}/spectate?gameStateIndex=${gameStateIndex}`;
    try {
      resetState();
      const res = await makeSocketRequest(slug, {});
      updateGame(res.body.game);
      return handleInGameEvents(res.body, route);
    } catch (err) {
      if (authStore.mustReauthenticate) {
        id.value = gameId;
        return;
      }
      const message = err?.message ?? err ?? `Unable to spectate game ${gameId}`;
      throw (new Error(message));
    }
  }
  async function requestSpectateLeave() {
    return new Promise((resolve, reject) => {
      io.socket.delete(`/api/game/${id.value}/spectate`, (_res, jwres) => {
        if (jwres.statusCode === 200) {
          resetState();
          return resolve();
        }
        return reject(new Error('Error leaving game as spectator'));
      });
    });
  }
  async function requestLeaveLobby() {
    return new Promise((resolve, reject) => {
      io.socket.post(`/api/game/${id.value}/leave`, (res, jwres) => {
        if (jwres.statusCode === 200) {
          resetState();
          return resolve();
        }
        return reject(new Error('Error leaving lobby'));
      });
    });
  }
  async function requestReady() {
    return new Promise((resolve, reject) => {
      io.socket.post(`/api/game/${id.value}/ready`, (res, jwres) => {
        if (jwres.statusCode === 200) {
          return resolve();
        }
        if (jwres.statusCode === 409) {
          return reject({ message: res.message, gameId: id.value, code: res.code });
        }
        return reject(new Error('Error readying for game'));
      });
    });
  }
  async function requestSetIsRanked({ isRanked: isRankedArg }) {
    return new Promise((resolve, reject) => {
      io.socket.patch(
        `/api/game/${id.value}/is-ranked`,
        {
          isRanked: isRankedArg,
        },
        (res, jwres) => {
          if (jwres.statusCode === 200) {
            return resolve(res);
          }
          const modeName = isRankedArg ? 'ranked' : 'casual';
          return reject(new Error(`Unable to change game to ${modeName}`));
        },
      );
    });
  }
  async function requestDrawCard() {
    const moveType = MoveType.DRAW;
    await makeSocketRequest('draw', { moveType });
  }
  async function requestPlayPoints(cardIdArg) {
    const moveType = MoveType.POINTS;
    await makeSocketRequest('points', { moveType, cardId: cardIdArg });
  }
  async function requestPlayFaceCard(cardIdArg) {
    const moveType = MoveType.FACE_CARD;
    await makeSocketRequest('faceCard', { moveType, cardId: cardIdArg });
  }
  async function requestScuttle(cardData) {
    const moveType = MoveType.SCUTTLE;
    const { cardId, targetId } = cardData;
    await makeSocketRequest('scuttle', { moveType, cardId, targetId });
  }
  async function requestPlayOneOff(cardIdArg) {
    const moveType = MoveType.ONE_OFF;
    await makeSocketRequest('untargetedOneOff', { moveType, cardId: cardIdArg });
    return Promise.resolve();
  }
  async function requestPlayTargetedOneOff({ cardId, targetId, pointId, targetType }) {
    const moveType = MoveType.ONE_OFF;
    await makeSocketRequest('targetedOneOff', { moveType, cardId, targetId, pointId, targetType });
  }
  async function requestPlayJack({ cardId, targetId }) {
    const moveType = MoveType.JACK;
    await makeSocketRequest('jack', { moveType, cardId, targetId });
  }
  async function requestDiscard({ cardId1, cardId2 }) {
    const moveType = MoveType.RESOLVE_FOUR;
    const reqData = cardId2 ? { moveType, cardId1, cardId2 } : { moveType, cardId1 };
    await makeSocketRequest('resolveFour', reqData);
  }
  async function requestResolve() {
    const moveType = MoveType.RESOLVE;
    await makeSocketRequest('resolve', { moveType });
  }
  async function requestResolveThree(cardIdArg) {
    const moveType = MoveType.RESOLVE_THREE;
    await makeSocketRequest('resolveThree', { moveType, cardId: cardIdArg });
  }
  async function requestResolveFive(cardIdArg) {
    const moveType = MoveType.RESOLVE_FIVE;
    await makeSocketRequest('resolveFive', { moveType, cardId: cardIdArg });
  }
  async function requestCounter(twoId) {
    const moveType = MoveType.COUNTER;
    await makeSocketRequest('counter', { moveType, cardId: twoId });
  }
  async function requestPlayPointsSeven({ cardId, index }) {
    await makeSocketRequest('seven/points', { moveType: MoveType.SEVEN_POINTS, cardId, index });
  }
  async function requestScuttleSeven({ cardId, index, targetId }) {
    await makeSocketRequest('seven/scuttle', { moveType: MoveType.SEVEN_SCUTTLE, cardId, index, targetId });
  }
  async function requestPlayJackSeven({ cardId, index, targetId }) {
    await makeSocketRequest('seven/jack', { moveType: MoveType.SEVEN_JACK, cardId, index, targetId });
  }
  async function requestResolveSevenDoubleJacks({ cardId, index }) {
    await makeSocketRequest('seven/jack', { moveType: MoveType.SEVEN_DISCARD, cardId, index });
  }
  async function requestPlayFaceCardSeven({ index, cardId }) {
    await makeSocketRequest('seven/faceCard', { moveType: MoveType.SEVEN_FACE_CARD, cardId, index });
  }
  async function requestPlayOneOffSeven({ cardId, index }) {
    await makeSocketRequest('seven/untargetedOneOff', { moveType: MoveType.SEVEN_ONE_OFF, cardId, index });
  }
  async function requestPlayTargetedOneOffSeven({ cardId, index, targetId, pointId, targetType }) {
    await makeSocketRequest('seven/targetedOneOff', { moveType: MoveType.SEVEN_ONE_OFF, cardId, targetId, pointId, targetType, index });
  }
  async function requestPass() {
    const moveType = MoveType.PASS;
    await makeSocketRequest('pass', { moveType });
  }
  async function requestConcede() {
    await makeSocketRequest('concede', { moveType: MoveType.CONCEDE });
  }
  async function requestStalemate() {
    await makeSocketRequest('stalemate', { moveType: MoveType.STALEMATE_REQUEST });
  }
  async function acceptStalemate() {
    await makeSocketRequest('stalemate-accept', { moveType: MoveType.STALEMATE_ACCEPT });
  }
  async function rejectStalemate() {
    await makeSocketRequest('stalemate-reject', { moveType: MoveType.STALEMATE_REJECT });
  }
  async function requestUnsubscribeFromGame() {
    return new Promise((resolve, reject) => {
      io.socket.get('/api/game/over', (res, jwres) => {
        if (jwres.statusCode === 200) {
          resetState();
        }
        return handleGameResponse(jwres, resolve, reject);
      });
    });
  }
  async function requestRematch({ gameId: gameIdArg, rematch = true }) {
    await makeSocketRequest('rematch', { gameId: gameIdArg, rematch });
  }

  function addSpectator(username) {
    if (!username) {
      return;
    }
    if (!spectatingUsers.value.includes(username)) {
      spectatingUsers.value.push(username);
    }
  }

  return {
    // State
    id,
    chat,
    deck,
    log,
    name,
    p0Ready,
    p1Ready,
    p0Rematch,
    p1Rematch,
    rematchGameId,
    phase,
    passes,
    players,
    spectatingUsers,
    scrap,
    turn,
    twos,
    topCard,
    secondCard,
    oneOff,
    oneOffTarget,
    isRanked,
    showIsRankedChangedAlert,
    lastEventCardChosen,
    lastEventPlayerChoosing,
    lastEventDiscardedCards,
    lastEventChange,
    lastEventOneOffRank,
    lastEventTargetType,
    lastEventPlayedBy,
    gameIsOver,
    winnerPNum,
    conceded,
    currentMatch,
    iWantToContinueSpectating,
    status,
    // Getters
    myPNum,
    player,
    playerPointTotal,
    playerQueenCount,
    playerUsername,
    opponent,
    opponentIsReady,
    opponentUsername,
    opponentPointTotal,
    opponentQueenCount,
    playerWins,
    resolvingSeven,
    isPlayersTurn,
    hasGlassesEight,
    iWantRematch,
    opponentWantsRematch,
    opponentDeclinedRematch,
    someoneDeclinedRematch,
    waitingForOpponentToCounter,
    myTurnToCounter,
    waitingForOpponentToPickFromScrap,
    pickingFromScrap,
    showResolveFour,
    waitingForOpponentToDiscard,
    showResolveFive,
    playingFromDeck,
    waitingForOpponentToPlayFromDeck,
    waitingForOpponentToStalemate,
    consideringOpponentStalemateRequest,
    // Actions
    updateGame,
    opponentJoined,
    removeSpectator,
    resetState,
    updateReady,
    opponentLeft,
    setGameOver,
    setRematch,
    processScuttle,
    processThrees,
    processFours,
    processFives,
    handleGameResponse,
    transformGameUrl,
    makeSocketRequest,
    requestSubscribe,
    requestGameState,
    requestSpectate,
    requestSpectateLeave,
    requestLeaveLobby,
    requestReady,
    requestSetIsRanked,
    requestDrawCard,
    requestPlayPoints,
    requestPlayFaceCard,
    requestScuttle,
    requestPlayOneOff,
    requestPlayTargetedOneOff,
    requestPlayJack,
    requestDiscard,
    requestResolve,
    requestResolveThree,
    requestResolveFive,
    requestCounter,
    requestPlayPointsSeven,
    requestScuttleSeven,
    requestPlayJackSeven,
    requestResolveSevenDoubleJacks,
    requestPlayFaceCardSeven,
    requestPlayOneOffSeven,
    requestPlayTargetedOneOffSeven,
    requestPass,
    requestConcede,
    requestStalemate,
    acceptStalemate,
    rejectStalemate,
    requestUnsubscribeFromGame,
    requestRematch,
    addSpectator,
  };
});
// End game store
