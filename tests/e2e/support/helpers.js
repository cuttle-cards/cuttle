import { SnackBarError } from '../fixtures/snackbarError';

export function hasValidSuitAndRank(card) {
  if (!Object.prototype.hasOwnProperty.call(card, 'rank')) {
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(card, 'suit')) {
    return false;
  }
  if (!Number.isInteger(card.rank)) {
    return false;
  }
  if (!Number.isInteger(card.suit)) {
    return false;
  }
  if (card.rank < 1 || card.rank > 13) {
    return false;
  }
  if (card.suit < 0 || card.suit > 3) {
    return false;
  }
  return true;
}
/**
 * @returns string name of card
 * @param {suit: number, rank: number} card
 */
export function printCard(card) {
  if (!hasValidSuitAndRank(card)) {
    throw new Error('Cannot print object not shaped like card');
  }
  let res = '';
  switch (card.rank) {
    case 1:
      res += 'Ace';
      break;
    case 2:
      res += 'Two';
      break;
    case 3:
      res += 'Three';
      break;
    case 4:
      res += 'Four';
      break;
    case 5:
      res += 'Five';
      break;
    case 6:
      res += 'Six';
      break;
    case 7:
      res += 'Seven';
      break;
    case 8:
      res += 'Eight';
      break;
    case 9:
      res += 'Nine';
      break;
    case 10:
      res += 'Ten';
      break;
    case 11:
      res += 'Jack';
      break;
    case 12:
      res += 'Queen';
      break;
    case 13:
      res += 'King';
      break;
  }
  res += ' of ';
  const suits = ['♣️', '♦️', '♥️', '♠️'];
  res += suits[card.suit];
  return res;
}
export function printCardList(cards) {
  return cards.map(printCard).join(', ');
}
export function cardsMatch(card1, card2) {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

/**
 * @param game: game obj from $store
 * @param card: {suit: number, rank: number}
 * @returns id of specified cards
 * @throws error if card not found in game
 */
export function getCardId(game, card) {
  if (cardsMatch(card, game.topCard)) {
    return game.topCard.id;
  }
  if (cardsMatch(card, game.secondCard)) {
    return game.secondCard.id;
  }

  const foundInScrap = game.scrap.find((scrapCard) => cardsMatch(card, scrapCard));
  if (foundInScrap) {
    return foundInScrap.id;
  }

  const foundInP0Hand = game.players[0].hand.find((handCard) => cardsMatch(card, handCard));
  if (foundInP0Hand) {
    return foundInP0Hand.id;
  }

  const foundInP1Hand = game.players[1].hand.find((handCard) => cardsMatch(card, handCard));
  if (foundInP1Hand) {
    return foundInP1Hand.id;
  }

  const foundInDeck = game.deck.find((deckCard) => cardsMatch(card, deckCard));
  if (foundInDeck) {
    return foundInDeck.id;
  }

  throw new Error(
    `Could not find desired card ${card.rank} of ${card.suit} in deck, scrap, or either player's hand`,
  );
}

/**
 * @param game: game obj from $store
 * @param suitAndRankList: {suit: number, rank: number}[]
 * @returns lit of ids of specified cards
 * * @throws error if any card missing in game
 */
export function getCardIds(game, suitAndRankList) {
  return suitAndRankList.map((card) => getCardId(game, card));
}

function cardSortComparator(card1, card2) {
  let res = card1.rank - card2.rank;
  if (res === 0) {
    res = card1.suit - card2.suit;
  }
  return res;
}
export function cardListsMatch(list1, list2) {
  if (list1.length != list2.length) {
    return false;
  }
  list1.sort(cardSortComparator);
  list2.sort(cardSortComparator);
  for (let i = 0; i < list1.length; i++) {
    if (!cardsMatch(list1[i], list2[i])) {
      return false;
    }
  }
  return true;
}
/**
 * @returns sum of ranks of list of card
 * @param cards: {suit: number, rank: number}[]
 */
function sumRanks(cards) {
  return cards.reduce((sum, nextCard) => sum + nextCard.rank, 0);
}
/**
 * @returns count of kings in list
 * @param cards: {suit: number, rank: number}[]
 */
function countKings(cards) {
  return cards.reduce((kingCount, nextCard) => (nextCard.rank === 13 ? kingCount + 1 : kingCount), 0);
}
/**
 *
 * @param kingCount: number
 */
function pointsToWin(kingCount) {
  switch (kingCount) {
    case 0:
      return 21;
    case 1:
      return 14;
    case 2:
      return 10;
    case 3:
      return 5;
    case 4:
      return 0;
    default:
      throw new Error(`Cannot count points to win for invalid kingcount: ${kingCount}`);
  }
}

export function assertSnackbarError(message, snackName = 'game') {
  cy.get(`[data-cy=${snackName}-snackbar] .v-snackbar__wrapper`)
    .should('be.visible')
    .should('have.class', 'bg-error')
    .find(`.v-snackbar__content`)
    .should('contain', message)
    .get('[data-cy=close-snackbar]')
    .click();
}

/**
 * Attempts to make a move out of turn and confirms that controls are disabled etc
 * Assumes a card is already selected and the move choice overlay is open
 * @param moveName: String is the name of the move event (ex 'oneOff')
 */
export function playOutOfTurn(moveName) {
  // Specified move choice should be disabled
  cy.get(`[data-move-choice=${moveName}]`)
    .should('have.class', 'v-card--disabled')
    .should('contain', "It's not your turn")
    .click({ force: true });
  // Back end should fire error that move is illegal after click is forced
  assertSnackbarError(SnackBarError.NOT_YOUR_TURN);
  cy.log(`Correctly prevented attempt to play ${moveName} out of turn`);
}

function assertDomMatchesFixture(pNum, fixture, spectating) {
  const expectedP0Points = sumRanks(fixture.p0Points);
  const expectedP0PointsToWin = pointsToWin(countKings(fixture.p0FaceCards));
  const expectedP1Points = sumRanks(fixture.p1Points);
  const expectedP1PointsToWin = pointsToWin(countKings(fixture.p1FaceCards));
  let p0Role;
  let p1Role;
  if (pNum === 0) {
    p0Role = 'player';
    p1Role = 'opponent';
  } else if (pNum === 1) {
    p0Role = 'opponent';
    p1Role = 'player';
  } else {
    throw new Error(`Cannot check whether DOM matches fixture for invalid pNum ${pNum}`);
  }
  // Test scores
  cy.get(`#${p0Role}-score`)
    .should('contain', `POINTS: ${expectedP0Points}`)
    .should('contain', `GOAL: ${expectedP0PointsToWin}`);
  cy.get(`#${p1Role}-score`)
    .should('contain', `POINTS: ${expectedP1Points}`)
    .should('contain', `GOAL: ${expectedP1PointsToWin}`);

  let playerHasGlasses = false;

  // Test Point Cards
  fixture.p0Points.forEach((card) => {
    cy.get(`[data-${p0Role}-point-card=${card.rank}-${card.suit}]`);
  });
  fixture.p1Points.forEach((card) => {
    cy.get(`[data-${p1Role}-point-card=${card.rank}-${card.suit}]`);
  });
  // Test Face Cards
  fixture.p0FaceCards.forEach((card) => {
    cy.get(`[data-${p0Role}-face-card=${card.rank}-${card.suit}]`).as('card');
    if (card.rank === 8) {
      cy.get('@card').should('have.class', 'glasses');
      if (pNum === 0) {
        playerHasGlasses = true;
      }
    }
  });
  fixture.p1FaceCards.forEach((card) => {
    cy.get(`[data-${p1Role}-face-card=${card.rank}-${card.suit}]`).as('card');
    if (card.rank === 8) {
      cy.get('@card').should('have.class', 'glasses');
      if (pNum === 1) {
        playerHasGlasses = true;
      }
    }
  });
  // Test Hands
  if (pNum === 0) {
    // Player Hand
    fixture.p0Hand.forEach((card) => {
      cy.get(`[data-player-hand-card=${card.rank}-${card.suit}]`);
    });
    // Opponent Hand
    if (fixture.p1Hand.length > 0) {
      cy.get('[data-opponent-hand-card]').should('have.length', fixture.p1Hand.length);
    } else {
      cy.get('[data-opponent-hand-card]').should('not.exist');
    }
    if (playerHasGlasses || spectating) {
      fixture.p1Hand.forEach((card) => {
        cy.get(`[data-opponent-hand-card=${card.rank}-${card.suit}]`);
      });
    }
  } else if (pNum === 1) {
    // Player hand
    fixture.p1Hand.forEach((card) => {
      cy.get(`[data-player-hand-card=${card.rank}-${card.suit}]`);
    });
    // Opponent Hand
    if (fixture.p0Hand.length > 0) {
      cy.get('[data-opponent-hand-card]').should('have.length', fixture.p0Hand.length);
    } else {
      cy.get('[data-opponent-hand-card]').should('not.exist');
    }
    if (playerHasGlasses) {
      fixture.p0Hand.forEach((card) => {
        cy.get(`[data-opponent-hand-card=${card.rank}-${card.suit}]`);
      });
    }
  }
  // Test scrap (if provided)
  if (fixture.scrap) {
    cy.get('#scrap').contains(`(${fixture.scrap.length})`);
  }
}

/**
 * @param fixture:
 * {
 * 	 p0Hand: {suit: number, rank: number}[],
 *   p0Points: {suit: number, rank: number}[],
 *   p0FaceCards: {suit: number, rank: number}[],
 *   p1Hand: {suit: number, rank: number}[],
 *   p1Points: {suit: number, rank: number}[],
 *   p1FaceCards: {suit: number, rank: number}[],
 * }
 */
function assertStoreMatchesFixture(fixture) {
  cy.window()
    .its('cuttle.gameStore')
    .then((game) => {
      // Player 0
      expect(cardListsMatch(game.players[0].hand, fixture.p0Hand)).to.eq(
        true,
        `P0 Hand should match fixture, but actual: ${printCardList(
          game.players[0].hand,
        )} did not match ficture: ${printCardList(fixture.p0Hand)}`,
      );
      expect(cardListsMatch(game.players[0].points, fixture.p0Points)).to.eq(
        true,
        `P0 Points should match fixture, but actual: ${printCardList(
          game.players[0].points,
        )} did not match ficture: ${printCardList(fixture.p0Points)}`,
      );
      expect(cardListsMatch(game.players[0].faceCards, fixture.p0FaceCards)).to.eq(
        true,
        `P0 Face Cards should match fixture, but actual: ${printCardList(
          game.players[0].faceCards,
        )} did not match ficture: ${printCardList(fixture.p0FaceCards)}`,
      );
      // Player 1
      expect(cardListsMatch(game.players[1].hand, fixture.p1Hand)).to.eq(
        true,
        `P1 Hand should match fixture, but actual: ${printCardList(
          game.players[1].hand,
        )} did not match ficture: ${printCardList(fixture.p1Hand)}`,
      );
      expect(cardListsMatch(game.players[1].points, fixture.p1Points)).to.eq(
        true,
        `P1 Points should match fixture, but actual: ${printCardList(
          game.players[1].points,
        )} did not match ficture: ${printCardList(fixture.p1Points)}`,
      );
      expect(cardListsMatch(game.players[1].faceCards, fixture.p1FaceCards)).to.eq(
        true,
        `P1 Face Cards should match fixture, but actual: ${printCardList(
          game.players[1].faceCards,
        )} did not match ficture: ${printCardList(fixture.p1FaceCards)}`,
      );
      // Scrap (if specified)
      if (fixture.scrap) {
        expect(cardListsMatch(game.scrap, fixture.scrap)).to.eq(
          true,
          `Scrap should match fixture, but actual ${printCardList(
            game.scrap,
          )} did not match fixture: ${printCardList(fixture.scrap)}`,
        );
      }
      // Top Card if specified
      if (fixture.topCard) {
        expect(cardsMatch(game.topCard, fixture.topCard)).to.eq(
          true,
          `Expected top card ${printCard(game.topCard)} to match fixture topcard: ${printCard(
            fixture.topCard,
          )}`,
        );
      }
      if (fixture.secondCard) {
        expect(cardsMatch(game.secondCard, fixture.secondCard)).to.eq(
          true,
          `Expected second card ${printCard(game.secondCard)} to match fixture second card: ${printCard(
            fixture.secondCard,
          )}`,
        );
      }
    });
}

export function assertVictory() {
  cy.log('Asserting player victory');
  cy.get('#game-over-dialog').should('be.visible').get('[data-cy=victory-heading]').should('be.visible');
  cy.window()
    .its('cuttle.gameStore')
    .then((game) => {
      if (game.isRanked) {
        const gameNumber = game.currentMatch.games.length;
        const matchWinner = game.currentMatch.winner;
        cy.get('#game-over-dialog')
          .should('be.visible')
          .should('contain', matchWinner ? 'You Win the Match' : `Game ${gameNumber}: You Win`)
          .get('[data-cy=match-result-section]')
          .should('be.visible')
          .get(`[data-cy=match-result-game-${gameNumber}]`)
          .should('contain', 'W')
          .get('[data-cy=icon-W]')
          .should('be.visible');
      } else {
        cy.get('#game-over-dialog').should('be.visible').should('not.contain', 'Match against');
      }
    });
}

export function assertLoss() {
  cy.log('Asserting player loss');
  cy.get('#game-over-dialog').should('be.visible').get('[data-cy=loss-heading]').should('be.visible');
  cy.get('[data-cy=loss-img]').should('be.visible');
  cy.window()
    .its('cuttle.gameStore')
    .then((game) => {
      if (game.isRanked) {
        const gameNumber = game.currentMatch.games.length;
        const matchWinner = game.currentMatch.winner;
        cy.get('#game-over-dialog')
          .should('contain', matchWinner ? 'You Lose the Match' : `Game ${gameNumber}: You Lose`)
          .should('be.visible')
          .get('[data-cy=match-result-section]')
          .should('be.visible')
          .get(`[data-cy=match-result-game-${gameNumber}]`)
          .should('contain', 'L')
          .get('[data-cy=icon-L]')
          .should('be.visible');
      } else {
        cy.get('#game-over-dialog').should('be.visible').should('not.contain', 'Match against');
      }
    });
}

export function assertStalemate() {
  cy.log('Asserting stalemate');
  cy.get('#game-over-dialog').should('be.visible').get('[data-cy=stalemate-heading]').should('be.visible');
  cy.get('[data-cy=stalemate-img]').should('be.visible');
  cy.window()
    .its('cuttle.gameStore')
    .then((game) => {
      if (game.isRanked) {
        const gameNumber = game.currentMatch.games.length;
        cy.get('#game-over-dialog')
          .should('be.visible')
          // Don't need to check match winner as we do in assertVictory or assertLoss
          // since a stalemate won't decide a match winner
          .should('contain', `Game ${gameNumber}: Draw`)
          .get('[data-cy=match-result-section]')
          .should('be.visible')
          .get(`[data-cy=match-result-game-${gameNumber}]`)
          .should('contain', 'D')
          .get('[data-cy=icon-D]')
          .should('be.visible');
      } else {
        cy.get('#game-over-dialog').should('be.visible').should('not.contain', 'Match against');
      }
    });
}

/**
 * @param fixture:
 * {
 * 	 p0Hand: {suit: number, rank: number}[],
 *   p0Points: {suit: number, rank: number}[],
 *   p0FaceCards: {suit: number, rank: number}[],
 *   p1Hand: {suit: number, rank: number}[],
 *   p1Points: {suit: number, rank: number}[],
 *   p1FaceCards: {suit: number, rank: number}[],
 * }
 * @param pNum: int [0, 1]
 */
export function assertGameState(pNum, fixture, spectating = false) {
  cy.log('Asserting game state:', fixture);
  assertDomMatchesFixture(pNum, fixture, spectating);
  assertStoreMatchesFixture(fixture);
}
