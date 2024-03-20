const SnackBarError = {
  NOT_YOUR_TURN: "It's not your turn",
  ILLEGAL_SCUTTLE:
    "You can only scuttle if your card's rank is higher, or the rank is the same, and your suit is higher (Clubs < Diamonds < Hearts < Spades)",
  FROZEN_CARD: 'That card is frozen! You must wait a turn to play it',
  NOT_IN_GAME: "You can't do that because you're not a player in this game",
  GAME_IS_FULL: `Cannot join that game because it's already full`,
  CANT_FIND_GAME: "Can't find game"
};

export { SnackBarError };
