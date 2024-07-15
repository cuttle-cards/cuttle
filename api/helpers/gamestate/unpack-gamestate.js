module.exports = {
  friendlyName: 'unpack GameState',

  description: 'This helper inputs a GameStateRow and outputs a GameState. Converts all the String representations of cards to the Card objects, and aggregates the p0Hand, p0Points, and p0FaceCards attributes into the p0 and p1 Player objects.',

  inputs: {
    gameStateRow: {
      type: 'ref',
      description: 'GameStateRow - record from the database',
      required: true,
    },    
  },
  sync: true,

  fn:  ({ gameStateRow  }, exits) => {
    try {

        const attributesToConvert = [
          'deck', 'scrap', 'playedCard', 'targetCardId', 'oneOff', 'oneOffTarget', 'twos', 'resolving',
          'p0Hand', 'p1Hand', 'p0Points', 'p1Points', 'p0FaceCards', 'p1FaceCards', 
        ];

      const convertedData = {};
      attributesToConvert.map(attribute => {
            const value = gameStateRow[attribute];
            if ( value ) {
                // single card
                if (typeof value === 'string') {
                  convertedData[attribute]  =  sails.helpers.gamestate.convertIdToCard( value);
                } 
                // Array of cards
                else if (Array.isArray(value)) {
                    convertedData[attribute]  = value.map(card => sails.helpers.gamestate.convertIdToCard( card));
                }
            }
        });


        const p0Data = { 
                        hand : convertedData.p0Hand, 
                        faceCards: convertedData.p0FaceCards, 
                        points : convertedData.p0Points
                       };

        const p1Data = { 
                        hand : convertedData.p1Hand, 
                        faceCards: convertedData.p1FaceCards, 
                        points : convertedData.p1Points 
                      };
          

        const data = {    gameId: gameStateRow.gameId,
                          playedBy : gameStateRow.playedBy,
                          moveType : gameStateRow.moveType,
                          turn : gameStateRow.turn,
                          phase : gameStateRow.phase,
                          p0,
                          p1,
                          deck : convertedData.deck,
                          scrap: convertedData.scrap,
                          twos : convertedData.twos,
                          playedCard : convertedData.playedCard  ? convertedData.playedCard : null,
                          targetCardId : convertedData.targetCardId  ? convertedData.targetCardId : null,
                          oneOff : convertedData.oneOff  ? convertedData.oneOff : null,
                          oneOffTarget: convertedData.oneOffTarget ? convertedData.oneOffTarget : null,
                          resolving : convertedData.resolving ? convertedData.resolving : null,
                      }; 

          const convertedGameState = sails.helpers.gamestate.validateGamestate( data );  

          return exits.success(convertedGameState);
    } catch (err) {
      return exits.error(err.message); 
    }

  }
};
