const TargetType = require('../../../utils/TargetType.json');

module.exports = {
  friendlyName: 'Find target card',

  description: "Finds card specified by its ID on the requested player's board. Returns null if not found",

  inputs: {
    targetId: {
      type: 'string',
      description: 'String ID of the card to find',
      required: true,
      example: 'AS', // Ace of Spades
    },
    targetType: {
      type: 'ref', // TargetType enum
      description: 'Whether the target card is a point card, face card, or jack',
      default: null,
      required: false,
      example: TargetType.jack,
    },
    /**
     * @param { Player } player - the player whose board should contain the target card
     * @param { Card[] } player.hand - cards in the player's hand
     * @param { Card[] } player.points - the player's point cards -- can contain attachments
     * @param { Card[] } player.faceCards - the player's face cards
     */
    player: {
      type: 'ref',
      descriptions: 'Player object from the current game state',
      required: true,
    },
  },
  sync: true,
  fn: ({ targetId, targetType, player }, exits) => {
    switch (targetType) {
      case TargetType.point:
        return exits.success(player.points.find((card) => card.id === targetId) ?? null);

      case TargetType.faceCard:
        return exits.success(player.faceCards.find((card) => card.id === targetId) ?? null);

      case TargetType.jack:
        for (let point of player.points) {
          for (let jack of point.attachments) {
            if (jack.id === targetId) {
              return exits.success(jack);
            }
          }
        }
        return exits.success(null);

      default:
        return exits.success(null);
    }
  },
};
