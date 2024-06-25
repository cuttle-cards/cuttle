const utils = require('../utils/convertCard');
// const gameStateRow= {
//   // gameId: {
//   //   model: 'game',
//   //   required: true,
//   // },
//   gameId : 12,
//   // Which player made the move (0 if p0, 1 if p1)
//   playedBy: 0,
//   /**
//    * Enum for moveType:
//    */
//   moveType : 3,
//   // The card that was played
//   playedCard : null,
//   // The card that was targeted
//   targetCard: null,
//   // Cards discarded for a 4 or 5
//   discardedCards: [],
//   // Which turn number the move was made on
//   turn: 0,
//   /**
//    * Enum for phase:
//    * 1 - MAIN
//    * 2 - COUNTERING
//    * 3 - RESOLVING_THREE
//    * 4 - RESOLVING_FOUR
//    * 5 - RESOLVING_FIVE
//    * 7 - RESOLVING_SEVEN
//    */
//   phase : 1,
//   // Cards in p0’s hand
//   p0Hand : ['TH', 'JD'],
//   // Cards in p1’s hand
//   p1Hand: ['7H', 'KD'],
//   // Cards in p0’s points
//   p0Points: ['3D', '4S(JS-p0)', 'TH(JH-p0,JC-p1,JD-p0)'],

//   // Cards in p1’s points
//   p1Points : ['TH(JH-p0,JC-p1,JD-p0)'],
//   // Cards in p0’s face cards
//   p0FaceCards : ['KH'],
//   // Cards in p1’s face cards
//   p1FaceCards : ['QD'],
//   // Cards in the deck, in order
//   deck : ['7H', 'KD' , '9D', '6D', '4D', '3D'],
//   // Cards in the scrap
//   scrap : ['7H', 'KD' , '9D', '6D', '4D', '3D'],
//   // One-off card
//   oneOff :null,
//   // One-off target card
//   oneOffTarget :null,
//   // Twos
//   twos :null,
//   // Resolving card
//   resolving :null,
// };

module.exports = {
  friendlyName: 'unpack GameState',

  description: 'This helper inputs a GameStateRow and output a GameState. Convert all the String representations of cards to the Card objects, and aggregating the p0Hand, p0Points, and p0FaceCards attributes into the p0: Player object (doing the same for p1).',

  inputs: {
    gameStateRow: {
      type: 'ref',
      description: 'GameStateRow - record from the database',
      required: true,
    },    
    game: {
      type: 'ref',
      description: 'Game',
      required: true,
    },
  },

  fn: async ({gameStateRow, game }, exits) => {
      try{

        const attributesToConvert = [
          'p0Hand', 'p1Hand', 'p0Points', 'p1Points', 'p0FaceCards', 'p1FaceCards', 'deck', 'scrap',
          'playedCard', 'targetCardId', 'targetCard2Id', 'oneOff', 'oneOffTarget', 'twos', 'resolving'
      ];
  
      const allPromises = attributesToConvert.map(attribute => {
          const value = gameStateRow[attribute];
          if (value !== null && value !== undefined) {
              if (typeof value === 'string') {
                  return utils.convertStringToCard(value, gameStateRow.gameId);
              } else if (Array.isArray(value)) {
                  return Promise.all(value.map(card => utils.convertStringToCard(card, gameStateRow.gameId)));
              }
          }
          return Promise.resolve(null);  // Handle null or undefined attributes
      });
  
      const [
          p0Hand, p1Hand, p0Points, p1Points, p0FaceCards, p1FaceCards, deck, scrap,
          playedCard, targetCardId, targetCard2Id, oneOff, oneOffTarget, twos, resolving
      ] = await Promise.all(allPromises);


        const p0 =  new Player ({ id:0, 
                                  hand: p0Hand, 
                                  points: p0Points, 
                                  faceCards :p0FaceCards, //TODO USER
                                });

        const p1 =  new Player ({ id:1, 
                                  hand: p1Hand, 
                                  points: p1Points, 
                                  faceCards :p1FaceCards,
                                });

        const convertedData ={   
                                  p0 :p0,
                                  p1 : p1,
                                  deck : deck,
                                  scrap : scrap,
                                  playedCard :playedCard,
                                  targetCardId: targetCardId,
                                  targetCard2Id : targetCard2Id,
                                  oneOff: oneOff,
                                  oneOffTarget:oneOffTarget,
                                  twos :twos,
                                  resolving : resolving
                                };

    
        const UpdatedData = {...gameStateRow, ...convertedData };

        const updatedGameState = await GameState.create( UpdatedData).fetch();

        return exits.success(updatedGameState);
    } catch (err) {
      console.log(err);
      return exits.error(err.message); 
    }

  }
};


class Player{
  //int
  id = null;
  //String
  name =  null;
  //Array<Card>
  hand = null;
  //Array<Card>
  points = null;
  //Array<Card>
  faceCards = null;

  constructor(player) {
      this.hand = player.hand ? player.hand : null; 
      this.points = player.points ? player.points :null; 
      this.faceCards = player.faceCards ? player.faceCards :null;
      this.name = player.name ? player.name :null; 
      this.id = player.id ? player.id :null;
  }
}
