import { getCardIds, hasValidSuitAndRank, cardsMatch, printCard } from './helpers';
/**
 * Require & configure socket connection to server
 */
const io = require('sails.io.js')(require('socket.io-client'));
io.sails.url = 'localhost:1337';
io.sails.useCORSRouteToGetCookie = false;

Cypress.Commands.add('wipeDatabase', () => {
  cy.request('localhost:1337/test/wipeDatabase');
});
Cypress.Commands.add('setBadSession', () => {
  return new Promise((resolve) => {
    io.socket.get('/test/badSession', function () {
      return resolve();
    });
  });
});
Cypress.Commands.add('loadSeasonFixture', (season) => {
  return new Promise((resolve) => {
    io.socket.post('/test/loadSeasonFixture', season, function () {
      return resolve();
    });
  });
});
Cypress.Commands.add('loadMatchFixtures', (matches) => {
  return new Promise((resolve, reject) => {
    io.socket.post('/test/loadMatchFixtures', matches, function (res, jwres) {
      if (jwres.statusCode !== 200) {
        return reject(new Error('Error loading match fixtures'));
      }
      return resolve();
    });
  });
});
Cypress.Commands.add('requestGameList', () => {
  return new Promise((resolve) => {
    io.socket.get('/game/getList', function () {
      return resolve();
    });
  });
});
Cypress.Commands.add('signupOpponent', (username, password) => {
  return new Promise((resolve, reject) => {
    io.socket.get(
      'localhost:1337/user/signup',
      {
        username,
        password,
      },
      function (res, jwres) {
        if (jwres.statusCode !== 200) {
          return reject(new Error('Failed to sign up via command'));
        }
        return resolve(res);
      }
    );
  });
});
Cypress.Commands.add('signupPlayer', (username, password) => {
  cy.window().its('cuttle.app.$store').invoke('dispatch', 'requestSignup', { username, password });
});
Cypress.Commands.add('loginPlayer', (username, password) => {
  cy.window().its('cuttle.app.$store').invoke('dispatch', 'requestLogin', { username, password });
});
Cypress.Commands.add('createGameOpponent', (name) => {
  return new Promise((resolve, reject) => {
    io.socket.post(
      '/game/create',
      {
        gameName: name,
      },
      function handleResponse(resData, jwres) {
        if (jwres.statusCode === 200) {
          return resolve(resData);
        }
        return reject(new Error('Error creating game'));
      }
    );
  });
});
Cypress.Commands.add('createGamePlayer', ({ gameName, isRanked }) => {
  return cy
    .window()
    .its('cuttle.app.$store')
    .invoke('dispatch', 'requestCreateGame', { gameName, isRanked });
});
Cypress.Commands.add('subscribeOpponent', (id) => {
  return new Promise((resolve, reject) => {
    io.socket.get(
      '/game/subscribe',
      {
        id,
      },
      function handleResponse(res, jwres) {
        if (jwres.statusCode === 200) {
          return resolve();
        }
        return reject(new Error('error subscribing'));
      }
    );
  });
});
Cypress.Commands.add('readyOpponent', (id) => {
  return new Promise((resolve, reject) => {
    io.socket.get(
      '/game/ready',
      {
        id,
      },
      function handleResponse(res, jwres) {
        if (jwres.statusCode === 200) {
          return resolve();
        }
        return reject(new Error('error readying up opponent'));
      }
    );
  });
});
Cypress.Commands.add('leaveLobbyOpponent', (id) => {
  return new Promise((resolve, reject) => {
    io.socket.get('/game/leaveLobby', { id }, function handleResponse(_, jwres) {
      if (jwres.statusCode === 200) {
        return resolve();
      }
      return reject(new Error('error on opponent leaving lobby'));
    });
  });
});
Cypress.Commands.add('drawCardOpponent', () => {
  return new Promise((resolve, reject) => {
    io.socket.get('/game/draw', function handleResponse(res, jwres) {
      if (jwres.statusCode === 200) {
        return resolve();
      }
      return reject(new Error('error requesting opponent draw card'));
    });
  });
});
/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playPointsOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.app.$store.getters.opponent')
    .then((opponent) => {
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error playing opponents points: could not find ${card.rank} of ${card.suit} in opponent hand`
        );
      }
      const cardId = foundCard.id;
      io.socket.get(
        '/game/points',
        {
          cardId,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playFaceCardOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent Face Card: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.app.$store.getters.opponent')
    .then((opponent) => {
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error playing opponents Face Card: could not find ${card.rank} of ${card.suit} in opponent hand`
        );
      }
      const cardId = foundCard.id;
      io.socket.get(
        '/game/faceCard',
        {
          cardId,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});
/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('playJackOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent face card: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const player = game.players[game.myPNum];
      const opponent = game.players[(game.myPNum + 1) % 2];
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      const foundTarget = player.points.find((pointCard) => cardsMatch(target, pointCard));
      if (!foundCard) {
        throw new Error(
          `Error playing opponents jack: could not find ${card.rank} of ${card.suit} in opponent hand`
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error playing opponents jack: could not find ${target.rank} of ${target.suit} in player points`
        );
      }
      const cardId = foundCard.id;
      const targetId = foundTarget.id;
      io.socket.get(
        '/game/jack',
        {
          opId: player.id,
          cardId,
          targetId,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});
/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('scuttleOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot scuttle as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const player = game.players[game.myPNum];
      const opponent = game.players[(game.myPNum + 1) % 2];
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      const foundTarget = player.points.find((pointCard) => cardsMatch(target, pointCard));
      if (!foundCard) {
        throw new Error(
          `Error scuttling as opponent: could not find ${card.rank} of ${card.suit} in opponent hand`
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error scuttling as opponent: could not find ${target.rank} of ${target.suit} in player's points`
        );
      }
      io.socket.get(
        '/game/scuttle',
        {
          opId: player.id,
          cardId: foundCard.id,
          targetId: foundTarget.id,
        },
        function handleResponse(res, jwres) {
          if (!jwres.statusCode === 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});
Cypress.Commands.add('playOneOffOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot scuttle as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const playerId = game.players[game.myPNum].id;
      const opponent = game.players[(game.myPNum + 1) % 2];
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error playing untargetted one-off as opponent: could not find ${printCard(
            card
          )} in opponent hand`
        );
      }
      if (foundCard.rank >= 8) {
        throw new Error(
          `Error playing untargetted one-off as opponent: ${printCard(card)} is not a valid oneOff`
        );
      }
      io.socket.get(
        '/game/untargetedOneOff',
        {
          opId: playerId, // opponent's opponent is the player
          cardId: foundCard.id,
        },
        function handleResponse(res, jwres) {
          if (!jwres.statusCode === 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});
/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 * @param targetType string 'faceCard' | 'point' | 'jack'
 */
Cypress.Commands.add('playTargetedOneOffOpponent', (card, target, targetType) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play targeted one-off as opponent: Invalid card input');
  }
  if (!hasValidSuitAndRank(target)) {
    throw new Error('Cannot play targeted one-off as opponent: Invalid target input');
  }
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const player = game.players[game.myPNum];
      const playerId = player.id;
      const opponent = game.players[(game.myPNum + 1) % 2];
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      let foundTarget;
      let foundPointCard;
      switch (targetType) {
        case 'point':
          foundTarget = player.points.find((pointCard) => cardsMatch(pointCard, target));
          break;
        case 'faceCard':
          foundTarget = player.faceCards.find((faceCard) => cardsMatch(faceCard, target));
          break;
        case 'jack':
          player.points.forEach((pointCard) => {
            pointCard.attachments.forEach((jack) => {
              if (cardsMatch(jack, target)) {
                foundTarget = jack;
                foundPointCard = pointCard;
              }
            });
          });
          break;
        default:
          throw new Error(
            `Error playing ${printCard(
              card
            )} as one-off from seven as opponent: invalid target type, ${targetType}`
          );
      }
      if (!foundCard) {
        throw new Error(
          `Error playing targeted one-off as opponent: could not find ${printCard(
            card
          )} in opponent hand`
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error playing targeted one-off as opponent: could not find ${printCard(
            target
          )} in player field`
        );
      }
      if (targetType === 'jack' && !foundPointCard) {
        throw new Error(
          'Error playing targeted one-off as opponent: could not find point card in player field'
        );
      }
      io.socket.get(
        '/game/targetedOneOff',
        {
          opId: playerId, // opponent's opponent is the player
          targetId: foundTarget.id,
          cardId: foundCard.id,
          pointId: foundPointCard ? foundPointCard.id : null,
          targetType,
        },
        function handleResponse(res, jwres) {
          if (!jwres.statusCode === 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});
/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('counterOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play counter as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const opponent = game.players[(game.myPNum + 1) % 2];
      const playerId = game.players[game.myPNum].id;
      const foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      if (!foundCard) {
        throw new Error(
          `Error countering as opponent: could not find ${card.rank} of ${card.suit} in opponent hand`
        );
      }
      const cardId = foundCard.id;
      io.socket.get(
        '/game/counter',
        {
          cardId,
          opId: playerId,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

Cypress.Commands.add('resolveThreeOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot resolve three as opponent: Invalid card input');
  }
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const opId = game.players[game.myPNum].id;
      const foundCard = game.scrap.find((scrapCard) => cardsMatch(card, scrapCard));
      if (!foundCard) {
        throw new Error(
          `Error resolving three as opponent: could not find ${card.rank} of ${card.suit} in scrap`
        );
      }
      const cardId = foundCard.id;
      io.socket.get(
        '/game/resolveThree',
        {
          cardId,
          opId,
        },
        function handleResponse(res, jwres) {
          if (!jwres.statusCode === 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});
Cypress.Commands.add('resolveOpponent', () => {
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const opId = game.players[game.myPNum].id;
      io.socket.get(
        '/game/resolve',
        {
          opId,
        },
        function handleResponse(res, jwres) {
          if (!jwres.statusCode === 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

/**
 * Discards 1-2 cards to resolve four
 * @param card1 {suit: number, rank: number} OPTIONAL
 * @param card2 {suit: number, rank: number} OPTIONAL
 */
Cypress.Commands.add('discardOpponent', (card1, card2) => {
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      let cardId1 = undefined;
      let cardId2 = undefined;
      if (card1) {
        [cardId1] = getCardIds(game, [card1]);
      }
      if (card2) {
        [cardId2] = getCardIds(game, [card2]);
      }
      io.socket.get(
        '/game/resolveFour',
        {
          cardId1,
          cardId2,
        },
        function handleResponse(res, jwres) {
          if (!jwres.statusCode === 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playPointsFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }
  Cypress.log({
    displayName: 'Opponent seven points',
    name: 'Opponent plays points from seven',
    message: printCard(card),
  });
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      let foundCard;
      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card
          )} for points from seven as opponent: Could not find it in top two cards`
        );
      }

      const cardId = foundCard.id;
      io.socket.get(
        '/game/seven/points',
        {
          cardId,
          index,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playFaceCardFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent face card: Invalid card input');
  }
  Cypress.log({
    displayName: 'Opponent seven face card',
    name: 'Opponent plays face card from seven',
    message: printCard(card),
  });
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      let foundCard;
      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing face card: ${printCard(
            card
          )} from seven as opponent: Could not find it in top two cards`
        );
      }

      const cardId = foundCard.id;
      io.socket.get(
        '/game/seven/faceCard',
        {
          cardId,
          index,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number}
 */
Cypress.Commands.add('scuttleFromSevenOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }
  Cypress.log({
    displayName: 'Opponent seven scuttle',
    name: 'Opponent scuttles from seven',
    message: printCard(card),
  });
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const player = game.players[game.myPNum];
      const opponent = game.players[(game.myPNum + 1) % 2];
      let foundCard = opponent.hand.find((handCard) => cardsMatch(card, handCard));
      const foundTarget = player.points.find((pointCard) => cardsMatch(target, pointCard));

      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card
          )} for jack from seven as opponent: Could not find it in top two cards`
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error playing opponents jack: could not find ${target.rank} of ${target.suit} in player points`
        );
      }

      const cardId = foundCard.id;
      const targetId = foundTarget.id;
      io.socket.get(
        '/game/seven/scuttle',
        {
          cardId,
          index,
          targetId,
          opId: player.id,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

/**
 * @param card {suit: number, rank: number}
 * @param target {suit: number, rank: number
 */
Cypress.Commands.add('playJackFromSevenOpponent', (card, target) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent points: Invalid card input');
  }

  Cypress.log({
    displayName: 'Opponent seven jack',
    name: 'Opponent plays jack from seven',
    message: printCard(card),
  });

  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const player = game.players[game.myPNum];
      let foundCard;
      const foundTarget = player.points.find((pointCard) => cardsMatch(target, pointCard));

      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card
          )} for jack from seven as opponent: Could not find it in top two cards`
        );
      }
      if (!foundTarget) {
        throw new Error(
          `Error playing opponents jack: could not find ${target.rank} of ${target.suit} in player points`
        );
      }

      const cardId = foundCard.id;
      const targetId = foundTarget.id;
      io.socket.get(
        '/game/seven/jack',
        {
          cardId,
          index,
          targetId,
          opId: player.id,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

/**
 * @param card {suit: number, rank: number}
 */
Cypress.Commands.add('playOneOffFromSevenOpponent', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot play opponent one-ff from seven: Invalid card input');
  }
  Cypress.log({
    displayName: 'Opponent seven one-off',
    name: 'Opponent plays one-off from seven',
    message: printCard(card),
  });
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      let foundCard;
      let index;
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card
          )} as one-off from seven as opponent: Could not find it in top two cards`
        );
      }
      const playerId = game.players[game.myPNum].id;
      const cardId = foundCard.id;
      io.socket.get(
        '/game/seven/untargetedOneOff',
        {
          cardId,
          index,
          opId: playerId,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

Cypress.Commands.add('playTargetedOneOffFromSevenOpponent', (card, target, targetType) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(
      `Cannot play targeted one-off from seven for opponent: Invalid card to play: ${JSON.stringify(
        card
      )}`
    );
  }
  if (!hasValidSuitAndRank(target)) {
    throw new Error(
      `Cannot play targeted one-off from seven for opponent: Invalid target: ${JSON.stringify(
        target
      )}`
    );
  }
  Cypress.log({
    displayName: 'Opponent seven targeted one-off',
    name: 'Opponent plays one-off from seven',
    message: printCard(card),
  });
  let foundCard;
  let foundTarget;
  let foundPointCard;
  let index;
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const player = game.players[game.myPNum];
      if (cardsMatch(card, game.topCard)) {
        foundCard = game.topCard;
        index = 0;
      } else if (cardsMatch(card, game.secondCard)) {
        foundCard = game.secondCard;
        index = 1;
      } else {
        throw new Error(
          `Error playing ${printCard(
            card
          )} as one-off from seven as opponent: Could not find it in top two cards`
        );
      }
      // Find target by suit & rank
      switch (targetType) {
        case 'point':
          foundTarget = player.points.find((pointCard) => cardsMatch(pointCard, target));
          break;
        case 'faceCard':
          foundTarget = player.faceCards.find((faceCard) => cardsMatch(faceCard, target));
          break;
        case 'jack':
          player.points.forEach((pointCard) => {
            pointCard.attachments.forEach((jack) => {
              if (cardsMatch(jack, target)) {
                foundTarget = jack;
                foundPointCard = pointCard;
              }
            });
          });
          break;
        default:
          throw new Error(
            `Error playing ${printCard(
              card
            )} as one-off from seven as opponent: invalid target type, ${targetType}`
          );
      }
      if (!foundTarget) {
        throw new Error(
          `Error: Could not find target ${printCard(target)} when playing ${printCard(
            card
          )} as one-off from seven for opponent`
        );
      }
      if (targetType === 'jack' && !foundPointCard) {
        throw new Error(
          `Error: Could not find point card when playing ${printCard(
            card
          )} as one-off from seven for opponent`
        );
      }
      const playerId = player.id;
      const cardId = foundCard.id;
      const targetId = foundTarget.id;
      const pointId = foundPointCard ? foundPointCard.id : null;
      io.socket.get(
        '/game/seven/targetedOneOff',
        {
          cardId,
          index,
          targetId,
          targetType,
          pointId,
          opId: playerId,
        },
        function handleResponse(res, jwres) {
          if (jwres.statusCode !== 200) {
            throw new Error(jwres.body.message);
          }
          return jwres;
        }
      );
    });
});

Cypress.Commands.add('passOpponent', () => {
  cy.log('Opponent Passes');
  io.socket.get('/game/pass', function handleResponse(res, jwres) {
    if (jwres.statusCode !== 200) {
      throw new Error(jwres.body.message);
    }
    return jwres;
  });
});

Cypress.Commands.add('concedeOpponent', () => {
  cy.log('Opponent Concedes');
  io.socket.get('/game/concede', function handleResponse(res, jwres) {
    if (jwres.statusCode !== 200) {
      throw new Error(jwres.body.message);
    }
    return jwres;
  });
});

Cypress.Commands.add('stalemateOpponent', () => {
  cy.log('Opponent requests/accepts stalemate');
  io.socket.get('/game/stalemate', function handleResponse(res, jwres) {
    if (jwres.statusCode !== 200) {
      throw new Error(jwres.body.message);
    }
    return jwres;
  });
});

Cypress.Commands.add('rejectStalemateOpponent', () => {
  cy.log('Opponent rejects stalemate request');
  io.socket.get('/game/reject-stalemate', function handleResponse(res, jwres) {
    if (jwres.statusCode !== 200) {
      throw new Error(jwres.body.message);
    }
    return jwres;
  });
});

Cypress.Commands.add('reconnectOpponent', (username, password) => {
  cy.log('Opponent Reconnects');
  io.socket.get(
    '/user/reLogin',
    {
      username,
      password,
    },
    function handleResponse(res, jwres) {
      if (jwres.statusCode !== 200) {
        throw new Error(`Error reconnecting opponent: ${jwres.body.message}`);
      }
    }
  );
});

/**
 * @param card: {suit: number, rank: number}
 */
Cypress.Commands.add('playOneOffAndResolveAsPlayer', (card) => {
  if (!hasValidSuitAndRank(card)) {
    throw new Error(`Cannot one-off & resolve: Invalid card to play: ${JSON.stringify(card)}`);
  }
  Cypress.log({
    displayName: 'Play & Resolve One-Off',
    name: 'Play one-off, opponent resolves',
    message: printCard(card),
  });
  cy.window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const foundCard = game.players[game.myPNum].hand.find((handCard) =>
        cardsMatch(card, handCard)
      );
      if (!foundCard) {
        throw new Error(
          `Cannot one-off & resolve: cannot find ${printCard(card)} in player's hand`
        );
      }
      // Play chosen card as one-off
      cy.get(`[data-player-hand-card=${card.rank}-${card.suit}]`).click();
      cy.get('[data-move-choice=oneOff]').should('not.have.class', 'v-card--disabled').click();
      cy.get('#waiting-for-opponent-counter-scrim').should('be.visible');
      // Opponent does not counter (resolves stack)
      cy.resolveOpponent();
      cy.get('#waiting-for-opponent-counter-scrim').should('not.be.visible');
    });
});

Cypress.Commands.add('deleteDeck', () => {
  cy.log('Deleting deck');
  io.socket.get('/game/deleteDeck', function handleResponse(res, jwres) {
    if (jwres.statusCode !== 200) {
      throw new Error(jwres.body.message);
    }
    return jwres;
  });
});

Cypress.Commands.add('vueRoute', (route) => {
  cy.window().its('cuttle.app.$router').invoke('push', route);
});

/**
 * @param fixture
 * {
 * 	 p0Hand: {suit: number, rank: number}[],
 *   p0Points: {suit: number, rank: number}[],
 *   p0FaceCards: {suit: number, rank: number}[],
 *   p1Hand: {suit: number, rank: number}[],
 *   p1Points: {suit: number, rank: number}[],
 *   p1FaceCards: {suit: number, rank: number}[],
 *   topCard?: {suit: number, rank: number} (optional)
 *   secondCard?: {suit: number, rank: number} (optional)
 * }
 */
Cypress.Commands.add('loadGameFixture', (fixture) => {
  return cy
    .window()
    .its('cuttle.app.$store.state.game')
    .then((game) => {
      const p0HandCardIds = getCardIds(game, fixture.p0Hand);
      const p0PointCardIds = getCardIds(game, fixture.p0Points);
      const p0FaceCardIds = getCardIds(game, fixture.p0FaceCards);
      const p1HandCardIds = getCardIds(game, fixture.p1Hand);
      const p1PointCardIds = getCardIds(game, fixture.p1Points);
      const p1FaceCardIds = getCardIds(game, fixture.p1FaceCards);

      // build request body
      let reqBody = {
        p0Id: game.players[0].id,
        p1Id: game.players[1].id,
        p0HandCardIds,
        p1HandCardIds,
        p0PointCardIds,
        p1PointCardIds,
        p0FaceCardIds,
        p1FaceCardIds,
      };
      // Get top card & second cards if specified
      if (fixture.topCard) {
        const [topCardId] = getCardIds(game, [fixture.topCard]);
        reqBody.topCardId = topCardId;
      }
      if (fixture.secondCard) {
        const [secondCardId] = getCardIds(game, [fixture.secondCard]);
        reqBody.secondCardId = secondCardId;
      }
      // Get scrap if specified
      if (fixture.scrap) {
        const scrapCardIds = getCardIds(game, fixture.scrap);
        reqBody.scrapCardIds = scrapCardIds;
      }

      io.socket.get('/game/loadFixture', reqBody, function handleResponse(res, jwres) {
        if (!jwres.statusCode === 200) {
          return Promise.reject(jwres.error);
        }
        return Promise.resolve(jwres);
      });
    });
});
