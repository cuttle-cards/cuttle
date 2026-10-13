module.exports = {
  friendlyName: 'Resolve Four One-Off',

  description:
    'Returns new GameState resulting from resolving a four, which discards two cards at random from the ' +
    'hand of the player resolving it. A hand of fewer than two cards discards whatever it holds.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the four discards its two cards',
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

    // sampleSize returns *up to* two cards, so a short hand simply discards everything it has
    const discardedCards = _.sampleSize(victim.hand, 2);
    const discardedIds = new Set(discardedCards.map(({ id }) => id));

    // Filter by id rather than splicing -- sampleSize returns the cards, not their positions
    victim.hand = victim.hand.filter(({ id }) => !discardedIds.has(id));
    result.scrap.push(...discardedCards);
    result.discardedCards = discardedCards;

    return exits.success(result);
  },
};
