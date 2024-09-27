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

      let pointCard = null;  // To store the point card when found
      let pointIndex = -1;   // To store the index of the point card in p1.points
      let jackIndex = -1;    // To store the index of the jack in the point card's attachments
      
      // Loop through the opponent's points (p1.points)
      for (let i = 0; i < result.p1.points.length; i++) {
        const card = result.p1.points[i];
      
        // Loop through the card's attachments to find the jack
        for (let j = 0; j < card.attachments.length; j++) {
          if (card.attachments[j].id === result.targetCard.id) {
            // Jack found, store the indices and the card
            pointIndex = i;
            jackIndex = j;
            pointCard = card;
            break; // Exit inner loop once jack is found
          }
        }
      
        // Exit outer loop once both point and jack are found
        if (pointCard) {
          break;
        }
      }
      
      // If a point card with the jack was found
      if (pointCard) {
        // Remove the point card from the opponent's points (p1)
        result.p1.points.splice(pointIndex, 1);
      
        // Remove the jack from the point card's attachments
        pointCard.attachments.splice(jackIndex, 1); // Remove the attachment by index
      
        // Add the point card (now without the jack) to the player's points (p0)
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
