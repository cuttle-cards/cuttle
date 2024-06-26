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
        const convertedData={};

        const attributesToConvert = [
          'deck', 'scrap', 'playedCard', 'targetCardId', 'targetCard2Id', 'oneOff', 'oneOffTarget', 'twos', 'resolving'
        ];

        attributesToConvert.forEach(attribute => {
            const value = gameState[attribute];
            if (value !== null && value !== undefined) {
                if (typeof value === 'string') {
                  convertedData[attribute]  = utils.convertCardToString(value, gameState.playedBy);
                } else if (Array.isArray(value)) {
                  convertedData[attribute]  = value.map(card => utils.convertCardToString(card, gameState.playedBy)); 
                }
            }
            else{
              convertedData[attribute]  = null;  // Handle null or undefined attributes
            }
        });

        // Correspondance of attribute name in GameStateRow to attribute name in GameState + player
        const playerAttToConvert = [{ rowName : 'p0Hand', gamestateName : 'hand', player : 'p0'}, 
                                    {rowName :'p1Hand', gamestateName :'hand', player : 'p1'}, 
                                    {rowName :'p0Points',  gamestateName :'points', player : 'p0'},
                                    {rowName :'p1Points',  gamestateName :'points', player : 'p1'}, 
                                    {rowName :'p0FaceCards',  gamestateName :'faceCards', player : 'p0'}, 
                                    {rowName :'p1FaceCards',  gamestateName :'faceCards', player : 'p1' }]; 
        playerAttToConvert.forEach(attribute => { 
           // ex GameState format for p0Hand : gamestate.p0.hand
          const value = gameState[attribute.player][attribute.gamestateName];
          if(value !== null && value !== undefined){
            convertedData[attribute.rowName]  = value.map(card => utils.convertCardToString(card, attribute.player));
          }
        });

        const combinedData = {...gameState, ...convertedData };

        console.log(combinedData);

        return exits.success(combinedData);
    } catch (err) {
        console.log(err);
        return exits.error(err.message); 
    }

  }
};

