const TargetType = require('../../../../../utils/TargetType.json');

module.exports = {
  friendlyName: 'Resolve Nine One-Off',

  description:
    'Returns new GameState resulting from resolving a nine, which returns two target cards to the hand of ' +
    'whoever controlled them. Both targets resolve simultaneously: each card goes to its controller as of ' +
    'the board state before the nine resolved, and neither is frozen.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the nine returns its two target cards to hand',
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
    // identifies the player whose board holds both targets -- not the nine's caster.
    const victim = playedBy ? result.p1 : result.p0;
    const caster = playedBy ? result.p0 : result.p1;

    const targets = [
      { card: result.oneOffTarget, targetType: result.oneOffTargetType },
      { card: result.oneOffTargetTwo, targetType: result.oneOffTargetTwoType },
    ].filter(({ card, targetType }) => card && targetType);

    // Point cards that are themselves targets must not be handed back to the caster when a jack
    // on top of them is also targeted -- they belong to whoever controlled them, i.e. the victim.
    const targetedPointIds = targets
      .filter(({ targetType }) => targetType === TargetType.point)
      .map(({ card }) => card.id);

    const returnToVictim = (card) => victim.hand.push({ ...card, isFrozen: false, attachments: [] });

    // Jacks first: removing one hands its point card back before we look for point targets
    for (const { card } of targets.filter(({ targetType }) => targetType === TargetType.jack)) {
      const hostIndex = victim.points.findIndex(({ attachments }) =>
        attachments.some(({ id }) => id === card.id));

      // Sanity check -- targets can't disappear mid-resolution, so just skip if one is missing
      if (hostIndex === -1) {
        continue;
      }

      const host = victim.points[hostIndex];
      const jackIndex = host.attachments.findIndex(({ id }) => id === card.id);
      const [ jack ] = host.attachments.splice(jackIndex, 1);
      returnToVictim(jack);

      // Only the top jack can be targeted, so removing it always reverts control to the caster.
      // When the point card is a target too it stays put and goes to hand with the jack instead.
      if (!targetedPointIds.includes(host.id)) {
        victim.points.splice(hostIndex, 1);
        caster.points.push(host);
      }
    }

    for (const { card, targetType } of targets.filter(({ targetType }) => targetType !== TargetType.jack)) {
      const collection = victim[`${targetType}s`];
      const targetIndex = collection.findIndex(({ id }) => id === card.id);

      if (targetIndex === -1) {
        continue;
      }

      const [ targetCard ] = collection.splice(targetIndex, 1);
      returnToVictim(targetCard);

      // Any jack still riding this card wasn't targeted, so it's scrapped
      result.scrap.push(...targetCard.attachments);
    }

    return exits.success(result);
  },
};
