const { game: gameText } = require('../src/translations/en.json');
const MoveType = require('./MoveType.json');
const { getCardName } = require('./game-utils');

function getLogMessage(game, gameState) {
  const { moveType, playedCard, targetCard, oneOff, oneOffTarget, deck, twos, discardedCards } = gameState;

  //second to last because last would be current gameState
  const previousRow = game.gameStates[game.gameStates.length - 2] ?? null;

  const player = game[`p${gameState.playedBy}`]?.username;
  const opponent = game[`p${gameState.playedBy % 2}`]?.username;

  const playedCardName = playedCard ? getCardName(playedCard) : null;
  const targetCardName = targetCard ? getCardName(targetCard) : null;
  const oneOffCardName = oneOff ? getCardName(oneOff) : null;

  const getResolveFiveMessage = () => {
    const amountOfCardsDrawn =
      gameState[`p${gameState.playedBy}Hand`]?.length - previousRow[`p${gameState.playedBy}Hand`?.length];

    return amountOfCardsDrawn === 1 ? `draws 1 card` : `draws ${amountOfCardsDrawn} cards`;
  };

  switch (moveType) {
    case MoveType.DRAW:
      return `${player} drew a card.`;

    case MoveType.POINTS:
      return `${player} played the ${playedCardName} for points.`;

    case MoveType.SCUTTLE:
      return `${player} scuttled ${opponent}'s ${targetCardName} 
      with the ${playedCardName}.`;

    case MoveType.FACECARD:
      return `${player} played the ${playedCardName}
      ${playedCard.rank === 8 ? ' as a glasses eight.' : '.'}`;

    case MoveType.JACK:
      return `${player} stole ${opponent}'s ${targetCardName} with the ${playedCardName}.`;

    case MoveType.UNTARGETED_ONE_OFF:
      return `${player} played the ${playedCardName} as a one-off to 
      ${gameText.moves.effects[playedCard.rank]}.`;

    case MoveType.TARGETED_ONE_OFF:
      return `${player} played the ${playedCardName} as a one-off to: ${
        gameText.moves.effects[playedCard.rank]
      }, targeting the ${targetCardName}.`;

    case MoveType.COUNTER:
      if (twos.length > 0) {
        return `${player} played the ${playedCardName} to counter ${opponent}'s ${getCardName(
          twos[twos.length - 1],
        )}.`;
      }
      return `${player} played the ${playedCardName} to counter 
      ${opponent}'s ${oneOffCardName}.`;

    case MoveType.RESOLVE:
      switch (oneOff?.rank) {
        case 1:
          return `The ${oneOffCardName} one-off resolves; all point cards are scrapped.`;
        case 2:
          return `The ${oneOffCardName} resolves; the ${getCardName(oneOffTarget)} is scrapped.`;
        case 3:
          return `The ${oneOffCardName} one-off resolves; 
          ${player} will draw one card of their choice from the Scrap pile.`;
        case 4:
          return `The ${oneOffCardName} one-off resolves; ${opponent} must discard two cards.`;
        case 5:
          return `The ${oneOffCardName} one-off resolves;
           ${player} must discard 1 card, and will draw up to 3.`;
        case 6:
          return `The ${oneOffCardName} one-off resolves; all Royals and Glasses are scrapped.`;

        case 7:
          if (deck.length < 2) {
            return `The ${oneOffCardName} one-off resolves. 
            They will play the ${getCardName(deck[0])} as it is the last card in the deck.`;
          }
          return `The ${oneOffCardName} one-off resolves; 
          they will play one card from the top two in the deck. Top 
          two cards are the ${getCardName(deck[0])} and ${getCardName(deck[1])}.`;

        case 9:
          return `The ${oneOffCardName} one-off resolves, returning the ${getCardName(oneOffTarget)} to 
          ${opponent}'s hand. It cannot be played next turn.`;
      }
      break;

    case MoveType.RESOLVE_THREE:
      return `${player} took the ${targetCardName} from the Scrap pile to their hand.`;

    case MoveType.RESOLVE_FOUR:
      return `${player} discarded the ${getCardName(discardedCards[0])} 
      ${discardedCards.length > 1 ? `and the ${getCardName(discardedCards[1])}` : '.'}`;

    case MoveType.RESOLVE_FIVE:
      if (discardedCards.length) {
        return `${player} discards the ${getCardName(discardedCards[0])}
        and ${getResolveFiveMessage()}`;
      }
      return `${player} ${getResolveFiveMessage()}`;

    case MoveType.SEVEN_POINTS:
      return `${player} played the ${playedCardName} from the top of the deck for points.`;

    case MoveType.SEVEN_SCUTTLE:
      return `${player} scuttled ${opponent}'s ${targetCardName} with the ${playedCardName} from the top of the deck.`;

    case MoveType.SEVEN_FACECARD:
      return `${player} played the ${playedCardName} from the top of the deck
      ${playedCard.rank === 8 ? ' as a Glasses eight.' : '.'}`;

    case MoveType.SEVEN_JACK:
      if (!targetCard) {
        return `${player} scrapped ${playedCardName}, since there are no point cards to steal on ${opponent}'s field.`;
      }
      return `${player} stole ${opponent}'s ${targetCardName} with the ${playedCardName} from the top of the deck.`;

    case MoveType.SEVEN_UNTARGETED_ONE_OFF:
      return `${player} played the ${playedCardName} from the top of the deck as a one-off to 
      ${gameText.moves.effects[playedCard.rank]}.`;

    case MoveType.SEVEN_TARGETED_ONE_OFF:
      return `${player} played the ${playedCardName} from the top of the deck as a one-off to 
      ${gameText.moves.effects[playedCard.rank]}, targeting the ${targetCardName}.`;

    case MoveType.PASS:
      return `${player} passes.`;
  }
}

module.exports = { getLogMessage };
