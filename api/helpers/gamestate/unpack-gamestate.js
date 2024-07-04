module.exports = {
  friendlyName: 'unpack GameState',

  description: 'This helper inputs a GameStateRow and output a GameState. Convert all the String representations of cards to the Card objects, and aggregating the p0Hand, p0Points, and p0FaceCards attributes into the p0: Player object (doing the same for p1).',

  inputs: {
    gameStateRow: {
      type: 'ref',
      description: 'GameStateRow - record from the database',
      required: true,
    },    
    p0: {
      type: 'number',
      description: 'player0Id',
      required: true,
    },
    p1: {
      type: 'number',
      description: 'player0Id',
      required: true,
    },
  },

  fn: async ({gameStateRow, p0, p1  }, exits) => {
      try{

        const attributesToConvert = [
          'deck', 'scrap', 'playedCard', 'targetCardId', 'oneOff', 'oneOffTarget', 'twos', 'resolving',
          'p0Hand', 'p1Hand', 'p0Points', 'p1Points', 'p0FaceCards', 'p1FaceCards', 
      ];
      const playerAttToConvert = [
                                  { rowName : 'p0Hand', gamestateName : 'hand', player : p0 }, 
                                  { rowName : 'p1Hand', gamestateName : 'hand', player : p1 }, 
                                  { rowName : 'p0Points',  gamestateName : 'points', player : p0 },
                                  { rowName : 'p1Points',  gamestateName : 'points', player : p1 }, 
                                  { rowName : 'p0FaceCards',  gamestateName : 'faceCards', player : p0 }, 
                                  { rowName : 'p1FaceCards',  gamestateName : 'faceCards', player : p1 }
                                ];

  
      const allPromises = attributesToConvert.map(attribute => {
          const value = gameStateRow[attribute];
          if (value !== null && value !== undefined) {
              // single card
              if (typeof value === 'string') {
                  return sails.helpers.gamestate.convertIdToCard( value);
              } 
               // Array of cards
              else if (Array.isArray(value)) {
                  let att = playerAttToConvert.find(o => o.rowName === attribute);
                  let obj = att !== null && att !== undefined ? att : {player : 0};
                  return Promise.all(value.map(card => sails.helpers.gamestate.convertIdToCard( card, 
                                                                                          obj.player)));
              }
          }
          return Promise.resolve(null);  // Handle null or undefined attributes
      });
  
      const [ deck, scrap, playedCard, targetCardId, oneOff, oneOffTarget, twos, resolving,
        p0Hand, p1Hand, p0Points, p1Points, p0FaceCards, p1FaceCards
      ] = await Promise.all(allPromises);

      const p0Data = { hand : p0Hand, faceCards: p0FaceCards, points : p0Points, id : p0 };
      const p1Data = { hand : p1Hand, faceCards: p1FaceCards, points : p1Points, id : p1 };
        

      const convertedData = {     gameId: gameStateRow.gameId,
                                  playedBy : gameStateRow.playedBy,
                                  moveType : gameStateRow.moveType,
                                  turn : gameStateRow.turn,
                                  phase : gameStateRow.phase,
                                  p0 : p0Data,
                                  p1 : p1Data,
                                  deck : deck,
                                  scrap: scrap,
                                  twos : twos,
                                  playedCard : playedCard !== null ? playedCard : null,
                                  targetCardId : targetCardId !== null ? targetCardId : null,
                                  oneOff : oneOff !== null ? oneOff : null,
                                  oneOffTarget: oneOffTarget !== null ? oneOffTarget : null,
                                  resolving : resolving !== null && resolving !== undefined ? resolving : null,
                                };
                                
                               
        return exits.success(convertedData);
    } catch (err) {
      return exits.error(err.message); 
    }

  }
};