
function setGameId(param){
if(param === null || param === undefined ||  isNaN(param)){
  throw new Error( 'The gameId cannot be empty and must be a number');
}
return param;
}
function setMoveType(param){
if(param === null  || param === undefined ||  isNaN(param) || param <0 || param >19){
  throw new Error('The MoveType must be a number 0 to 19');
}
return param;
}
function setTurn(param){
if(param === null || param === undefined ||  isNaN(param) ){
  throw new Error('The turn must be a number');
}
return param;
}
function setPhase(param){
if(param === null || param === undefined ||  isNaN(param) || param <0 || (param >5 && param !==7)){
  throw new Error('The phase must be a number in [1, 2, 3, 4, 5, 7]');
}
return param;
}
function setPlayedBy(param){
if(param === null || param === undefined ||  isNaN(param) || param <0 || param >1){
  throw new Error('The playedBy attribute cannot be null and must be a number in [0,1]');
}
return param;
}

function validatePlayer(param){

  return param;
}


module.exports = {
friendlyName: 'Format and validate a GameState',

description: 'Format and validate a GameState',

inputs: {
  gameState: {
    type: 'ref',
    description: 'gamestate',
    required: true,
  },
},
sync: true,

fn:  ({ gameState }, exits) => {
  try {

    const gameStateUpdated= {
      //Validations 
      gameId : setGameId(gameState.gameId),
      playedBy : setPlayedBy(gameState.playedBy),
      moveType : setMoveType(gameState.moveType),
      turn : setTurn(gameState.turn),
      phase : setPhase(gameState.phase),

      playedCard :  gameState.playedCard ? gameState.playedCard : null,
      targetCardId : gameState.targetCardId ? gameState.targetCardId : null,

      p0 :  gameState.p0 ? gameState.p0 : { hand : [], points: [], facecards : []},
      p1 : gameState.p1 ? gameState.p1 : { hand : [], points: [], facecards : [] },

      deck : gameState.deck ? gameState.deck : [],
      scrap : gameState.scrap ? gameState.scrap : [],
      twos : gameState.twos ? gameState.twos : [],

      oneOff : gameState.oneOff ? gameState.oneOff : null,
      oneOffTarget : gameState.oneOffTarget ? gameState.oneOffTarget : null,
      resolving : gameState.resolving ? gameState.resolving : null,
    };

      
        return exits.success(gameStateUpdated);
    } catch (err) {
        return exits.error(err.message); 
    }
}
};

