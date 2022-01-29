module.exports = function (req, res) {
  const game = gameService.findGame({gameId: req.session.game});
  const player = userService.findUser({userId: req.session.usr});
  const opponent = userService.findUser({userId: req.body.opId});
  const card = cardService.findCard({cardId: req.body.cardId});
  const target = cardService.findCard({cardId: req.body.targetId});
  Promise.all([game, player, opponent, card, target])
    .then(function changeAndSave(values) {
      const [game, player, opponent, card, target] = values;
      if (game.turn % 2 === player.pNum) {
        if (card.hand === player.id) {
          if (card.rank === 11) {
            if (target.points === opponent.id) {
              const queenCount = userService.queenCount({user: opponent});
              if (queenCount === 0) {
                if (player.frozenId !== card.id) {
                  // Valid move; change and save
                  const gameUpdates = {
                    log: [
                      ...game.log,
                      `${userService.truncateEmail(player.email)} stole ${userService.truncateEmail(opponent.email)}'s ${target.name} with the ${card.name}`
                    ],
                    turn: game.turn + 1,
                    passes: 0,
                    lastEvent: {
                      change: 'jack',
                    },
                  };
                  const playerUpdates = {
                    frozenId: null,
                  };
                  const cardUpdates = {
                    index: target.attachments.length,
                  };
                  const updatePromises = [
                    Game.updateOne(game.id)
                      .set(gameUpdates),
                    User.updateOne(player.id)
                      .set(playerUpdates),
                    User.addToCollection(player.id, 'points')
                      .members([target.id]),
                    User.removeFromCollection(player.id, 'hand')
                      .members([card.id]),
                    Card.updateOne(card.id)
                      .set(cardUpdates),
                    Card.addToCollection(target.id, 'attachments')
                      .members([card.id])
                  ];
                  return Promise.all([game, ...updatePromises]);
                } else {
                  return Promise.reject({message: "That card is frozen! You must wait a turn to play it"});
                }

              } else {
                return Promise.reject({message: "You cannot use a Jack while your opponent has a Queen."});
              }
            } else {
              return Promise.reject({message: "You can only play a Jack on an opponent's Point card."});
            }
          } else {
            return Promise.reject({message: "You can only use a Jack to steal an opponent's Point card"});
          }
        } else {
          return Promise.reject({message: "You can only play a card that is in your hand"});
        }
      } else {
        return Promise.reject({message: "It's not your turn"});
      }
    }) //End changeAndSave()
    .then(function populateGame(values) {
      const game = values[0];
      return Promise.all([gameService.populateGame({gameId: game.id}), game]);
    })
    .then(async function publishAndRespond(values) {
      const [fullGame, gameModel] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });

      Game.publish([fullGame.id], {
        verb: 'updated',
        data: {
          change: 'jack',
          game: fullGame,
          victory,
        },
      });
      // If the game is over, clean it up
      if (victory.gameOver) await gameService.clearGame({userId: req.session.usr})
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });

}
