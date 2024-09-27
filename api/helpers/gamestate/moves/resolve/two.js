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

      let pointCard, removedJack;

      // Loop through the points to find the point card and the jack
      for (let i = 0; i < result.p1.points.length; i++) {
        const currentCard = result.p1.points[i];

          // Look through the attachments for the target jack
          for (let j = 0; j < currentCard.attachments.length; j++) {
            if (currentCard.attachments[j].id === result.targetCard.id) {
              // We found the jack, so remove it from the attachments
              [removedJack] = currentCard.attachments.splice(j, 1);
              [pointCard] = result.p1.points.splice(i, 1); // Remove the card from opponent points
              break; // Exit the inner loop early once the jack is found
            }
          }

          // Exit the outer loop early once the point card and jack are found
          if (pointCard && removedJack) {
            break;
          }
        }

        // If we found a point card and removed the jack
      if (pointCard && removedJack) {

        // Add the updated point card to players points
        pointCard.attachments = [];
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
