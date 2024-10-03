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
    let result = _.cloneDeep(currentState);

    const player = result.playedBy ? result.p1 : result.p0;
    const opponent = result.playedBy ? result.p0 : result.p1;
    
    let cardToScrap = [];

    const collectJacksAndFilterPoints = (playedBy, target) => {
      playedBy.points = playedBy.points.filter((point) => {
        const jackCount = point.attachments.length;
        cardToScrap.push(...point.attachments);  // Collect all jacks
        point.attachments = []; //removing attachments from all cards

        if (jackCount % 2 === 1) {
          target.points.push(point);  // Move point to opponent/player if odd number of jacks
          return false;
        }
        return true;
      });
    };

    collectJacksAndFilterPoints(player, opponent);
    collectJacksAndFilterPoints(opponent, player);
      
    // Remove all played face cards
    [player, opponent].forEach((card) => {
      cardToScrap.push(...card.faceCards);
      card.faceCards = [];
    });

    // Add collected cards to scrap
    result.scrap.push(...cardToScrap);

    return exits.success(result);
  },
};
