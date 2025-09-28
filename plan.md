# Creating asymmetric socket updates
We are modifying the codebase to refactor the socket data structure so that different clients subscribed to a particular game will receive different event payloads based on their relationship to the game: p0, p1, or spectator. p1 and p0 will have imperfect information i.e. they will have `{ isHidden: true }` instead of card objects for their opponents' hands and the deck.

This will require the following changes:

## Steps

### Outline
* Update all calls to Game.subscribe()
* Create a new helper to publish a socket update
* Revise client-side socket event processing
* Revise client checks on when to show card fronts vs backs
* Revise e2e tests to reflect changes
* Revise unit tests to reflect changes
* Refactor rematch flow subscription
* Investigate hand sorting


### 1. Update all calls to Game.subscribe()
Instead of a single socket room for each game id, (which forces all subscribers to receive the same events with the same payloads), we will now need to create up 2-3 socket rooms per game: one for each perspective - p0, p1, and spectator. These socket rooms will be called 'game_:id_p0', 'game_:id_p1', and 'game_:id_spectator', respectively, where :id is the id of the game in question.

This way each time a user subscribes to a game, they will do so via a specific relationship to that game (p0, p1, or spectator) and the events they receive will be specific to their relationship.

To do so, we'll need to update every call to Game.subscribe() to replace it with calls to `sails.sockets.join(req, roomName)`, where the roomName is determined to be one of the above three based on whether the user is subscribing to the game as p0, as p1, or as a spectator, as determined by which endpoint is being used and where in the control flow of the endpoint the subscription happens.

### 2. Create a new helper to publish a socket update
Once users are subscribed to separate rooms based on their relationship to the game in step 1., we will then need to revise how we send socket events to clients so that we create three socket event payloads whenever we update, where each is customized for its respective room. All the serverside calls to `createSocketEvent()` found inside @api will need to be revised in order to call a new helper called `publishGameState()` which creates all three data structures and sends them to their respective rooms with `sails.sockets.broadcast()`.

#### 2a.
To do this, we will rename and revise @create-socket-event to call it `create-socket-events` and update its returned data to wrap it in an additional object layer like `{p0State, p1State, spectatorState}`, where `spectatorState` is the object currently returned by `create-socket-event` and `p0State` and `p1State` are alterations of that object to replace certain card objects with hidden card placeholders shaped as: `{ isHidden: true }` if the player in question is not allowed to know which card it is.

Players p0 and p1 should not be allowed to see:
* any of the cards in their opponents hand unless:
  * the player has a card with rank 8 in their `faceCards` list (this is called having a glasses eight and it reveals your opponent's hand) OR
  * the deck is empty
* any of the cards in the deck unless:
  * the gameState's `phase` is `GamePhase.RESOLVING_SEVEN` in which case both players may see the first two cards in the deck only, leaving the rest hidden.

#### 2b.
Once `create-socket-events.js` returns an object with all three socket events: `{p0State, p1State, spectatorState}`, we should create a new helper `publishGameState(gameState)` in @api/helpers/game-states which calls `createSocketEvents()` to create all three event payloads, and then broadcasts each to its respective room with `sails.sockets.broadcast()` giving each the event name (second argument) `'game'`.

#### 2c.
Once the publish `publishGameState()` helper is available, we should revise the existing calls to `createSocketEvent()` throughout the @api folder so as to utilize `publishGameState()` where appropriate:
* @get-game.js should verify whether the user p0, p1, or a spectator of the requested game by checking their user id (`req.usr`) against game.p0, game.p1, and any of the populated `userSpectatingGame` objects on the requested game. It should then use `createSocketEvents()` and respond with the socket event corresponding to the relationship the user has to the game. (If the user is none of the above, they should be made a spectator by creating a `UserSpectatingGame` row for them as seen in @spectate/join.js and then sent the spectatorState). It should not call publishGameState() as this endpoint just responds with data w/o a socket update
* !load-fixture-gamestate.js should treat the requeseting user as a spectator and respond with the spectatorState created by `createSocketEvents()`. It should not call publishGameState() as this endpoint just responds with data w/o a socket update
* move.js should call `publishGameState()` instead of `createSocketEvent()` and should remove the call to `Game.publish()` as this is replaced by `publishGameState()`
* @spectate/join.js should treat the user as a spectator and respond with the `spectatorState` from `createGameStates()`. It should leave the call to `Game.publish()` because that only updates the list of spectators.
* deal-cards should call `publishGameState()` instead of `createSocketEvent()` and `Game.publish()`

### 3. Revise client-side socket event processing
Once clients are correctly subscribe to their specific rooms and receiving data, we need to ensure that the data is properly received and processed. In particular, we need to ensure that any cards represented as `{ isHidden: true }` are accepted and left in-tact without adding ids etc when they're processed in @game.js in the `updateGame()` function. We should do this by updating `createGameCard()` to short circut these hidden cards to leave them as-is.

### 4. Revise client checks on when to show card fronts vs backs
Once the client is properly receving the updated data structure with the hidden cards, we should revise the template code in @GameView.vue so that hiding of the opponent's hand is managed on an individual card basis based on whether the card has a suit and rank. We should delete the `isBeingDiscarded()` function and update the `:suit` and `:rank` prop values to be `card.suit ?? undefined` and `card.rank ?? undefined` so that whether the cards are shown is left up to the server based on whether the cards have suits and ranks.

### 5. Revise e2e tests to reflect changes
We will need to investigate and revise the e2e tests to ensure they reflect the changes made to the application. In particular, tests asserting the state as p0 or p1 will no longer be able to verify the suit and rank of hidden cards. This will likely require a change to `assertStoreMatchesFixture()` and possibly `assertDOMMatchesFixture()` in @helpers.js, along with other possible changes. We should conduct an inventory and analysis of which changes are necessary to make the tests reflect these new expectations

### 6. Revise unit tests to reflect changes
Similarly, we will need to adjust the unit tests. In particular, we should revise the socket data structures in the @fixtures/game-states directory to have separate socket states for each of the new perspectives, correctly replacing cards which should not be visible with `{ isHidden: true }` in the p0State and p1State states for each case.