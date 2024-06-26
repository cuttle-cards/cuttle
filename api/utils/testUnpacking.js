const GameStateRow = require('../models/GameStateRow');

const game = {};
const gameStateRowData= {
  // gameId: {
  //   model: 'game',
  //   required: true,
  // },
  gameId : game,
  // Which player made the move (0 if p0, 1 if p1)
  playedBy: 0,
  /**
   * Enum for moveType:
   */
  moveType : 3,
  // The card that was played
  playedCard : null,
  // The card that was targeted
  targetCard: true,
  // Cards discarded for a 4 or 5
  discardedCards: [],
  // Which turn number the move was made on
  turn: 0,
  /**
   * Enum for phase:
   * 1 - MAIN
   * 2 - COUNTERING
   * 3 - RESOLVING_THREE
   * 4 - RESOLVING_FOUR
   * 5 - RESOLVING_FIVE
   * 7 - RESOLVING_SEVEN
   */
  phase : 1,
  // Cards in p0’s hand
  p0Hand : ['TH', 'JD'],
  // Cards in p1’s hand
  p1Hand: ['7H', 'KD'],
  // Cards in p0’s points
  p0Points: ['3D', '4S(JS-p0)', 'TH(JH-p0,JC-p1,JD-p0)'],

  // Cards in p1’s points
  p1Points : ['TH(JH-p0,JC-p1,JD-p0)'],
  // Cards in p0’s face cards
  p0FaceCards : ['KH'],
  // Cards in p1’s face cards
  p1FaceCards : ['QD'],
  // Cards in the deck, in order
  deck : ['7H', 'KD' , '9D', '6D', '4D', '3D'],
  // Cards in the scrap
  scrap : ['7H', 'KD' , '9D', '6D', '4D', '3D'],
  // One-off card
  oneOff :null,
  // One-off target card
  oneOffTarget :null,
  // Twos
  twos :null,
  // Resolving card
  resolving :null,
};

module.exports = {
    getGameStateRow : async function(){

      const gameStateRow = await GameStateRow.create(gameStateRowData).fetch();

      return gameStateRow;

    }
  };
  