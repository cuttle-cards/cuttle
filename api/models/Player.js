/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    id: {
      type: 'number',
      required: true,
    },
    pNum: {
      type: 'number',
      allowNull: true,
      isIn: [0, 1],
    },
    hand: {
      //collection: 'card',
      type: 'ref',
    },
    points: {
      //collection: 'card',
      type: 'ref',
    },
    faceCards: {
      //collection: 'card',
      type: 'ref',
    },
  }, // end attributes
}; // end exports
