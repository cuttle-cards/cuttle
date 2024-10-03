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

    const { p0, p1 } = result;
    
    const collectJacksAndFilterPoints = (playedBy, target) => {
      playedBy.points = playedBy.points.filter((point) => {
        const jackCount = point.attachments.length;
        result.scrap.push(...point.attachments);  // Scrap all jacks
        point.attachments = []; // removing attachments from all cards

        if (jackCount % 2 === 1) {
          target.points.push(point);  // Move point to opponent/player if odd number of jacks
          return false;
        }
        return true;
      });
    };

    collectJacksAndFilterPoints(p0, p1);
    collectJacksAndFilterPoints(p1, p0);
      
    // Remove all played face cards and add in scrap
    [p0, p1].forEach((card) => {
      result.scrap.push(...card.faceCards);
      card.faceCards = [];
    });

    return exits.success(result);
  },
};
