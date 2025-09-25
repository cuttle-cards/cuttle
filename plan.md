# Creating asymmetric socket updates
We are modifying the codebase to refactor the socket data structure so that different clients subscribed to a particular game will receive different event payloads based on their relationship to the game: p0, p1, or spectator. p1 and p0 will have imperfect information i.e. they will have `{ isHidden: true }` instead of card objects for their opponents' hands and the deck.

This will require the following changes:

## Steps

### 1. 
* Define a new helper `game/subscribe`
* Update all calls to Game.subscribe