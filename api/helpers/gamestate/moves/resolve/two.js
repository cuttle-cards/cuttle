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

      //getting cardIndex from opponents points
      const cardIndex = result.p1.points.findIndex((card) => {
        const attachIndex = card.attachments.findIndex((attachment) => {
          return attachment.id === result.targetCard.id;
        });
        return attachIndex !== -1; // Check if the attachment exists in the card
      });
      
      if (cardIndex !== -1) {
        
        //remove the card from opponents points
        const [pointCard] = result.p1.points.splice(cardIndex, 1);
        
        //removing the jack from point cards attachment
        pointCard.attachments = pointCard.attachments.filter((attachment) => {
          return attachment.id !== result.targetCard.id;
        });
        
        // add point card to player points
        result.p0.points.push(pointCard);
      }
        
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
