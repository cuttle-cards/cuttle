  /**
   * GameState.js
   * 
   * @description :: A GameState record represents one move made by a player and the resulting game state
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
     * 6 - UNTARGETED_ONE_OFF
     * 7 - TARGETEDONE_OFF
     * 8 - COUNTER
     * 9 - RESOLVE
     * 10 - RESOLVE_THREE
     * 11 - RESOLVE_FOUR
     * 12 - RESOLVE_FIVE
     * 13 - SEVEN_POINTS
     * 14 - SEVEN_SCUTTLE
     * 15 - SEVEN_FACECARD
     * 16 - SEVEN_JACK
     * 17 - SEVEN_UNTARGETED_ONE_OFF
     * 18 - SEVENTARGETEDONE_OFF
     * 19 - PASS
    */
    moveType: {
      type: 'number',
      isIn: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      required: true,
      columnType: 'int4',
    },
    // The card that was played
    playedCardId: {
      type: 'string',
      allowNull: true,
      columnType: 'text',
    },
    // The card that was targeted
    targetCardId: {
      type: 'string',
      allowNull: true,
      columnType: 'text',
    },
    // The 2nd card that is relevant to the move
    targetCard2Id: {
      type: 'string',
      allowNull: true,
      columnType: 'text',
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
     * 4 - RESOLVING_FOUR
     * 5 - RESOLVING_FIVE
     * 7 - RESOLVING_SEVEN
    */
    phase: {
      type: 'number',
      required: true,
      isIn: [1, 2, 3, 4, 5, 7],
    },
    // Cards in p0’s hand
    p0Hand: {
      type: 'json',
      columnType: 'text[]',
      required: true,
    },
    // Cards in p1’s hand
    p1Hand: {
      type: 'json',
      columnType: 'text[]',
      required: true,
    },
    // Cards in p0’s points
    p0Points: {
      type: 'json',
      columnType: 'text[]',
      required: true,
    },
    // Cards in p1’s points
    p1Points: {
      type: 'json',
      columnType: 'text[]',
      required: true,
    },
    // Cards in p0’s face cards
    p0FaceCards: {
      type: 'json',
      columnType: 'text[]',
      required: true,
    },
    // Cards in p1’s face cards
    p1FaceCards: {
      type: 'json',
      columnType: 'text[]',
      required: true,
    },
    // Cards in the deck, in order
    deck: {
      type: 'json',
      columnType: 'text[]',
      required: true,
    },
    // Cards in the scrap
    scrap: {
      type: 'json',
      columnType: 'text[]',
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
    // Twos
    twos: {
      type: 'json',
      columnType: 'text[]',
      required: true,
    },
    // Resolving card
    resolving: {
      type: 'string',
      allowNull: true,
    },
  },
};
