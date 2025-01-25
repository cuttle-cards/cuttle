const SnackBarError = {
  NOT_YOUR_TURN: "It's not your turn",
  ILLEGAL_SCUTTLE:
    "You can only scuttle if your card's rank is higher, or the rank is the same, and your suit is higher (Clubs < Diamonds < Hearts < Spades)",
  FROZEN_CARD: 'That card is frozen! You must wait a turn to play it',
  NOT_IN_GAME: 'You are not a player in this game!',
  GAME_IS_FULL: `Cannot join that game because it's already full`,
  CANT_FIND_GAME: "Can't find game",
  ONE_OFF: {
    THREE_EMPTY_SCRAP: 'You can only play a 3 as a one-off if there are cards in the scrap pile',
    FOUR_EMPTY_HAND: 'You cannot play a 4 as a one-off while your opponent has no cards in hand',
    EMPTY_DECK: "You can't play that one-off unless there are cards in the deck",
  }
};

export { SnackBarError };
