module.exports = {
  friendlyName: 'Is your chance to counter',

  description:
    "Verifies whether it is the requesting player's opportunity to counter. Returns `true` if so and `false` otherwise",

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move',
      required: true,
    },
  },
  sync: true,
  fn: ({ currentState, playedBy }, exits) => {
    // It's your chance if it is your turn and there are an odd number of twos
    // or if it's your opponent's turn and there are an even number of twos
    // (since the opponent of the person who played the one-off counters first)
    const isYourTurn = currentState.turn % 2 === playedBy;
    const numTwosIsEven = currentState.twos.length % 2 === 0;
    const res = isYourTurn !== numTwosIsEven;

    return exits.success(res);
  },
};
