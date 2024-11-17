module.exports = {
  friendlyName: 'Resolve Nine One-Off',

  description: 'Returns new GameState resulting from resolving an nine, which returns target card to opponents hand',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the nine returns target card to opponents hand',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: 'Player number of player requesting move.',
    }
  },
  sync: true, // synchronous helper
  fn: ({ currentState, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    // the user who played the one off is the opposite of the one who is resolving it. 
    const opponent = playedBy ? result.p1 : result.p0;
    const player = playedBy ? result.p0 : result.p1;
 
    if ([ 'point', 'faceCard' ].includes(result.oneOffTargetType)) {
      
      const targetIndex = opponent[`${result.oneOffTargetType}s`].findIndex(({ id }) => id === result.targetCard.id);
      const [ targetCard ] = opponent[`${result.oneOffTargetType}s`].splice(targetIndex, 1);
      
      // Send Card back to original owner
      opponent.hand.push({ ...targetCard, isFrozen: true, attachments: [] });
      
      // scrap all attachments
      result.scrap.push(...targetCard.attachments);

      return exits.success(result);
    } 
    
    // TargetType = Jack
    // Find card that the jack is attached to
    const targetIndex = opponent.points.findIndex(({ attachments }) =>
      attachments.some(({ id }) => id === result.targetCard.id));
    const [ targetCard ] = opponent.points.splice(targetIndex, 1);
    
    // remove last attachment
    targetCard.attachments.pop();

    // Push card that jack was removed from back to players points
    player.points.push(
      {
        ...targetCard,
      });
    
    // Push jack back to opponents hand
    opponent.hand.push({ ...result.targetCard, isFrozen: true, attachments: [] });
    return exits.success(result);
  },
};
