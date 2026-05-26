# Move History and Gamestate API

This doc outlines the database, backend processing, and client socket payload architecture of processing individual moves and their resulting game states in cuttle.cards. This powers the core game loop and facilitates a variety of features that leverage granular data collection and decouple the representation of where cards are located from the representation of the users so a given user can be in more than one game at once. In particular makes possible:

* Building the vs AI experience into the main application   
* Watchable game replayed of completed games   
* Async play
* Strategic analysis of gameplay

# Enums

## GamePhase

Enum describing the phase of a turn the game is currently in. Used to validate which next-moves are legal.

* main \- 'main' player phase. Can make 'regular' moves:  
   * draw  
   * points  
   * faceCard  
   * jack  
   * scuttle  
   * untargetedOneOff  
   * targetedOneOff  
* countering \- phase where players play counters. Only legal moves are   
   * counter  
   * resolve  
* resolvingThree \- Picking card from scrap. Only legal move is resolveThree  
* resolvingFour \- Choosing cards to discard. Only legal move is resolveFour  
* resolvingFive \- Choosing card to discard before drawing. Only legal move is resolveFive  
* resolvingSeven \- Picking one of the top cards from the deck. Must play a seven move next. Legal next moves:  
   * sevenPoints  
   * sevenFaceCard  
   * sevenScuttle  
   * sevenUntargetedOneOff  
   * sevenTargetedOneOff  
   * sevenJack  
* discardingToHandLimit \- discarding due to hand limit at end of turn. Only legal move is discardToHandLimit  
* consideringStalemate \- deciding whether to accept opponent's stalemate request. Only legal moves are stalemateAccept and stalemateReject

## MoveType

Enum designating which kind of move was made.

* initialize  
* draw  
* points  
* scuttle  
* faceCard (king, queen, or glasses eight)  
* jack  
* untargetedOneOff  
* targetedOneOff  
* counter  
* resolve  
* resolveThree (picking a card from the scrap)  
* resolveFour (discarding from hand)  
* sevenPoints  
* sevenScuttle  
* sevenFaceCard  
* sevenJack  
* sevenUntargetedOneOff  
* sevenTargetedOneOff  
* pass  
* discardToHandLimit  
* stalemateRequest  
* stalemateReject  
* stalemateAccept

# Database Layer

## Game

The `Game` object/table is reduced to the metadata about the game that doesn’t generally change while a game is played. It has the game’s id, name, the ids of which users are p0 and p1.

* id: primary key  
* name: `String`  
* p0: `int` fk (user) \- id of which user is player 0  
* p1: `int` fk (user) \- id of which user is player 1  
* p0Ready: `boolean` \- whether p0 is ready for the game to start  
* p1Ready: `boolean` \- whether p1 is ready for the game to start  
* status: `int` (enum) \- what state of the game lifecycle we are in  
   *   "CREATED" : 1,  
   *   "STARTED" : 2,  
   *   "FINISHED" : 3,  
   *   "ARCHIVED" : 4  
* lock: `String` \- UUID specifying which request currently locked the game for updates  
* lockedAt: `timestampz` \- Time the game was last locked  
* winner: `int` fk (user) \- which user won the game  
* match: `int` fk(match) \- which match the game is part of

## GameStateRow

A GameState record represents one move made by a player and the resulting game state. It contains a breadth of data that can be used to power various features and analysis within a given game and across games. GameStateRows are compressed using domain-specific string\[\] lists to represent the cards. They can be uncompressed into the `GameState` object with the `unpackGameState()` helper.

* id: primary key  
* playedBy: `int` 0 | 1: Which player made the move (0 if p0, 1 if p1)  
* moveType: `MoveType` \- designates which kind of move was made  
* turn: `int` \- which turn number the move was made on  
* phase: `GamePhase` \- What phase of a turn the game is currently in. Used to validate which next-moves are legal  
* playedCard: `String | null` the card that was played  
* targetCard: `String | null` the card that was targeted  
* discardedCards: `Array<String>`  
* p0Hand: `Array<String>`  
   * Specially formatted string representing the list of cards in p0’s hand. See [‘Game State Array\<String\> Lists](#game-state-array\<string\>-lists) below for full explanation  
   * ex) `[‘AC’, ‘5H’, ‘8D(JS-p0,JD-p1,JH-p0)’]`  
      * P0 hand has the Ace of Clubs, 5 of Hearts, 8 of Diamonds  
         * 8 of diamonds has the jack of spades, jack of diamonds, and jack of hearts on it  
* p1Hand: `Array<String>`: Cards in p1 hand  
* p0Points: `Array<String>`: Cards in p0 points  
* p1Points: `Array<String>`  
* p0FaceCards: `Array<String>`  
* p1FaceCards: `Array<String>`  
* deck: `Array<String>`: Cards in the deck, in order (this removes the need for topCard and secondCard)  
* scrap: `Array<String>`  
* oneOff: `String | null`  
* oneOffTarget: `String | null`  
* twos: `Array<String>`  
* resolving: `String`  
* gameId: ID \- FK to the games table  
* createdAt: `timestampz` \- When the move took place

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

* id: `String` (same format as the gameStateRow cards e.g. ‘AS’ for Ace of Spades)  
* suit: `0 | 1 | 2 | 3`  
* rank: `[1- 13]`  
* isFrozen: `Boolean` \- whether the card is currently frozen due to a 9 and can’t be played this turn

## Player

Represents one player in the game.

* hand: `Array<Card>`  
* points: `Array<Card>`  
* faceCards: `Array<Card>`


## GameState

An uncompressed, object-oriented representation of a `GameStateRow`, created using the `unpackGameState()` helper used for all game logic processing e.g. validating which moves are legal and executing the change of a given move. Conversely, a `GameState` can be converted to a `GameStateRow` object using the `packGameState()` helper. Generally, game logic is processed using `GameState` objects and then the result is converted + saved with `saveGameState()`.

* id: primary key  
* playedBy: `int?` 0 | 1 | null: Which player made the move (0 if p0, 1 if p1)  
* moveType: `MoveType` \- designates which kind of move was made  
* playedCard: `Card | null` \- which card was played if any in this latest move. This is not a “place” the card can be (as the card will be in the player’s points/wherever it was played), but is rather a description of which card was played for reference and logging  
* targetCardId: `Card | null` \- which card was targeted by the current move. Used for 2’s, 9’s, jacks, and scuttling. This is not a “place” that cards can go, but rather a description of which card was targeted, for reference and logging   
* discardedCards: `Array<Card>` \- which cards, if any were discarded from this move via resolving a 4 or 5\. This is not a “place” cards can exist on the board (as these cards will actually be in the scrap), but rather a description of which cards were discarded for reference and logging  
* turn: `int` \- which turn number the move was made on  
* phase: `GamePhase` \- What phase of a turn the game is currently in. Used to validate which next-moves are legal  
* p0: `Player`  
* p1: `Player`  
* deck: `Array<Card>`: Cards in the deck, in order (this removes the need for topCard and secondCard)  
* scrap: `Array<Card>` \- the cards currently in the scrap  
* oneOff: `Card | null` \- the current one-off that is waiting to resolve or be countered. Playing a oneOff removes the card from the player’s hand and puts it here while players counter back and forth until someone resolves, at which point the oneOff and all twos are scrapped and the effect resolves or fizzles base on the number of twos played   
* oneOffTarget: `Card | null` \- when a 2 or 9 one-off is played, this describes which card is targeted by its effect  
* oneOffTargetType `‘point’ | ‘faceCard’ | ‘jack’`  
    * When the current oneOff is a 2/9, this describes where the target is located e.g. if the target is the 8 of hearts, is that a point card or face card (glasses)  
* twos: `Array<Card>` \- array of twos that have been played to counter the current oneOff  
* resolved: `Card | null` \- for a MoveType.RESOLVE move, this describes which oneOff just resolved or fizzled. This is not considered a “place” the cards can exist as the card is in the scrap at that point. Instead it’s just a description of which oneOff just resolved/fizzled.  
* gameId: ID \- FK to the games table  
* createdAt: `timestampz` \- When the move took place

# Api Layer

## Socket Payload

* moveType: MoveType  (which type of move was done last)
* playerId: int  
* playedCard?: Object (the card that was played)  
* targetCard?: Object (the card that was targeted)  
* attachedToTarget?: Object (the point card that the target was attached to if the target was a jack)  
* gameOver: boolean  
* game: Object (full game state)  
   * id: int  
   * name: string  
   * status: enum  
      * CREATED  
      * STARTED  
      * FINISHED  
      * ARCHIVED  
   * players: Array\<Player\>  
   * passes: int  
   * deck: Array\<Card\>  
   * scrap: Array\<Card\>  
   * oneOff: Card | null  
   * oneOffTarget  
      * nullable, card object | player  
   * oneOffTargetType: enum  
       * PLAYER  
       * POINT\_CARD  
       * FACE\_CARD  
       * JACK  
   * attachedToTarget: Card | null  
   * twos : Array\<Card\>  
   * turn: int  
   * phase: GamePhase  
   * log  
       * array of moves  
   * spectatingUsers  
       * array of users  
* \<Player\>  
   * Hand Array\<Card\>  
   * Points Array\<Card\>  
   * Face Cards Array\<Card\>  
   * Name String  
   * ID Int  
* \<Card\>

   * id: Int  
   * suit: int  
   * rank: int  
   * Frozen: Bool

# Backend Control Flow

Generally, requests to make moves on the game will lock the requested game to prevent other requests from updating it, retrieve the latest game state, validate the requested move, make the requested changes, persist the changes in the database, and emit a socket event with the resulting state. This is done via a single endpoint in `api/controllers/game/move`. It delegates to move-specific helpers based on the `moveType` specified in the request body. These `execute()` and `validate()` helpers for each move live in a folder named after the move inside `api/helpers/gamestate/moves` e.g. `api/helpers/gamestate/moves/draw/execute.js`

```javascript
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
```

The `validate` helper functions (e.g. `sails.helpers.gamestate.move.draw.validate()`) will be MoveType-specific utilities that throw errors if the move is illegal e.g. because it is not your turn or because another move e.g. countering is ongoing.  
```javascript
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
  fn: ({ currentState, playedBy }, exits) => {
    try {

      // Must be MAIN phase of the turn
      if (currentState.phase !== GamePhase.MAIN) {
        throw new BadRequestError('game.snackbar.global.notInMainPhase');
      }

      // Must be your turn
      if (currentState.turn % 2 !== playedBy) {
        throw new BadRequestError('game.snackbar.global.notYourTurn');
      }

      // Deck must have cards
      if (!currentState.deck.length) {
        throw new BadRequestError('game.snackbar.draw.deckIsEmpty');
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
```

The `execute()` helpers return a new GameState object that reflects the changes of a given move, including moving cards around, updating the turn, setting the phase, and which player played the move.

```javascript
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
  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const player = playedBy ? result.p1 : result.p0;

    player.hand.push(result.deck.shift());
    const playerMustDiscard = player.hand.length > 8;

    result = {
      ...result,
      ...requestedMove,
      phase: playerMustDiscard ? GamePhase.DISCARDING_TO_HAND_LIMIT : GamePhase.MAIN,
      turn: playerMustDiscard ? result.turn : result.turn + 1,
      playedBy,
      playedCard: null,
      targetCard: null,
      discardedCards: [],
      resolved: null,
    };

    return exits.success(result);
  },
};
```

The `publishGameState()` helper is used to send the latest game state to the client. For the MVP rollout, it will emit an event that matches the current data structure used by the client in production, e.g:

```javascript
     Game.publish(\[fullGame.id\], {  
       change: 'points',  
       game: fullGame,  
       victory,  
     });
```
The published event should have the following shape:  

```javascript
  const socketUpdate = {  
       change: MoveType,  
       game: PopulatedGame,  
       victory: { gameOver: boolean, winner: boolean | null, conceded: boolean, currentMatch: Match | null } 
  };
```
