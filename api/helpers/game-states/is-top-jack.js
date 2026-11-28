module.exports = {
  friendlyName: 'Is top jack',

  description: 'Determines whether the specified jack is the top of the stack attached to the point card it is stealing',

  extendedDescription:
    'Only the top stealer of a stack may be targeted, by anything. This is a deliberate rule of the game, not a limitation of how stacks are stored -- do not remove the check because ownership is now recorded per card.',

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
    return exits.success(player.points.some(({ attachments }) => attachments.at(-1)?.id === targetId));
  },
};
