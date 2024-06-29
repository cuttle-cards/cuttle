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
  // createdAt: timestampz - When the move took place
  createdAt2 =null;

  constructor(gameState) {
    this.deck = gameState.deck ? gameState.deck : null;
    this.p0 = gameState.p0 ? gameState.p0 : null;
    this.p1 = gameState.p1 ? gameState.p1 : null;
    this.id = gameState.id !== null ? gameState.id : null;
    this.gameId = gameState.gameId !== null ? gameState.gameId : null;
    this.resolving = gameState.resolving ? gameState.resolving : null;
    this.oneOffTarget = gameState.oneOffTarget ? gameState.oneOffTarget : null;
    this.oneOff = gameState.oneOff ? gameState.oneOff : null;
    this.scrap = gameState.scrap ? gameState.scrap : null;
    this.phase = gameState.phase !== null ? gameState.phase : null;
    this.turn = gameState.turn !== null ? gameState.turn : null;
    this.deck = gameState.deck ? gameState.deck : null;
    this.targetCard2Id = gameState.targetCard2Id ? gameState.targetCard2Id : null;
    this.playedCard = gameState.playedCard ? gameState.playedCard : null;
    this.moveType = gameState.moveType !== null ? gameState.moveType : null;
    this.playedBy = gameState.playedBy !== null ? gameState.playedBy : null;
    this.createdAt2 = gameState.createdAt ? gameState.createdAt : null;
  }
}


module.exports = GameState;