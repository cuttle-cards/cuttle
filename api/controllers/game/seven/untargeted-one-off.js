const { game:gameText } = require('../../../../src/translations/en.json');
const { getCardName } = require('../../../../utils/game-utils');

module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  const promiseOpponent = userService.findUser({ userId: req.body.opId });
  Promise.all([ promiseGame, promisePlayer, promiseCard, promiseOpponent ])
    .then(function changeAndSave(values) {
      const [ game, player, card, opponent ] = values;
      if (game.turn % 2 === player.pNum) {
        if (game.topCard.id === card.id || game.secondCard.id === card.id) {
          switch (card.rank) {
            case 1:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7: {
              switch (card.rank) {
                case 3:
                  if (game.scrap.length === 0)
                  {
                    return Promise.reject({
                      message: 'game.snackbar.oneOffs.three.scrapIsEmpty',
                    });
                  }
                  break;
                case 4:
                  if (opponent.hand.length === 0)
                  {
                    return Promise.reject({
                      message: 'game.snackbar.oneOffs.four.opponentHasNoCards',
                    });
                  }
                  break;
                case 5:
                case 7:
                  if (!game.topCard)
                  {
                    return Promise.reject({
                      message: 'game.snackbar.oneOffs.emptyDeck',
                    });
                  }
                  if (game.topCard.id === card.id && !game.secondCard)
                  {
                    return Promise.reject({
                      message: 'game.snackbar.oneOffs.seven.oneCardInDeck',
                    });
                  }
                  break;
              }
              const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({
                game: game,
                index: req.body.index,
              });
              const gameUpdates = {
                topCard,
                secondCard,
                resolving: null,
                oneOff: card.id,
                log: [
                  ...game.log,
                  `${player.username} played the ${getCardName(card)} from the top of the deck as a one-off to ${gameText.moves.effects[card.rank]}.`,
                ],
                lastEvent: {
                  change: 'sevenOneOff',
                  pNum: req.session.pNum,
                },
              };
              const updatePromises = [
                Game.updateOne(game.id).set(gameUpdates),
                Game.removeFromCollection(game.id, 'deck').members(cardsToRemoveFromDeck),
              ];
              return Promise.all([ game, ...updatePromises ]);
            }
            default:
              return Promise.reject({
                message: 'game.snackbar.oneOffs.cantPLayWithoutATarget',
              });
          }
        } else {
          return Promise.reject({
            message: 'game.snackbar.oneOffs.seven.pickAndPlay',
          });
        }
      } else {
        return Promise.reject({ message: 'game.snackbar.global.notYourTurn' });
      }
    })
    .then(function populateGame(values) {
      const [ game ] = values;
      return Promise.all([ gameService.populateGame({ gameId: game.id }), game ]);
    })
    .then(async function publishAndRespond(values) {
      const [ fullGame, gameModel ] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([ fullGame.id ], {
        change: 'sevenOneOff',
        game: fullGame,
        pNum: req.session.pNum,
        victory,
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
