//const GameState = require('../utils/GameState');

const utils = require('../utils/convertCard');


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
          'p0Hand', 'p1Hand', 'p0Points', 'p1Points', 'p0FaceCards', 'p1FaceCards', 'deck', 'scrap',
          'playedCard', 'targetCardId', 'oneOff', 'oneOffTarget', 'twos', 'resolving'
      ];
      const playerAttToConvert = [{ rowName : 'p0Hand', gamestateName : 'hand', player : p0}, 
                                  { rowName : 'p1Hand', gamestateName : 'hand', player : p1}, 
                                  { rowName : 'p0Points',  gamestateName : 'points', player : p0},
                                  { rowName : 'p1Points',  gamestateName : 'points', player : p1}, 
                                  { rowName : 'p0FaceCards',  gamestateName : 'faceCards', player : p0}, 
                                  { rowName : 'p1FaceCards',  gamestateName : 'faceCards', player : p1 }];
  
      const allPromises = attributesToConvert.map(attribute => {
          const value = gameStateRow[attribute];
          if (value !== null && value !== undefined) {
              // single card
              if (typeof value === 'string') {
                  return utils.convertStringToCard(value , attribute);
              } 
               // Array of cards
              else if (Array.isArray(value)) {
                  let att = playerAttToConvert.find(o => o.rowName === attribute);
                  let obj = att !== null && att !== undefined ? att : {player : null, gamestateName: attribute};
                  return Promise.all(value.map(card => utils.convertStringToCard( card, 
                                                                                  obj.player, 
                                                                                  obj.gamestateName, 
                                                                                  gameStateRow.gameId)));
              }
          }
          return Promise.resolve(null);  // Handle null or undefined attributes
      });
  
      const [, , , , , , deck, scrap, playedCard, targetCardId, oneOff, oneOffTarget, twos, resolving
      ] = await Promise.all(allPromises);
         

      const deckId = deck !== null ? deck.map(obj => obj.id) : [];
      const scrapId = scrap !== null ? scrap.map(obj => obj.id): [];
      const twosId = twos !== null ? twos.map(obj => obj.id): [];

      const convertedData ={      gameId: gameStateRow.gameId,
                                  playedBy : gameStateRow.playedBy,
                                  moveType : gameStateRow.moveType,
                                  turn : gameStateRow.turn,
                                  phase : gameStateRow.phase,
                                  p0 : p0,
                                  p1 : p1,
                                  deck : deckId,
                                  scrap: scrapId,
                                  twos : twosId,
                                  playedCard : playedCard !== null ? playedCard.id : null,
                                  targetCardId : targetCardId !== null ? targetCardId.id : null,
                                  oneOff : oneOff !== null ? oneOff.id : null,
                                  oneOffTarget: oneOffTarget !== null ? oneOffTarget.id : null,
                                  resolving : resolving !== null && resolving !== undefined ? resolving.id : null,
                                };
                                
                               
        return exits.success(convertedData);
    } catch (err) {
      return exits.error(err.message); 
    }

  }
};