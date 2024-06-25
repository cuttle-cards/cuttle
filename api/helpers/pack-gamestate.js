
const utils = require('../utils/convertCard');

module.exports = {
  friendlyName: 'pack GameState',

  description: 'This helper inputs a GameState and output a gamestateRow. Convert all the object representations of cards to the string, and aggregating the p0Hand, p0Points, and p0FaceCards attributes into the p0: Player object (doing the same for p1).',

  inputs: {
    gameState: {
      type: 'ref',
      description: 'gameState to a gamestateRow -> with  String representation iunstead of Card Object',
      required: true,
    },
  },

  fn: async ({gameState }, exits) => {
      try{

        const attributesToConvert = [
          'deck', 'scrap', 'playedCard', 'targetCardId', 'targetCard2Id', 'oneOff', 'oneOffTarget', 'twos', 'resolving'
        ];
        const convertedData={};
        attributesToConvert.forEach(attribute => {
            const value = gameState[attribute];
            if (value !== null && value !== undefined) {
                if (typeof value === 'string') {
                  convertedData[attribute]  = utils.convertCardToString(value, gameState.playedBy);//TODO no attachments here
                } else if (Array.isArray(value)) {
                  convertedData[attribute]  = value.map(card => utils.convertCardToString(card, gameState.playedBy)); 
                }
            }
            else{
              convertedData[attribute]  = null;  // Handle null or undefined attributes
            }
        });

        //const playerAttributesToConvert = ['p0Hand', 'p1Hand', 'p0Points', 'p1Points', 'p0FaceCards', 'p1FaceCards' ]; //TODO
        const playerAttributesToConvert = ['hand', 'points', 'faceCards' ]; //TODO


        const combinedData = {...gameState, ...convertedData };

        return exits.success(combinedData);
    } catch (err) {
        console.log(err);
        return exits.error(err.message); 
    }

  }
};

