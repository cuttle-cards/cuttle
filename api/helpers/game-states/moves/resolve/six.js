module.exports = {
  friendlyName: 'Resolve Six One-Off',

  description: 'Returns new GameState resulting from resolving an six, which Scrap all Royals and Glasses Eights on the field.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the six scraps all royals and glasses eights',
      required: true,
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState }, exits) => {
    const result = _.cloneDeep(currentState);

    const { p0, p1 } = result;
    
    const scrapRoyalsAndSwapStolenPoints = (player, opponent) => {
      // Scrap the face cards
      result.scrap.push(...player.faceCards);
      player.faceCards = [];

      // Scrap jacks and return stolen point cards to original owner
      player.points = player.points.filter((point) => {
        const jackCount = point.attachments.length;
        result.scrap.push(...point.attachments);  // Scrap all jacks
        point.attachments = []; // Remove all attachments
        if (jackCount % 2 === 1) {
          opponent.points.push(point);  // Move point card to opponent if odd number of jacks
          return false;
        }
        return true;
      });
    };
    
    scrapRoyalsAndSwapStolenPoints(p0, p1);
    scrapRoyalsAndSwapStolenPoints(p1, p0);

    return exits.success(result);
  },
};
