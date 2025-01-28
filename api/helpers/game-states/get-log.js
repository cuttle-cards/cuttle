const MoveType = require('../../../utils/MoveType.json');
const { getCardName } = require('../../../utils/game-utils');
const { game: gameText } = require('../../../src/translations/en.json');

module.exports = {
  friendlyName: 'Get Game Log Messages',

  description: 'Return a game log based on game moves played',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game object, with populated .gameStates',
      required: true,
    },
  },
  sync: true,

  fn: function ({ game }, exits) {
    const getMessage = (row, i) => {
      const { moveType, playedCard, targetCard, resolved, deck, twos, discardedCards } = row;
      const { convertStrToCard } = sails.helpers.gameStates;

      const getFullCardName = (card) => {
        const cardObject = convertStrToCard(card);
        return getCardName(cardObject);
      };

      const player = game[`p${row.playedBy}`]?.username;
      const opponent = game[`p${row.playedBy % 2}`]?.username;

      const playedCardName = playedCard ? getFullCardName(playedCard) : null;
      const targetCardName = targetCard ? getFullCardName(targetCard) : null;
      const resolvedCardName = resolved ? getFullCardName(resolved) : null;

      const getResolveFiveMessage = () => {
        const previousRow = game.gameStates[i - 1] ?? null;
        const amountOfCardsDrawn =
          row[`p${row.playedBy}Hand`]?.length - previousRow[`p${row.playedBy}Hand`?.length];

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

        case MoveType.FACE_CARD:
          return `${player} played the ${playedCardName}
        ${playedCard.rank === 8 ? ' as a glasses eight.' : '.'}`;

        case MoveType.JACK:
          return `${player} stole ${opponent}'s ${targetCardName} with the ${playedCardName}.`;

        case MoveType.ONE_OFF: {
          const playedCardObj = convertStrToCard(playedCard);
          let log = `${player} played the ${playedCardName} as a one-off to 
        ${gameText.moves.effects[playedCardObj.rank]}`;
          if (targetCardName) {
            log += `, targeting the ${targetCardName}.`;
          } else {
            log += '.';
          }
          return log;
        }

        case MoveType.COUNTER:
          if (twos.length > 0) {
            return `${player} played the ${playedCardName} to counter ${opponent}'s 
            ${getFullCardName(twos[twos.length - 1])}.`;
          }
          return `${player} played the ${playedCardName} to counter 
        ${opponent}'s ${resolvedCardName}.`;

        case MoveType.FIZZLE:
          return `The ${getFullCardName(
            resolved,
          )} is countered, and all cards played this turn are scrapped.`;

        case MoveType.RESOLVE:
          switch (convertStrToCard(resolved).rank) {
            case 1:
              return `The ${resolvedCardName} one-off resolves; all point cards are scrapped.`;
            case 2:
              return `The ${resolvedCardName} resolves; the ${targetCardName} is scrapped.`;
            case 3:
              return `The ${resolvedCardName} one-off resolves; ${player} will draw one card of their choice from the Scrap pile.`;
            case 4:
              return `The ${resolvedCardName} one-off resolves; ${opponent} must discard two cards.`;
            case 5:
              return `The ${resolvedCardName} one-off resolves; ${player} must discard 1 card, and will draw up to 3.`;
            case 6:
              return `The ${resolvedCardName} one-off resolves; all Royals and Glasses are scrapped.`;

            case 7:
              if (deck.length < 2) {
                return `The ${resolvedCardName} one-off resolves. They will play the ${getFullCardName(
                  deck[0],
                )} as it is the last card in the deck.`;
              }
              return `The ${resolvedCardName} one-off resolves; they will play one card from the top two in the deck. Top two cards are the ${getFullCardName(
                deck[0],
              )} and ${getFullCardName(deck[1])}.`;

            case 9:
              return `The ${resolvedCardName} one-off resolves, returning the ${targetCardName} to ${opponent}'s hand. It cannot be played next turn.`;
          }
          break;

        case MoveType.RESOLVE_THREE:
          return `${player} took the ${targetCardName} from the Scrap pile to their hand.`;

        case MoveType.RESOLVE_FOUR:
          return `${player} discarded the ${getFullCardName(discardedCards[0])} ${
            discardedCards.length > 1 ? `and the ${getFullCardName(discardedCards[1])}` : '.'
          }`;

        case MoveType.RESOLVE_FIVE:
          if (discardedCards.length) {
            return `${player} discards the ${getFullCardName(
              discardedCards[0],
            )} and ${getResolveFiveMessage()}`;
          }
          return `${player} ${getResolveFiveMessage()}`;

        case MoveType.SEVEN_POINTS:
          return `${player} played the ${playedCardName} from the top of the deck for points.`;

        case MoveType.SEVEN_SCUTTLE:
          return `${player} scuttled ${opponent}'s ${targetCardName} with the ${playedCardName} from the top of the deck.`;

        case MoveType.SEVEN_FACE_CARD:
          return `${player} played the ${playedCardName} from the top of the deck ${
            playedCard.rank === 8 ? ' as a Glasses eight.' : '.'
          }`;

        case MoveType.SEVEN_JACK:
          if (!targetCard) {
            return `${player} scrapped ${playedCardName}, since there are no point cards to steal on ${opponent}'s field.`;
          }
          return `${player} stole ${opponent}'s ${targetCardName} with the ${playedCardName} from the top of the deck.`;

        case MoveType.SEVEN_DISCARD:
          return `${player} discarded the ${playedCardName} since neither of the top two cards could be played.`;

        case MoveType.SEVEN_UNTARGETED_ONE_OFF:
          return `${player} played the ${playedCardName} from the top of the deck as a one-off to ${
            gameText.moves.effects[playedCard.rank]
          }.`;

        case MoveType.SEVEN_TARGETED_ONE_OFF:
          return `${player} played the ${playedCardName} from the top of the deck as a one-off to ${
            gameText.moves.effects[playedCard.rank]
          }, targeting the ${targetCardName}.`;

        case MoveType.PASS:
          return `${player} passes.`;
      }
    };

    const fullLog = game.gameStates.map((row, i) => {
      return getMessage(row, i);
    });
    return exits.success(fullLog);
  },
};
