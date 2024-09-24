module.exports = {
  friendlyName: 'Resolve Two One-Off',

  description: 'Returns new GameState resulting from resolving a two, which scraps target royal and glasses eight on the field, and counter one-off cards.',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest GameState before the two resolves',
      required: true,
    },
  },
  sync: true, // synchronous helper
  fn: ({ currentState }, exits) => {
    let result = _.cloneDeep(currentState);


    // Checks if target card is facecard or jack
    if (result.oneOffTargetType === 'jack') {

      const pointCard = result.p1.hand.map((card) => {
        return card.attachements === result.targetCard;
      });
      
      // removing jack from point card attachments
      const targetedPointCard= result.p1.hand.find(({ id }) => id === pointCard.id);
      targetedPointCard.attachements = [];

      // add point card to player points
      result.p0.hand.push(pointCard);

    } else {
      // remove target card from opponent hand 
      const targetPlayedIndex = result.p1.faceCards.findIndex(({ id }) => id === result.targetCard.id);
      result.p1.faceCards.splice(targetPlayedIndex, 1);

    }
      // add target card in scrap
      result.scrap.push(result.targetCard);
    
    return exits.success(result);
  },
};
