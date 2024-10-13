const { getCardName } = require('../../../utils/game-utils');

module.exports = function (req, res) {
  // Note: the player calling resolve is the opponent of the one playing the one-off, if it resolves
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.body.opId });
  const promiseOpponent = userService.findUser({ userId: req.session.usr });
  const promisePlayerPoints = cardService.findPoints({ userId: req.body.opId });
  const promiseOpPoints = cardService.findPoints({ userId: req.session.usr });
  Promise.all([ promiseGame, promisePlayer, promiseOpponent, promisePlayerPoints, promiseOpPoints ])
    .then(function changeAndSave(values) {
      const [ game, player, opponent, playerPoints, opPoints ] = values;
      let happened = true;
      const opponentUpdates = {};
      let cardsToScrap = [];
      let updatePromises = [];
      let gameUpdates = {
        oneOffTarget: null,
        oneOffTargetType: '',
      };
      if (game.twos.length % 2 === 1) {
        // One-off is countered
        opponentUpdates.frozenId = null;
        gameUpdates.log = [
          ...game.log,
          `The ${getCardName(game.oneOff)} is countered, and all cards played this turn are scrapped.`,
        ];
        happened = false;
      } else {
        // One Off will resolve; perform effect based on card rank
        switch (game.oneOff.rank) {
          case 1: {
            let playerPointIds = [];
            let opponentPointIds = [];
            let jackIds = [];
            // Player's points
            if (playerPoints) {
              playerPoints.forEach(function (point) {
                playerPointIds.push(point.id);
                jackIds = [ ...jackIds, ...point.attachments.map((jack) => jack.id) ];
              });
            }

            // Opponent's points
            if (opPoints) {
              opPoints.forEach(function (point) {
                opponentPointIds.push(point.id);
                jackIds = [ ...jackIds, ...point.attachments.map((jack) => jack.id) ];
              });
            }
            cardsToScrap = [ ...playerPointIds, ...opponentPointIds, ...jackIds ];
            // Update log
            gameUpdates.log = [
              ...game.log,
              `The ${getCardName(game.oneOff)} one-off resolves; all point cards are scrapped.`,
            ];
            updatePromises = [
              // Remove all jacks from point cards
              Card.replaceCollection([ ...playerPointIds, ...opponentPointIds ], 'attachments').members([]),
              // Scrap all point cards and jacks
              Game.addToCollection(game.id, 'scrap').members(cardsToScrap),
              // Remove player's points
              User.removeFromCollection(player.id, 'points').members(playerPointIds),
              // Remove opponent's points
              User.removeFromCollection(opponent.id, 'points').members(opponentPointIds),
            ];
            break; // End resolve ACE
          }
          case 2:
            gameUpdates = {
              ...gameUpdates,
              log: [
                ...game.log,
                `The ${getCardName(game.oneOff)} resolves; the ${getCardName(game.oneOffTarget)} is scrapped.`,
              ],
            };
            // Scrap the one-off target
            cardsToScrap.push(game.oneOffTarget.id);
            switch (game.oneOffTargetType) {
              case 'faceCard':
                updatePromises.push(
                  User.removeFromCollection(opponent.id, 'faceCards').members([ game.oneOffTarget.id ]),
                );
                break;
              case 'jack':
                updatePromises = [
                  ...updatePromises,
                  // Remove targeted jack from attachments of the point card it was on
                  Card.removeFromCollection(game.attachedToTarget.id, 'attachments').members([
                    game.oneOffTarget.id,
                  ]),
                  // Place oneOff
                  User.addToCollection(player.id, 'points').members([ game.attachedToTarget.id ]),
                ];
                break;
            } // End switch(oneOffTargetType)
            break; // End resolve TWO
          case 3:
            gameUpdates = {
              ...gameUpdates,
              resolving: game.oneOff.id,
              log: [
                ...game.log,
                `The ${getCardName(game.oneOff)} one-off resolves; ${player.username} will draw one card of their choice from the Scrap pile.`,
              ],
            };
            break;
          case 4:
            gameUpdates = {
              ...gameUpdates,
              resolving: game.oneOff.id,
              log: [
                ...game.log,
                `The ${getCardName(game.oneOff)} one-off resolves; ${opponent.username} must discard two cards.`,
              ],
            };
            break;
          case 5: {
            gameUpdates = {
              ...gameUpdates,
              resolving: game.oneOff.id,
              log: [
                ...game.log,
                `The ${getCardName(game.oneOff)} one-off resolves; ${player.username} must discard 1 card, and will draw up to 3.`,
              ],
            };
            break;
          }
          case 6: {
            const playerFaceCardIds = player.faceCards.map((faceCard) => faceCard.id);
            const opponentFaceCardIds = opponent.faceCards.map((faceCard) => faceCard.id);
            cardsToScrap = [ ...cardsToScrap, ...playerFaceCardIds, ...opponentFaceCardIds ];
            updatePromises = [
              ...updatePromises,
              User.removeFromCollection(player.id, 'faceCards').members(playerFaceCardIds),
              User.removeFromCollection(opponent.id, 'faceCards').members(opponentFaceCardIds),
            ];
            // All points will need their attachments emptied
            const allPoints = [];
            const pointsGoingToPlayer = [];
            const pointsGoingToOpponent = [];
            if (playerPoints) {
              playerPoints.forEach(function (point) {
                allPoints.push(point.id);
                // Collect all jacks for scrap
                const jackCount = point.attachments.length;
                const jacks = point.attachments.map((jack) => jack.id);
                cardsToScrap = [ ...cardsToScrap, ...jacks ];
                // If odd number of jacks were attached, switch control
                if (jackCount % 2 === 1) {
                  pointsGoingToOpponent.push(point.id);
                }
              });
            }
            if (opPoints) {
              opPoints.forEach(function (point) {
                allPoints.push(point.id);
                // Collect all jacks for scrap
                const jackCount = point.attachments.length;
                const jacks = point.attachments.map((jack) => jack.id);
                cardsToScrap = [ ...cardsToScrap, ...jacks ];
                // If odd number of jacks were attached, switch control
                if (jackCount % 2 === 1) {
                  pointsGoingToPlayer.push(point.id);
                }
              });
            }
            gameUpdates.log = [
              ...game.log,
              `The ${getCardName(game.oneOff)} one-off resolves; all Royals and Glasses are scrapped.`,
            ];
            updatePromises = [
              ...updatePromises,
              // Remove all attachments from all points
              Card.replaceCollection(allPoints, 'attachments').members([]),
              // Give player the point cards that return to them
              User.addToCollection(player.id, 'points').members(pointsGoingToPlayer),
              // Give opponent the point cards that return to them
              User.addToCollection(opponent.id, 'points').members(pointsGoingToOpponent),
            ];
            break; // End resolve SIX
          }
          case 7:
            gameUpdates = {
              ...gameUpdates,
              resolving: game.oneOff.id,
            };
            if (game.secondCard) {
              gameUpdates.log = [
                ...game.log,
                `The ${getCardName(game.oneOff)} one-off resolves; they will play one card from the top two in the deck. Top two cards are the ${getCardName(game.topCard)} and ${getCardName(game.secondCard)}.`,
              ];
            } else {
              gameUpdates.log = [
                ...game.log,
                `The ${getCardName(game.oneOff)} one-off resolves. They will play the ${getCardName(game.topCard)} as it is the last card in the deck.`,
              ];
            }
            break; // End resolve SEVEN
          case 9:
            updatePromises.push(
              // Place target back in opponent's hand
              User.addToCollection(opponent.id, 'hand').members(game.oneOffTarget.id),
            );
            opponentUpdates.frozenId = game.oneOffTarget.id;
            gameUpdates = {
              ...gameUpdates,
              log: [
                ...game.log,
                `The ${getCardName(game.oneOff)} one-off resolves, returning the ${getCardName(game.oneOffTarget)} to ${opponent.username}'s hand. It cannot be played next turn.`,
              ],
            };
            switch (game.oneOffTargetType) {
              case 'faceCard':
                updatePromises.push(
                  User.removeFromCollection(opponent.id, 'faceCards').members(game.oneOffTarget.id),
                );
                break;
              case 'point': {
                const targetCard = opPoints.find((point) => point.id === game.oneOffTarget.id);
                if (!targetCard)
                {
                  return Promise.reject({
                    message: `Could not find target point card ${game.oneOffTarget.id} to return to opponent's hand`,
                  });
                }
                // Scrap all jacks attached to target
                cardsToScrap = [ ...cardsToScrap, ...targetCard.attachments.map((jack) => jack.id) ];
                updatePromises.push(
                  // Remove card from opponent's points
                  User.removeFromCollection(opponent.id, 'points').members([ targetCard.id ]),
                  // Clear jacks from target
                  Card.replaceCollection(targetCard.id, 'attachments').members([]),
                );
                break;
              }
              case 'jack':
                updatePromises.push(
                  // Remove targeted jack from the attachments of the point card it's on
                  Card.removeFromCollection(game.oneOffTarget.attachedTo, 'attachments').members([
                    game.oneOffTarget.id,
                  ]),
                  // Return the stolen point card back to the player
                  User.addToCollection(player.id, 'points').members([ game.attachedToTarget.id ]),
                );
                gameUpdates.attachedToTarget = null;
                break;
            }
            break; // End resolve NINE
        } // End switch on oneOff rank
      } // End if(happened)

      // Add twos to the cards to scrap
      cardsToScrap = [ ...cardsToScrap, ...game.twos.map((two) => two.id) ];
      const { oneOff } = game;
      if (![ 3,5 ].includes(oneOff.rank) || !happened) {
        gameUpdates.oneOff = null;
        cardsToScrap.push(game.oneOff.id);
      }
      // Increment turn for anything except resolved three, four, five, and seven (which require follow up)
      if (!happened || (happened && ![ 3, 4, 5, 7 ].includes(oneOff.rank))) {
        gameUpdates = {
          ...gameUpdates,
          turn: game.turn + 1,
          passes: 0,
        };
      }
      gameUpdates.lastEvent = {
        change: 'resolve',
        playedBy: player.pNum,
        happened,
        oneOff,
      };
      updatePromises = [
        ...updatePromises,
        // Update game with turn, log, passes, oneOff, and lastEvent
        Game.updateOne(game.id).set(gameUpdates),
        // Scrap the specified cards
        Game.addToCollection(game.id, 'scrap').members(cardsToScrap),
        // Clear twos
        Game.replaceCollection(game.id, 'twos').members([]),
        // Update opponent, as specified
        User.updateOne(opponent.id).set(opponentUpdates),
      ];
      const dataToReturn = [ game, oneOff, player.pNum, happened, ...updatePromises ];

      return Promise.all(dataToReturn);
    }) // End changeAndSave
    .then(function populateGame(values) {
      const [ game, oneOff, pNum, happened ] = values;
      return Promise.all([ gameService.populateGame({ gameId: game.id }), oneOff, pNum, happened, game ]);
    })
    .then(async function publishAndRespond(values) {
      const [ fullGame, oneOff, pNum, happened, gameModel ] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([ fullGame.id ], {
        change: 'resolve',
        oneOff,
        game: fullGame,
        victory,
        playedBy: pNum,
        happened,
      });
      // If the game is over, clean it up
      if (victory.gameOver) {
        await Game.updateOne({ id: fullGame.id }).set({
          lastEvent: {
            change: 'resolve',
            game: fullGame,
            victory
          }
        });
        await gameService.clearGame({ userId: req.session.usr });
      }
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
