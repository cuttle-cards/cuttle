class GameState{
  // id: primary key
  id = null;
  // playedBy: int 0 | 1: Which player made the move (0 if p0, 1 if p1)
  playedBy = null;
  // moveType: Enum (int?) - designates which kind of move was made. Corresponds to one of the following:
  moveType = null;
  // playedCard: Card | null
  playedCard = null;
  // targetCardId: Card | null
  targetCardId = null;
  // targetCard2Id: Card | null
  targetCard2Id = null;
  // turn: int - which turn number the move was made on
  turn = null;
  // phase: enum - What phase of a turn the game is currently in. Used to validate which next-moves are legal
  phase = null;
  // p0: Player
  p0 = null;
  // p1: Player
  p1 = null;
  // deck: Array<Card>: Cards in the deck, in order (this removes the need for topCard and secondCard)
  deck = null;
  // scrap: Array<Card>
  scrap = null;
  // oneOff: Card | null
  oneOff = null;
  // oneOffTarget: Card | null
  oneOffTarget = null;
  // twos: Card | null
  twos = null;
  // resolving: Card | null
  resolving = null;
  // gameId: ID - FK to the games table
  gameId = null;

  constructor(gameState) {

    //validations required field
    this.setGameId(gameState.gameId);
    this.setMoveType(gameState.moveType);
    this.setPlayedBy(gameState.playedBy);
    this.setPhase(gameState.phase);
    this.setTurn(gameState.turn);

    this.deck = gameState.deck ? gameState.deck : [];
    this.scrap = gameState.scrap ? gameState.scrap : [];
    this.twos = gameState.twos ? gameState.twos : [];

    this.p0 = gameState.p0 ? gameState.p0 : null;
    this.p1 = gameState.p1 ? gameState.p1 : null;
    this.id = gameState.id ? gameState.id : null;
    this.resolving = gameState.resolving ? gameState.resolving : null;
    this.oneOffTarget = gameState.oneOffTarget ? gameState.oneOffTarget : null;
    this.oneOff = gameState.oneOff ? gameState.oneOff : null;
    this.targetCard2Id = gameState.targetCard2Id ? gameState.targetCard2Id : null;
    this.playedCard = gameState.playedCard ? gameState.playedCard : null;
  }

  setGameId(param){
    if(param === null || param === undefined ||  isNaN(param)){
      throw new Error( 'The gameId cannot be empty and must be a number');
    }
    this.gameId = param;
  }
  setMoveType(param){
    if(param === null  || param === undefined ||  isNaN(param) || param <0 || param >19){
     throw new Error('The MoveType must be a number 0 to 19');
    }
    this.moveType = param;
  }
  setTurn(param){
    if(param === null || param === undefined ||  isNaN(param) ){
      throw new Error('The turn must be a number');
    }
    this.turn = param;
  }
  setPhase(param){
    if(param === null || param === undefined ||  isNaN(param) || param <0 || (param >5 && param !==7)){
      throw new Error('The phase must be a number in [1, 2, 3, 4, 5, 7]');
    }
    this.phase = param;
  }
  setPlayedBy(param){
    if(param === null || param === undefined ||  isNaN(param) || param <0 || param >1){
      throw new Error('The playedBy attribute cannot be null and must be a number in [0,1]');
    }
    this.playedBy = param;
  }
}


module.exports = GameState;