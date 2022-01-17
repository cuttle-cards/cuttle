module.exports = function (req, res) {
  const promiseGame = gameService.findGame({gameId: req.session.game});
  const promisePlayer = userService.findUser({userId: req.session.usr});
  const promiseOpponent = userService.findUser({userId: req.body.opId});
  const promiseCard = cardService.findCard({cardId: req.body.cardId});
  const promiseTarget = cardService.findCard({cardId: req.body.targetId});
  Promise.all([promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget])
    .then(function changeAndSave (values) {
      const [ game, player, opponent, card, target ] = values;
      if (game.turn  % 2 === player.pNum) {
        if (card.hand === player.id) {
          if (target.points === opponent.id) {
            if (card.rank > target.rank || (card.rank === target.rank && card.suit > target.suit)) {
              if (player.frozenId !== card.id) {
                // Move is legal; make changes
                const attachmentIds =  target.attachments.map(card => card.id);
                const logMessage = `${userService.truncateEmail(player.email)} scuttled
									${userService.truncateEmail(opponent.email)}'s ${target.name} with the ${card.name}`;
                // Define update dictionaries
                const gameUpdates = {
                  passes: 0,
                  turn: game.turn + 1,
                  log: [
                    ...game.log,
                    logMessage,
                  ],
                  lastEvent: {
                    change: 'scuttle',
                  }
                };
                const playerUpdates = {
                  frozenId: null,
                };
                // Consolidate update promises into array
                const updatePromises = [
                  // Include game record so it can be retrieved downstream
                  game,
                  // Updates to game record e.g. turn
                  Game.updateOne(game.id)
                    .set(gameUpdates),
                  // Updates to player record i.e. frozenId
                  User.updateOne(player.id)
                    .set(playerUpdates),
                  // Clear target's attachments
                  Card.replaceCollection(target.id, 'attachments')
                    .members([]),
                  // Remove card from player's hand
                  User.removeFromCollection(player.id, 'hand')
                    .members([card.id]),
                  // Remove target from opponent's points
                  User.removeFromCollection(opponent.id, 'points')
                    .members([target.id]),
                  // Scrap cards
                  Game.addToCollection(game.id, 'scrap')
                    .members([
                      ...attachmentIds,
                      card.id,
                      target.id,
                    ]),
                ];

                return Promise.all(updatePromises);
              } else {
                return Promise.reject({message: "That card is frozen! You must wait a turn to play it."});
              }
            } else {
              return Promise.reject({message: "You can only scuttle an opponent's point card with a higher rank point card, or the same rank with a higher suit. Suit order (low to high) is: Clubs < Diamonds < Hearts < Spades"});
            }
          } else {
            return Promise.reject({message: "You can only scuttle a card your opponent has played for points"});
          }
        } else {
          return Promise.reject({message: "You can only play a card that is in your hand"});
        }
      } else {
        return Promise.reject({message: "It's not your turn."});
      }
    })
    .then(function populateGame (values) {
      const [ game ] = values;
      return Promise.all([gameService.populateGame({gameId: game.id}), game]);
    })
    .then(async function publishAndRespond (values) {
      const fullGame = values[0];
      const gameModel = values[1];
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([fullGame.id], {
        verb: 'updated',
        data: {
          change: 'scuttle',
          game: fullGame,
          victory,
        },
      });
      return res.ok();
    })
    .catch(function failed (err) {
      return res.badRequest(err);
    });
}
