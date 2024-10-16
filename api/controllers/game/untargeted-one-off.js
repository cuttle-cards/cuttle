const { game:gameText } = require('../../../src/translations/en.json');
const { getCardName } = require('../../../utils/game-utils');

module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  const promiseOpponent = userService.findUser({ userId: req.body.opId });
  Promise.all([ promiseGame, promisePlayer, promiseCard, promiseOpponent ])
    .then(function changeAndSave(values) {
      const [ game, player, card, opponent ] = values;
      if (game.turn % 2 === player.pNum) {
        // Check Turn
        if (!game.oneOff) {
          // Check that no other one-off is in play
          if (card.hand === player.id) {
            // Check that card was in hand
            switch (card.rank) {
              case 1:
              case 3:
              case 4:
              case 5:
              case 6:
              case 7:
                // Check for legality of move (edge cases, per one-off)
                switch (card.rank) {
                  case 3:
                    if (game.scrap.length < 1)
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
                        message: 'You cannot play a 4 as a one-off while your opponent has no cards in hand',
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
                    break;
                  default:
                    break;
                }
                if (player.frozenId !== card.id) {
                  // Move was valid; update records
                  const gameUpdates = {
                    oneOff: card.id,
                    log: [
                      ...game.log,
                      `${player.username} played the ${getCardName(card)} as a one-off to ${gameText.moves.effects[card.rank]}.`,
                    ],
                    lastEvent: {
                      change: 'oneOff',
                      pNum: req.session.pNum,
                    },
                  };
                  const playerUpdates = {
                    frozenId: null,
                  };
                  const updatePromises = [
                    Game.updateOne(game.id).set(gameUpdates),
                    User.removeFromCollection(player.id, 'hand').members([ card.id ]),
                    User.updateOne(player.id).set(playerUpdates),
                  ];
                  return Promise.all([ game, ...updatePromises ]);
                }
                return Promise.reject({
                  message: 'That card is frozen! You must wait a turn to play it',
                });

              default:
                return Promise.reject({
                  message: 'You cannot play that card as a one-off without a target.',
                });
            }
          } else {
            return Promise.reject({ message: 'You cannot play a card that is not in your hand' });
          }
        } else {
          return Promise.reject({
            message: 'There is already a one-off in play; You cannot play any card, except a two to counter.',
          });
        }
      } else {
        return Promise.reject({ message: "It's not your turn" });
      }
    })
    .then(function populateGame(values) {
      return Promise.all([ gameService.populateGame({ gameId: values[0].id }), values[0] ]);
    })
    .then(async function publishAndRespond(values) {
      const [ fullGame, gameModel ] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([ fullGame.id ], {
        
        change: 'oneOff',
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
