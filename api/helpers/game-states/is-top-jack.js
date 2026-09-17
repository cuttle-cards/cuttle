module.exports = {
  friendlyName: 'Is top jack',

  description: 'Determines whether the specified jack is the top of the stack attached to the point card it is stealing',

  extendedDescription:
    'Only the top jack of a stack may be targeted by a nine, since removing a buried jack would leave the remaining stack in an order that never occurred.',

  inputs: {
    targetId: {
      type: 'string',
      description: 'String ID of the jack to check',
      required: true,
      example: 'JS', // Jack of Spades
    },
    /**
     * @param { Player } player - the player whose points should contain the jack's host
     * @param { Card[] } player.points - the player's point cards -- can contain attachments
     */
    player: {
      type: 'ref',
      descriptions: 'Player object from the current game state',
      required: true,
    },
  },
  sync: true,
  fn: ({ targetId, player }, exits) => {
    const host = player.points.find(({ attachments }) => attachments.some(({ id }) => id === targetId));

    return exits.success(host?.attachments.at(-1).id === targetId);
  },
};
