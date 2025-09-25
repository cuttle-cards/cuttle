# Refactoring topCard and secondCard

We are refactoring the server and client so that the variables 'topCard' and 'secondCard' which are currently separated from the deck instead are treated as part of the deck when sent from the server and consumed by the client as computed properties reading from the deck at indices 0 and 1 respectively. This will allow for simpler processing when in the future we revise the socket events sent to server and client to be asymmetric based on which player is receiving the update.

To do this, we must:
1) Revise @create-socket-event.js so that the `deck` on the returned object is returned without modification instead of callling .slice()
2) Define computed properties in @game.js for topCard and SecondCard, which return index 0 and index 1 from the game's deck, coalescing into `null` if no card exists.