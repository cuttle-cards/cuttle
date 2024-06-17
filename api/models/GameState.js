/**
 * GameState.js
 * 
 * @description :: A GameState record represents one move made by a player and the resulting game state
 */

module.exports = {
  attributes: {
     // Which player made the move (0 if p0, 1 if p1)
     playedBy: {
      type: 'number',
      isIn: [0, 1],
      required: true,
    },
    /**
     * Enum for moveType:
     * 1 - DRAW
     * 2 - POINTS
     * 3 - SCUTTLE
     * 4 - FACECARD
     * 5 - JACK
     * 6 - UNTARGETEDONEOFF
     * 7 - TARGETEDONEOFF
     * 8 - COUNTER
     * 9 - RESOLVE
     * 10 - RESOLVETHREE
     * 11 - RESOLVEFOUR
     * 12 - RESOLVEFIVE
     * 13 - SEVENPOINTS
     * 14 - SEVENSCUTTLE
     * 15 - SEVENFACECARD
     * 16 - SEVENJACK
     * 17 - SEVENUNTARGETEDONEOFF
     * 18 - SEVENTARGETEDONEOFF
     * 19 - PASS
    */
    moveType: {
      type: 'number',
      required: true,
    },
    // The card that was played
    playedCardId: {
      model: 'card',
    },
    // The card that was targeted
    targetCardId: {
      model: 'card',
    },
    // The 2nd card that is relevant to the move
    targetCard2Id: {
      model: 'card',
    },
    // Which turn number the move was made on
    turn: {
      type: 'number',
      required: true,
    },
    // What phase of a turn the game is currently in
    phase: {
      type: 'string',
      isIn: [
        'main',
        'countering',
        'resolvingThree',
        'resolvingFour',
        'resolvingFive',
        'resolvingSeven'
      ],
      required: true,
    },
    // Cards in p0’s hand
    p0Hand: {
      type: 'json',
      columnType: 'text[]',
    },
    // Cards in p1’s hand
    p1Hand: {
      type: 'json',
      columnType: 'text[]',
    },
    // Cards in p0’s points
    p0Points: {
      type: 'json',
      columnType: 'text[]',
    },
    // Cards in p1’s points
    p1Points: {
      type: 'json',
      columnType: 'text[]',
    },
    // Cards in p0’s face cards
    p0FaceCards: {
      type: 'json',
      columnType: 'text[]',
    },
    // Cards in p1’s face cards
    p1FaceCards: {
      type: 'json',
      columnType: 'text[]',
    },
    // Cards in the deck, in order
    deck: {
      type: 'json',
      columnType: 'text[]',
    },
    // Cards in the scrap
    scrap: {
      type: 'json',
      columnType: 'text[]',
    },
    // One-off card
    oneOff: {
      type: 'string',
    },
    // One-off target card
    oneOffTarget: {
      type: 'string',
    },
    // Twos
    twos: {
      type: 'json',
      columnType: 'text[]',
    },
    // Resolving card
    resolving: {
      type: 'string',
    },
    // FK to the games table
    gameId: {
      model: 'game',
      required: true,
    },
    // When the move took place
    createdAt: {
      type: 'ref',
      columnType: 'timestamp',
      autoCreatedAt: true,
    }
  },
};