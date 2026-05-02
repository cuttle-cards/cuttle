# Move History and Gamestate API

This doc outlines a proposal for the database and api payload architecture of individual moves and the resulting game states in cuttle.cards. This is intended to facilitate a variety of features that leverage more granular data collection (ie the game state after each move) and decouple the representation of where cards are located from the representation of the users so a given user can be in more than one game at once. In particular this will make possible:

* Building the vs AI experience into the main application   
* Watchable game replayed of completed games ✅  
* Async play  
* Strategic analysis of gameplay

# Database Layer

## Game

The `Game` object/table is reduced to the metadata about the game that doesn’t generally change while a game is played. It has the game’s id, name, the ids of which users are p0 and p1.

1. id: primary key  
2. name: `String`  
3. p0: `int` fk (user) \- id of which user is player 0  
4. p1: `int` fk (user) \- id of which user is player 1  
5. p0Ready: `boolean` \- whether p0 is ready for the game to start  
6. p1Ready: `boolean` \- whether p1 is ready for the game to start  
7. status: `int` (enum) \- what state of the game lifecycle we are in  
   1.   "CREATED" : 1,  
   2.   "STARTED" : 2,  
   3.   "FINISHED" : 3,  
   4.   "ARCHIVED" : 4  
8. lock: `String` \- UUID specifying which request currently locked the game for updates  
9. lockedAt: `timestampz` \- Time the game was last locked  
10. winner: `int` fk (user) \- which user won the game  
11. match: `int` fk(match) \- which match the game is part of

## GameStateRow

A GameState record represents one move made by a player and the resulting game state. It contains a breadth of data that can be used to power various features and analysis within a given game and across games. GameStateRows are compressed using domain-specific string\[\] lists to represent the cards. They can be uncompressed into the `GameState` object with the `unpackGameState()` helper.

1. id: primary key  
2. playedBy: `int` 0 | 1: Which player made the move (0 if p0, 1 if p1)  
3. moveType: `Enum (int?)` \- designates which kind of move was made. Corresponds to one of the following:  
   1. draw  
   2. points  
   3. scuttle  
   4. faceCard (king, queen, or glasses eight)  
   5. jack  
   6. untargetedOneOff  
   7. targetedOneOff  
   8. counter  
   9. resolve  
   10. resolveThree (picking a card from the scrap)  
   11. resolveFour (discarding from hand)  
   12. sevenPoints  
   13. sevenScuttle  
   14. sevenFaceCard  
   15. sevenJack  
   16. sevenUntargetedOneOff  
   17. sevenTargetedOneOff  
   18. pass  
4. turn: `int` \- which turn number the move was made on  
5. phase: `enum` \- What phase of a turn the game is currently in. Used to validate which next-moves are legal  
   1. main \- ‘main’ player phase. Can make ‘regular’ moves:  
      1. draw  
      2. points  
      3. faceCard  
      4. jack  
      5. scuttle  
      6. untargetedOneOff  
      7. targetedOneOff  
   2. countering \- phase where players play counters. Only legal moves are   
      1. counter  
      2. resolve  
   3. resolvingThree \- Picking card from scrap. Only legal move is resolveThree  
   4. resolvingFour \- Choosing cards to discard. Only legal move is resolveFour  
   5. resolvingFive \- Choosing card to discard before drawing. Only legal move is resolveFive  
   6. resolvingSeven \- Picking one of the top cards from the deck. Must play a seven move next. Legal next moves:  
      1. sevenPoints  
      2. sevenFaceCard  
      3. sevenScuttle  
      4. sevenUntargetedOneOff  
      5. sevenTargetedOneOff  
      6. sevenJack  
6. playedCard: `String | null` the card that was played  
   1. Can be null  
7. targetCard: `String | null` the card that was targeted  
   1. Can be null  
8. discardedCards: `Array<String>`  
9. p0Hand: `Array<String>`  
   1. Specially formatted string representing the list of cards in p0’s hand. See [‘Game State Array\<String\> Lists](#game-state-array\<string\>-lists) below for full explanation  
   2. ex) `[‘AC’, ‘5H’, ‘8D(JS-p0,JD-p1,JH-p0)’]`  
      1. P0 hand has the Ace of Clubs, 5 of Hearts, 8 of Diamonds  
         1. 8 of diamonds has the jack of spades, jack of diamonds, and jack of hearts on it  
10. p1Hand: `Array<String>`: Cards in p1 hand  
11. p0Points: `Array<String>`: Cards in p0 points  
12. p1Points: `Array<String>`  
13. p0FaceCards: `Array<String>`  
14. p1FaceCards: `Array<String>`  
15. deck: `Array<String>`: Cards in the deck, in order (this removes the need for topCard and secondCard)  
16. scrap: `Array<String>`  
17. oneOff: `String | null`  
18. oneOffTarget: `String | null`  
19. twos: `Array<String>`  
20. resolving: `String`  
21. gameId: ID \- FK to the games table  
22. createdAt: `timestampz` \- When the move took place

## Game State Array\<String\> Lists {#game-state-array<string>-lists}

Several columns on the `gamestate` table describe a list of cards in a specific place:   
`p0Hand`, `p0Points`, `p0FaceCards`, `p1Hand`, `p1Points`, `p1FaceCards`, `scrap`, and `deck`.   
Each of these columns contains a list of strings that specify which cards appear in which order in that list, and which cards, if any, are attached to each of those cards. Each card is specified by a `String` id that describes the cards suit and rank, as follows:

**Suit**: ‘C’ (Clubs), ‘D’ (Diamonds), ‘H’ (Hearts), ‘S’ (Spades)  
**Rank:** ‘A’ (Ace), ‘2’, ‘3’, ‘4’, ‘5’, ‘6’, ‘7’, ‘8’, ‘9’, ‘T’ (Ten), ‘J’ (Jack), ‘Q’ (Queen), ‘K’ (King)

So ‘AC’ is the Ace of Clubs, ‘4D’ is the Four of Diamonds, and ‘TH’ is the Ten of Spades.

Jacks that are attached to a card are represented with parenthese, where each attach card is listed as the card id (same pattern as above), and then ‘-’ followed by either ‘p0’ or ‘p1’ depending on who controls the card. So for example:

`p0Points: [‘3D’, ‘4S(JS-p0)’, ‘TH(JH-p0,JC-p1,JD-p0)’]`  
Indicates that player 0 has 3 point cards:

* Three of Diamonds  
* Four of Spades  
  * Has the Jack of Spades (controlled by p0) attached to it  
* Ten of Hearts  
  * Jack of Hearts (p0’s-bottom jack)  
  * Jack of Clubs (p1’s)  
  * Jack of Diamonds (p0’s-top jack)

Jacks are listed from bottom to top order, meaning that the last jack in the list is always the last one played and the one that determines who ultimately controls the point card.

# Backend Processing Layer

## Card

Represents a single card, in its object format.

1. id: `String` (same format as the gameStateRow cards e.g. ‘AS’ for Ace of Spades)  
2. suit: `0 | 1 | 2 | 3`  
3. rank: `[1- 13]`  
4. isFrozen: `Boolean` \- whether the card is currently frozen due to a 9 and can’t be played this turn

## Player

Represents one player in the game.

1. hand: `Array<Card>`  
2. points: `Array<Card>`  
3. faceCards: `Array<Card>`

## GameState

An uncompressed, object-oriented representation of a `GameStateRow` using the `saveGameState()` helper. Conversely, a `GameStateRow` can be converted to a `GameState` object using the `unpackGameState()` helper. Generally, game logic is processed using `GameState` objects and then the result is converted back to a `GameStateRow` to be persisted in the database.

1. id: primary key  
2. playedBy: `int?` 0 | 1 | null: Which player made the move (0 if p0, 1 if p1)  
3. moveType: `Enum (int?)` \- designates which kind of move was made. Corresponds to one of the following:  
   1. initialize  
   2. draw  
   3. points  
   4. scuttle  
   5. faceCard (king, queen, or glasses eight)  
   6. jack  
   7. untargetedOneOff  
   8. targetedOneOff  
   9. counter  
   10. resolve  
   11. resolveThree (picking a card from the scrap)  
   12. resolveFour (discarding from hand)  
   13. sevenPoints  
   14. sevenScuttle  
   15. sevenFaceCard  
   16. sevenJack  
   17. sevenUntargetedOneOff  
   18. sevenTargetedOneOff  
   19. Pass  
4. playedCard: `Card | null` \- which card was played if any in this latest move. This is not a “place” the card can be (as the card will be in the player’s points/wherever it was played), but is rather a description of which card was played for reference and logging  
5. targetCardId: `Card | null` \- which card was targeted by the current move. Used for 2’s, 9’s, jacks, and scuttling. This is not a “place” that cards can go, but rather a description of which card was targeted, for reference and logging   
6. discardedCards: `Array<Card>` \- which cards, if any were discarded from this move via resolving a 4 or 5\. This is not a “place” cards can exist on the board (as these cards will actually be in the scrap), but rather a description of which cards were discarded for reference and logging  
7. turn: `int` \- which turn number the move was made on  
8. phase: `enum` \- What phase of a turn the game is currently in. Used to validate which next-moves are legal  
   1. main \- ‘main’ player phase. Can make ‘regular’ moves:  
      1. draw  
      2. points  
      3. faceCard  
      4. jack  
      5. scuttle  
      6. untargetedOneOff  
      7. targetedOneOff  
   2. countering \- phase where players play counters. Only legal moves are   
      1. counter  
      2. resolve  
   3. resolvingThree \- Picking card from scrap. Only legal move is resolveThree  
   4. resolvingFour \- Choosing cards to discard. Only legal move is resolveFour  
   5. resolvingFive \- Choosing card to discard before drawing. Only legal move is resolveFive  
   6. resolvingSeven \- Picking one of the top cards from the deck. Must play a seven move next. Legal next moves:  
      1. sevenPoints  
      2. sevenFaceCard  
      3. sevenScuttle  
      4. sevenUntargetedOneOff  
      5. sevenTargetedOneOff  
      6. sevenJack  
9. p0: `Player`  
10. p1: `Player`  
11. deck: `Array<Card>`: Cards in the deck, in order (this removes the need for topCard and secondCard)  
12. scrap: `Array<Card>` \- the cards currently in the scrap  
13. oneOff: `Card | null` \- the current one-off that is waiting to resolve or be countered. Playing a oneOff removes the card from the player’s hand and puts it here while players counter back and forth until someone resolves, at which point the oneOff and all twos are scrapped and the effect resolves or fizzles base on the number of twos played   
14. oneOffTarget: `Card | null` \- when a 2 or 9 one-off is played, this describes which card is targeted by its effect  
15. oneOffTargetType `‘point’ | ‘faceCard’ | ‘jack’`  
    1. When the current oneOff is a 2/9, this describes where the target is located e.g. if the target is the 8 of hearts, is that a point card or face card (glasses)  
16. twos: `Array<Card>` \- array of twos that have been played to counter the current oneOff  
17. resolved: `Card | null` \- for a MoveType.RESOLVE move, this describes which oneOff just resolved or fizzled. This is not considered a “place” the cards can exist as the card is in the scrap at that point. Instead it’s just a description of which oneOff just resolved/fizzled.  
18. gameId: ID \- FK to the games table  
19. createdAt: `timestampz` \- When the move took place

# Api Layer

## Socket Payload

1. moveType: enum  
2. playerId: int  
3. playedCard?: Object (the card that was played)  
4. targetCard?: Object (the card that was targeted)  
5. attachedToTarget?: Object (the point card that the target was attached to if the target was a jack)  
6. gameOver: boolean  
7. game: Object (full game state)  
   1. id: int  
   2. name: string  
   3. status: enum  
      1. CREATED  
      2. STARTED  
      3. FINISHED  
      4. ARCHIVED  
   4. players: Array\<Player\>  
   5. passes: int  
   6. deck: Array\<Card\>  
   7. scrap: Array\<Card\>  
   8. oneOff: Card | null  
   9. oneOffTarget  
      1. nullable, card object | player  
   10. oneOffTargetType: enum  
       1. PLAYER  
       2. POINT\_CARD  
       3. FACE\_CARD  
       4. JACK  
   11. attachedToTarget: Card | null  
   12. twos : Array\<Card\>  
   13. turn: int  
   14. log  
       1. array of moves  
   15. spectatingUsers  
       1. array of users  
8. \<Player\>  
   1. Hand Array\<Card\>  
   2. Points Array\<Card\>  
   3. Face Cards Array\<Card\>  
   4. Name String  
   5. ID Int  
9. \<Card\>

   1. id: Int  
   2. suit: int  
   3. rank: int  
   4. Frozen: Bool

# Backend Control Flow

Generally, requests to make moves on the game will lock the requested game to prevent other requests from updating it, retrieve the latest game state, validate the requested move, make the requested changes, persist the changes in the database, and emit a socket event with the resulting state. This is done via a single endpoint in `api/controllers/game/move`. It delegates to move-specific helpers based on the `moveType` specified in the request body. These `execute()` and `validate()` helpers for each move live in a folder named after the move inside `api/helpers/gamestate/moves` e.g. `api/helpers/gamestate/moves/draw/execute.js`

// api/controller/game/move  
 // Request to make a move  
// Which move is requested is determined by req.body.moveType  
// Request to make a move  
module.exports \= async function (req, res) {  
 let game;  
 try {  
   const { saveGamestate, publishGameState, unpackGamestate } \= sails.helpers.gamestate;  
   // Use the execute and validate helpers specific to the requested moveType  
   const { execute, validate } \= sails.helpers.gamestate.moves\[req.body.moveType\];

   game \= await sails.helpers.lockGame(req.params.gameId);  
   const gameState \= unpackGamestate(game.gameStates.at(\-1));  
   if (\!game.gameStates.length || \!gameState) {  
     throw new Error({ message: 'Game has not yet started' });  
   }

   // Verify whether user is in requested game and as which player  
   let playedBy;  
   switch (req.session.usr) {  
     case game.p0.id:  
       playedBy \= 0;  
       break;  
     case game.p1.id:  
       playedBy \= 1;  
       break;  
     default:  
       throw new Error('You are not a player in this game\!');  
   }

   validate(gameState, req.body, playedBy);  
   const updatedState \= execute(gameState, req.body, playedBy);  
   const gameStateRow \= await saveGamestate(updatedState);  
   game.gameStates.push(gameStateRow);  
   await publishGameState(game, updatedState);  
   await sails.helpers.unlockGame(game.lock);

   return res.ok();  
 } catch (err) {  
   //unlock game if failing due to validation  
   if (game?.lock) {  
     try {  
       await sails.helpers.unlockGame(game.lock);  
     } catch (err) {  
       //fall through for generic error handling  
     }  
   }  
   return res.badRequest({ message: err.message });  
 }  
};

The `validate` helper functions (e.g. `sails.helpers.gamestate.move.draw.validate()`) will be MoveType-specific utilities that throw errors if the move is illegal e.g. because it is not your turn or because another move e.g. countering is ongoing.  
// api/helpers/moves/draw/validate.js  
const GameStatus \= require('../../utils/GameStatus.json');  
module.exports \= {  
 friendlyName: 'Validate whether draw is legal',

 description:  
   'Throws error if it is illegal for the requesting player to draw a card',

 inputs: {  
   currentState: {  
     type: 'ref',  
     description: 'The latest game state before the requesting player draws a card',  
     required: true,  
   },  
   requestedMove: {  
     type: 'ref',  
     description: 'The move being requested. Specifies which player is asking to draw a card'  
   }  
 },  
 sync: true, // synchronous helper  
 fn: ({ currentState, requestedMove }, exits) \=\> {  
   if (\!currentState) {  
     return exits.error({ message: 'Cannot draw because this game has not started yet' });  
   }

   switch (currentState.phase) {  
     // Only allowed phase  
     case GamePhase.MAIN:  
       break;  
     case GamePhase.COUNTERING:  
       return exits.error({ message: 'Cannot draw while players are countering one-offs' });  
     case GamePhase.RESOLVING\_THREE:  
       return exits.error({ message: 'Cannot draw while player is choosing card from scrap' });  
     case GamePhase.RESOLVE\_FOUR:  
       return exits.error({ message: 'Cannot draw while player chooses what to discard from 4'});  
     case GamePhase.RESOLVE\_FIVE:  
       return exits.error({ message: 'Cannot draw while player chooses what to discard for 5' });  
     case GamePhase.RESOLVING\_SEVEN:  
       return exits.error({ message: 'Cannot draw while someone is playing from the top of the deck' });  
     default:  
       return exits.error({ message: \`Cannot draw because game is corrupted. Unidentified phase: ${currentState.phase}\` });  
   }

   if (requestedMove.playedBy \!== (currentState.turn) % 2) {  
     return exits.error({message: "It's not your turn"});  
   }

   if (currentState.deck.length \< 1) {  
     return exits.error({message: 'No cards in deck'});  
   }

   return exits.success();  
 },  
};

The `execute()` helpers return a new GameState object that reflects the changes of a given move, including moving cards around, updating the turn, setting the phase, and which player played the move.

// api/helpers/moves/draw/execute.js  
const \_ \= require('lodash');

module.exports \= {  
 friendlyName: 'Draw a card',

 description:  
   'Returns new GameState resulting from requested draw move',

 inputs: {  
   currentState: {  
     type: 'ref',  
     description: 'The latest game state before the requesting player draws a card',  
     required: true,  
   },  
   /\*\*  
    \* @param {Object} requestedMove \- Object describing the request to draw  
    \* @param {1 | 0} requestedMove.playedBy \- Which player is drawing  
    \* @param { number } requestedMove.turn \- Turn number (should be 1 greater than currentState.turn)  
    \* @param { MoveType.DRAW } requestedMove.moveType \- Specifies that this a draw move  
    \*/  
   requestedMove: {  
     type: 'ref',  
     description: 'The move being requested. Specifies which player is asking to draw a card',  
   }  
 },  
 sync: true, // synchronous helper  
 fn: ({ currentState, requestedMove }, exits) \=\> {  
   const result \= \_.cloneDeep(currentState);  
   const player \= requestedMove.playedBy \=== 0 ? result.p0 : result.p1;

   // Move cards  
   const topCard \= result.deck.shift();  
   player.hand.push(topCard);

   result \= {  
     ...result,  
     ...requestedMove,  
   };

   return exits.success(result);  
 },  
};

The `emitGameState()` helper is used to send the latest game state to the client. For the MVP rollout, it will emit an event that matches the current data structure used by the client in production, e.g:

     Game.publish(\[fullGame.id\], {  
       change: 'points',  
       game: fullGame,  
       victory,  
     });

The published event should have the following shape:  
      
  {  
       change: MoveType,  
       game: PopulatedGame,  
       victory: { gameOver: boolean, winner: boolean | null, conceded: boolean, currentMatch: Match | null } 
  };


