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
  		required: true,
  	},
    players: {
      collection: 'user',
      via: 'game',
      defaultsTo: [],
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
      type: 'integer',
      defaultsTo: 0
    },
    deck: {
      collection: 'card',
      via: 'deck'
    },
    topCard: {
      model: 'card',
      via: 'topCard'
    },
    secondCard: {
      model: 'card',
      via: 'secondCard'
    },
    scrap: {
      collection: 'card',
      via: 'scrap'
    },
    oneOff: {
      model: 'card',
      via: 'oneOff'
    },
    resolving: {
      model: 'card',
      via: 'resolving'
    },
    oneOffTarget: {
      model: 'card',
      via: 'targeted'
    },
    oneOffTargetType: {
      type: 'string'
    },
    attachedToTarget: {
      model: 'card',
      via: 'attachedToTarget'
    },
    twos: {
      collection: 'card',
      via: 'twos'
    },
    turn: {
      type: 'integer',
      defaultsTo: 0
    },
    log: {
      type: "array",
      defaultsTo: []
    },
    chat: {
      type: "array",
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
    /**
     *  Enum for game result:
     * -1: incomplete
     * 0: p0 won
     * 1: p1 won
     * 2: stalemate
     */
    result: {
      type: 'integer',
      defaultsTo: -1,
    },
  } // end attributes
}; // end exports

