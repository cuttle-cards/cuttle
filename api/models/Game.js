/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

const { CURRENT_RULES_VERSION } = require('../../utils/rulesVersion');

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
    isVsAi: {
      type: 'boolean',
      defaultsTo: false,
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
    log: {
      type: 'ref',
      columnType: 'text[]',
      defaultsTo: [],
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
    /**
     * Semver of the core rule set this game was played under (see utils/rulesVersion.js).
     * Defaults to the current version at creation time so every game records its rules.
     * Future orthogonal rule mods (e.g. jokers) will be tracked in a separate ruleVariants column.
     */
    rulesVersion: {
      type: 'string',
      defaultsTo: CURRENT_RULES_VERSION,
    },
    p0: {
      model: 'user',
    },
    p1: {
      model: 'user',
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
