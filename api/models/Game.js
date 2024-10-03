/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    /**
     *  Enum for status:
     * 1 - NEW (game has been created but has not started)
     * 2 - STARTED (game has been started but has not yet finished)
     * 3 - FINISHED (game has been completed)
     * 4 - ARCHIVED (game has been removed from the list without being started)
     */
    status: {
      type: 'number',
    },
    players: {
      collection: 'user',
      via: 'game',
    },
    p0Ready: {
      type: 'boolean',
      defaultsTo: false,
    },
    p1Ready: {
      type: 'boolean',
      defaultsTo: false,
    },
    p0Rematch: {
      type: 'boolean',
      allowNull: true,
    },
    p1Rematch: {
      type: 'boolean',
      allowNull: true,
    },
    rematchGame: {
      model: 'game',
    },
    passes: {
      type: 'number',
      defaultsTo: 0,
    },
    deck: {
      collection: 'card',
      via: 'deck',
    },
    topCard: {
      model: 'card',
    },
    secondCard: {
      model: 'card',
    },
    scrap: {
      collection: 'card',
      via: 'scrap',
    },
    oneOff: {
      model: 'card',
    },
    resolving: {
      model: 'card',
    },
    oneOffTarget: {
      model: 'card',
    },
    oneOffTargetType: {
      type: 'string',
    },
    // Used to track if which point card
    // the current oneOffTarget is attached to
    // when oneOffTargeet is a jack
    attachedToTarget: {
      model: 'card',
    },
    twos: {
      collection: 'card',
      via: 'twos',
    },
    turn: {
      type: 'number',
      defaultsTo: 0,
    },
    log: {
      type: 'ref',
      columnType: 'text[]',
      defaultsTo: [],
    },
    turnStalemateWasRequestedByP0: {
      type: 'number',
      defaultsTo: -1,
    },
    turnStalemateWasRequestedByP1: {
      type: 'number',
      defaultsTo: -1,
    },
    chat: {
      type: 'ref',
      columnType: 'text[]',
      defaultsTo: [],
    },
    isRanked: {
      type: 'boolean',
      defaultsTo: false,
    },
    p0: {
      model: 'user',
    },
    p1: {
      model: 'user',
    },
    lastEvent: {
      type: 'json',
      defaultsTo: {},
    },
    gameStates: {
      collection: 'gamestaterow',
      via: 'gameId',
    },
    match: {
      model: 'match',
    },
    spectatingUsers: {
      collection: 'userspectatinggame',
      via: 'gameSpectated',
    },
    winner: {
      model: 'user',
    },
    lock: {
      type: 'string',
      allowNull: true,
    },
    // Time game was last locked in millis since epoch
    lockedAt: {
      type: 'ref',
      columnType: 'timestamptz',
    },
  },
}; // end exports
