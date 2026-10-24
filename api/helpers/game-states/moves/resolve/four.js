const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Resolve Four One-Off',

  description:
    'Returns new GameState resulting from resolving a four: the player resolving it reveals three cards from ' +
    'their hand, of which the four\'s player chooses two for them to discard. Skips whichever of those steps ' +
    'offers no choice: a hand of three is revealed whole, and a hand of two or fewer is discarded outright.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the four resolves',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    }
  },

  sync: true, // synchronous helper
  fn: ({ currentState, playedBy }, exits) => {
    const result = _.cloneDeep(currentState);

    // The player resolving the one-off is the opposite of the one who played it, so `playedBy`
    // identifies the player whose hand is discarded -- not the four's caster.
    const victim = playedBy ? result.p1 : result.p0;

    if (victim.hand.length > 3) {
      result.phase = GamePhase.RESOLVING_FOUR_REVEAL;
      return exits.success(result);
    }

    if (victim.hand.length === 3) {
      result.phase = GamePhase.RESOLVING_FOUR_DISCARD;
      result.fourRevealedCards = [ ...victim.hand ];
      return exits.success(result);
    }

    // Two or fewer cards leaves nothing to choose, so they are all discarded
    const discardedCards = victim.hand.splice(0);
    result.scrap.push(...discardedCards);
    result.discardedCards = discardedCards;

    return exits.success(result);
  },
};
