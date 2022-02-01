module.exports = function (req, res) {
  const promiseGame = gameService.findGame({gameId: req.session.game});
  const promisePlayer = userService.findUser({userId: req.session.usr});
  const promiseCard = cardService.findCard({cardId: req.body.cardId});
  const promiseOpponent = userService.findUser({userId: req.body.opId});
  Promise.all([promiseGame, promisePlayer, promiseCard, promiseOpponent])
    .then(function changeAndSave(values) {
      const [game, player, card, opponent] = values;
      if (game.turn % 2 === player.pNum) {
        if (game.topCard.id === card.id || game.secondCard.id === card.id) {
          switch (card.rank) {
            case 1:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
              switch (card.rank) {
                case 3:
                  if (game.scrap.length === 0) return Promise.reject({message: "You can only play a 3 ONE-OFF if there are cards in the scrap pile"});
                  break;
                case 4:
                  if (opponent.hand.length === 0) return Promise.reject({message: "You cannot play a 4 as a one-off while your opponent has no cards in hand"});
                  break;
                case 5:
                case 7:
                  if (!game.topCard) return Promise.reject({message: "You can only play a 7 as a ONE-OFF if there are cards in the deck"});
                  break;
              }
              const {topCard, secondCard, cardsToRemoveFromDeck} = gameService.sevenCleanUp({
                game: game,
                index: req.body.index
              });
              const gameUpdates = {
                topCard,
                secondCard,
                resolving: null,
                oneOff: card.id,
                log: [
                  ...game.log,
                  `${player.username} played the ${card.name} from the top of the deck as a one-off to ${card.ruleText}.`,
                ],
                lastEvent: {
                  change: 'sevenOneOff',
                  pNum: req.session.pNum,
                },
              };
              const updatePromises = [
                Game.updateOne(game.id)
                  .set(gameUpdates),
                Game.removeFromCollection(game.id, 'deck')
                  .members(cardsToRemoveFromDeck),
              ];
              return Promise.all([game, ...updatePromises]);
            default:
              return Promise.reject({message: "You cannot play that card as a ONE-OFF without a target"});
          }
        } else {
          return Promise.reject({message: "You can only play cards from the top of the deck while resolving a seven"});
        }
      } else {
        return Promise.reject({message: "It's not your turn"});
      }
    })
    .then(function populateGame(values) {
      const [game] = values;
      return Promise.all([gameService.populateGame({gameId: game.id}), game]);
    })
    .then(async function publishAndRespond(values) {
      const fullGame = values[0];
      const gameModel = values[1];
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([fullGame.id], {
        verb: 'updated',
        data: {
          change: 'sevenOneOff',
          game: fullGame,
          pNum: req.session.pNum,
          victory,
        },
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
}
