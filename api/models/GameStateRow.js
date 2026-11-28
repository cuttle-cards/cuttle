const GamePhase = require('../../utils/GamePhase.json');
/**
 * GameState.js
 *
 * @description :: A GameState record represents one move made by a player and the resulting game state
 * Each card is specified by a String id that describes the cards suit and rank, as follows
 *
 * SUIT: ‘C’ (Clubs), ‘D’ (Diamonds), ‘H’ (Hearts), ‘S’ (Spades)
 * RANK: ‘A’ (Ace), ‘2’, ‘3’, ‘4’, ‘5’, ‘6’, ‘7’, ‘8’, ‘9’, ‘T’ (Ten), ‘J’ (Jack), ‘Q’ (Queen), ‘K’ (King)
 *
 * So ‘AC’ is the Ace of Clubs, ‘4D’ is the Four of Diamonds, and ‘TH’ is the Ten of Hearts
 *
 * Cards attached to a card (jacks) are listed in parentheses, bottom to top, and '-pN' suffixes
 * record owners the column can't: e.g. ‘TH-p0(JH-p2,JC)’ in p1Points is p0's Ten of Hearts,
 * jacked by p2 and then by p1. Rows written before this format use a legacy encoding
 * (e.g. ‘TH(JH-p0,JC-p1)’), detected by the missing host suffix.
 *
 * See 'Game State Array<String> Lists' in docs/game-state-api.md for the formal grammar
 */

module.exports = {
  attributes: {
    // FK to the games table
    gameId: {
      model: 'game',
      required: true,
    },
    // Which player made the move (0 if p0, 1 if p1)
    playedBy: {
      type: 'number',
      isIn: [ 0, 1 ],
      required: true,
    },
    moveType: {
      type: 'string',
      required: true,
      columnType: 'text',
    },
    // The card that was played
    playedCard: {
      type: 'string',
      allowNull: true,
      columnType: 'text',
    },
    // The card that was targeted
    targetCard: {
      type: 'string',
      allowNull: true,
      columnType: 'text',
    },
    // Cards discarded for a 4 or 5
    discardedCards: {
      type: 'json',
      defaultsTo: [],
      columnType: 'jsonb',
    },
    // Cards the victim of a 4 revealed from their hand, pending the caster's choice of two to discard.
    // Prod/staging add it with DEFAULT '[]', which backfills rows saved before the column existed
    fourRevealedCards: {
      type: 'json',
      defaultsTo: [],
      columnType: 'jsonb',
    },
    // Cards in a hand or the deck that both players have seen, so neither needs to remember them.
    // Prod/staging add it with DEFAULT '[]', which backfills rows saved before the column existed
    revealedCards: {
      type: 'json',
      defaultsTo: [],
      columnType: 'jsonb',
    },
    // Which turn number the move was made on
    turn: {
      type: 'number',
      required: true,
      columnType: 'int4',
    },
    /**
     * Enum for phase:
     * 1 - MAIN
     * 2 - COUNTERING
     * 3 - RESOLVING_THREE
     * 4 - RESOLVING_FOUR (legacy; rules < 3.0.0 only -- fours resolve immediately now)
     * 5 - RESOLVING_FIVE
     * 6 - DISCARDING_TO_HAND_LIMIT
     * 7 - RESOLVING_SEVEN
     * 8 - RESOLVING_FOUR_REVEAL (the four's victim reveals three cards from hand)
     * 9 - RESOLVING_FOUR_DISCARD (the four's caster chooses two revealed cards to discard)
     */
    phase: {
      type: 'number',
      required: true,
      isIn: Object.values(GamePhase),
    },
    // Cards in p0’s hand
    p0Hand: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // Cards in p1’s hand
    p1Hand: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // Cards in p0’s points
    p0Points: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // Cards in p1’s points
    p1Points: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // Cards in p0’s face cards
    p0FaceCards: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // Cards in p1’s face cards
    p1FaceCards: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // Cards in the deck, in order
    deck: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // Cards in the scrap
    scrap: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // One-off card
    oneOff: {
      type: 'string',
      allowNull: true,
    },
    // One-off target card
    oneOffTarget: {
      type: 'string',
      allowNull: true,
    },
    oneOffTargetType: {
      type: 'string',
      allowNull: true,
      isIn: [ 'point', 'jack', 'faceCard' ],
    },
    // Twos
    twos: {
      type: 'json',
      columnType: 'jsonb',
      required: true,
    },
    // Resolved card
    resolved: {
      type: 'string',
      allowNull: true,
    },
  },
};
