/**
 * Card.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	suit: {
  		type: 'integer'
  	},

  	rank: {
  		type: 'integer'
  	},

  	deck: {
  		model: 'game'
  	},

  	scrap: {
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

    attachments: {
      collection: 'card',
      via: 'attachedTo'
    },

    attachedTo: {
    	model: 'card'
    }
  }
};

