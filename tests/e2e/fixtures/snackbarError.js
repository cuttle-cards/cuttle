const SnackBarError = {
  NOT_YOUR_TURN: 'It\'s not your turn',
  ILLEGAL_SCUTTLE:
    'You can only scuttle if your card\'s rank is higher, or the rank is the same, and your suit is higher (Clubs < Diamonds < Hearts < Spades)',
  FROZEN_CARD: 'That card is frozen! You must wait a turn to play it',
  NOT_IN_GAME: 'You are not a player in this game!',
  GAME_IS_FULL: `Cannot join that game because it's already full`,
  CANT_FIND_GAME: 'Can\'t find game',
  ONE_OFF: {
    THREE_EMPTY_SCRAP: 'You can only play a 3 as a one-off if there are non-three cards in the scrap pile',
    FOUR_EMPTY_HAND: 'You cannot play a 4 as a one-off while your opponent has no cards in hand',
    EMPTY_DECK: 'You can\'t play that one-off unless there are cards in the deck',
    NINE: {
      BLOCKED_BY_ANY_QUEEN: 'You cannot play a Nine as a One-Off while your opponent has a Queen',
      NEED_TWO_TARGETS: 'Your opponent needs at least two cards you can target for a Nine',
      MUST_SELECT_TWO_TARGETS: 'A Nine must target exactly two cards',
      DUPLICATE_TARGET: 'A Nine must target two different cards',
    },
    // Shared by twos and nines -- both may only target the top jack of a stack
    ONLY_TOP_JACK: 'You can only target the top Jack of a stack',
  }
};

export { SnackBarError };
