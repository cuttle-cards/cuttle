/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    username: {
      type: 'string',
      required: true,
    },
    encryptedPassword: {
      type: 'string',
      required: true,
    },
    game: {
      model: 'game',
    },
    /**
     * Index of this user within a Game's players collection
     * @value null iff not in game
     * @value 0 or 1 if player 0 or player 1, respectively
     */
    pNum: {
      type: 'number',
      allowNull: true,
      isIn: [ 0, 1 ],
    },
    hand: {
      collection: 'card',
      via: 'hand',
    },
    points: {
      collection: 'card',
      via: 'points',
    },
    faceCards: {
      collection: 'card',
      via: 'faceCards',
    },
    /**
     * Id of a card in player's hand that cannot be played this turn
     * @value null iff no card is frozen
     */
    frozenId: {
      model: 'card',
    },
    rank: {
      type: 'number',
      defaultsTo: 1000,
    },
  }, // end attributes
}; // end exports
