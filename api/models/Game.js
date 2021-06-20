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
  	status: {
  		type: 'boolean',
  		defaultsTo: true,
  	},
    players: {
      collection: 'user',
      via: 'game',
    },
    p0Ready: {
      type: 'boolean',
      defaultsTo: false
    },
    p1Ready: {
      type: 'boolean',
      defaultsTo: false
    },
    passes: {
      type: 'number',
      defaultsTo: 0
    },
    deck: {
      collection: 'card',
      via: 'deck'
    },
    topCard: {
      model: 'card',
    },
    secondCard: {
      model: 'card',
    },
    scrap: {
      collection: 'card',
      via: 'scrap'
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
      type: 'string'
    },
    attachedToTarget: {
      model: 'card',
    },
    twos: {
      collection: 'card',
      via: 'twos'
    },
    turn: {
      type: 'number',
      defaultsTo: 0
    },
    log: {
      type: 'ref',
      defaultsTo: []
    },

    chat: {
      type: 'ref',
      defaultsTo: []
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
    /**
     *  Enum for game result:
     * -1: incomplete
     * 0: p0 won
     * 1: p1 won
     * 2: stalemate
     */
    result: {
      type: 'number',
      defaultsTo: -1,
    },
  } // end attributes
}; // end exports

