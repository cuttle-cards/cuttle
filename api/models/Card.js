/**
 * Card.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    suit: {
      type: 'number',
    },

    rank: {
      type: 'number',
    },
    deck: {
      model: 'game',
    },

    scrap: {
      model: 'game',
    },

    twos: {
      model: 'game',
    },

    hand: {
      model: 'user',
    },

    points: {
      model: 'user',
    },

    faceCards: {
      model: 'user',
    },
    //Used to order attachments
    index: {
      type: 'number',
    },

    attachments: {
      collection: 'card',
      via: 'attachedTo',
    },

    attachedTo: {
      model: 'card',
    },

    // Used to track if this card is targeted
    //by a one-off
    targeted: {
      model: 'game',
    },

    //FKs to gamestate
    deckGst: {
      model: 'gameState',
    },
    scrapGst: {
      model: 'gameState',
    },
    twosGst: {
      model: 'gameState',
    },

    handGst: {
      model: 'player',
    },
    pointsGst: {
      model: 'player',
    },

    faceCardsGst: {
      model: 'player',
    },
  }
};
