const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Validate request to resolve five',

  description: 'Verifies whether a request to resolve a five is legal, throwing explanatory error if not.',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    /**
     * @param { Object } requestedMove - Object describing the request to resolve five
     * @param { String } [requestedMove.cardId] - Card to discard (optional if no cards in hand)
     * @param { MoveType.RESOLVE_FIVE } requestedMove.moveType - Specifies that this a Resolve Five move
     */
    requestedMove: {
      type: 'ref',
      description: 'Object containing data needed for current move',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move',
      required: true,
    },
  },
  sync: true,
  fn: ({ requestedMove, currentState, playedBy }, exits) => {
    try {
      const playerKey = playedBy ? 'p1' : 'p0';
      const opponentKey = playedBy ? 'p0' : 'p1';

      // 1. Overiť, že fáza hry je správna
      if (currentState.phase !== GamePhase.RESOLVE_FIVE) {
        throw new Error('game.snackbar.oneOffs.five.incorrectCard');
      }

      // 2. Overiť, že je na rade hráča, ktorý hral kartu "5"
      if (currentState.turn % 2 !== playedBy) {
        throw new Error('game.snackbar.global.notYourTurn');
      }

      // 3. Ak má hráč karty v ruke, musí zadať kartu na odhodenie
      const playerHand = currentState[playerKey].hand;
      if (playerHand.length > 0 && !requestedMove.cardId) {
        throw new Error('game.snackbar.oneOffs.five.selectCardToDiscard');
      }

      // 4. Overiť, že karta, ktorú chce hráč odhodiť, je v jeho ruke (ak ju poskytol)
      if (requestedMove.cardId && !playerHand.find(({ id }) => id === requestedMove.cardId)) {
        throw new Error('You must discard a card from your hand');
      }

      // 5. Overiť, že balíček nie je prázdny (hráč musí mať možnosť ťahať karty)
      if (currentState.deck.length === 0) {
        throw new Error('game.snackbar.oneOffs.five.fiveDeckIsEmpty');
      }

      // Ak prejde všetkými kontrolami, validácia je úspešná
      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
