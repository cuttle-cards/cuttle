/**
 * Card.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	suit: {
  		type: 'number'
  	},

  	rank: {
  		type: 'number'
  	},

    name: {
      type: 'string'
    },

    ruleText: {
      type: 'string'
    },

    img: {
      type: 'string'
    },

    runeImg: {
      type: 'string'
    },

  	deck: {
  		model: 'game'
  	},

  	scrap: {
  		model: 'game',
  	},

    oneOff: {
      model: 'game'
    },

    resolving: {
      model: 'game'
    },

    twos: {
      model: 'game'
    },
    
    topCard: {
      model: 'game'
    },

    secondCard: {
      model: 'game'
    },

    hand: {
      model: 'user'
    },

    points: {
      model: 'user'
    },

    runes: {
      model: 'user'
    },
    //Used to order attachments
    index: {
      type: 'number',
    },

    attachments: {
      collection: 'card',
      via: 'attachedTo'
    },

    attachedTo: {
    	model: 'card'
    },

    // Used to track if this card is targeted
    //by a one-off
    targeted: {
      model: 'game'
    },

    //Used to track if this card is the point card
    //to which a jack that is targed by a one-off
    //is attached
    attachedToTarget: {
      model: 'game'
    },

  }
};

