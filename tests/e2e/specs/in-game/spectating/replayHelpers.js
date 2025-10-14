import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  setupGameBetweenTwoUnseenPlayers,
  assertGameState,
  assertGameOverAsSpectator
} from '../../../support/helpers';
import { playerOne, playerTwo } from '../../../fixtures/userFixtures';
import { Card } from '../../../fixtures/cards';


dayjs.extend(utc);

function createAndFinishCasualMatch() {
  setupGameBetweenTwoUnseenPlayers('replay');
  
  cy.get('@replayGameId').then((gameId) => {
    cy.loadGameFixture(0, {
      p0Hand: [
        Card.NINE_OF_CLUBS,
        Card.TEN_OF_DIAMONDS,
        Card.TEN_OF_HEARTS,
        Card.TEN_OF_SPADES,
        Card.ACE_OF_CLUBS
      ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [
        Card.TEN_OF_CLUBS,
        Card.TWO_OF_DIAMONDS,
        Card.TWO_OF_HEARTS,
        Card.TWO_OF_SPADES,
        Card.THREE_OF_CLUBS,
        Card.THREE_OF_DIAMONDS
      ],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.SEVEN_OF_HEARTS,
      secondCard: Card.FOUR_OF_HEARTS,
    }, gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playPointsOpponent(Card.NINE_OF_CLUBS, gameId);

    cy.recoverSessionOpponent(playerTwo);
    cy.scuttleOpponent(Card.TEN_OF_CLUBS, Card.NINE_OF_CLUBS, gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playPointsOpponent(Card.TEN_OF_DIAMONDS, gameId);

    cy.recoverSessionOpponent(playerTwo);
    cy.drawCardOpponent(gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playPointsOpponent(Card.TEN_OF_HEARTS, gameId);
    
    cy.recoverSessionOpponent(playerTwo);
    cy.drawCardOpponent(gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playPointsOpponent(Card.TEN_OF_SPADES, gameId);
    
    // Both players rematch and create new game
    cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
    cy.recoverSessionOpponent(playerTwo);
    cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
    cy.get(`@game${gameId}RematchId`).then((rematchGameId) => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.SEVEN_OF_HEARTS,
        secondCard: Card.FOUR_OF_HEARTS,
      }, rematchGameId);
      
      cy.recoverSessionOpponent(playerOne);
      cy.concedeOpponent(rematchGameId);
      cy.rematchOpponent({ gameId: rematchGameId, rematch: false, skipDomAssertion: true });
    });
  });
}

function rewatchCasualMatch(firstGameId) {
  cy.visit(`/spectate/${firstGameId}`);

  cy.get('[data-player-hand-card]').should('have.length', 5);
  cy.get('[data-cy=history-log]').should('have.length', 1);

  // Step forward to state 1 (loaded fixture)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=1');
  cy.get('[data-cy=history-log]').should('have.length', 2);

  assertGameState(0, {
    p0Hand: [ Card.NINE_OF_CLUBS, Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [],
    p0FaceCards: [],
    p1Hand: [
      Card.TEN_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS
    ],
    p1Points: [],
    p1FaceCards: [],
  }, true);

  // Step forward to state 2 (p0 plays nine of clubs for points)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=2');
  cy.get('[data-cy=history-log]').should('have.length', 3);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.NINE_OF_CLUBS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TEN_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS
    ],
    p1Points: [],
    p1FaceCards: [],
  }, true);

  // Step forward to state 3 (p1 scuttles nine of clubs with ten of clubs)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=3');
  cy.get('[data-cy=history-log]').should('have.length', 4);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS
    ],
    p1Points: [],
    p1FaceCards: [],
    scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
  }, true);

  // Step forward to state 4 (p0 plays ten of diamonds for points)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=4');
  cy.get('[data-cy=history-log]').should('have.length', 5);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_DIAMONDS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS
    ],
    p1Points: [],
    p1FaceCards: [],
    scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
  }, true);

  // Step forward to state 5 (p1 draws card)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=5');
  cy.get('[data-cy=history-log]').should('have.length', 6);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_DIAMONDS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS,
      Card.SEVEN_OF_HEARTS,
    ],
    p1Points: [],
    p1FaceCards: [],
    scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
  }, true);

  // Step forward to state 6 (p0 plays ten of hearts for points)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=6');
  cy.get('[data-cy=history-log]').should('have.length', 7);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS,
      Card.SEVEN_OF_HEARTS,
    ],
    p1Points: [],
    p1FaceCards: [],
    scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
  }, true);

  // Step forward to state 7 (p1 draws card)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=7');
  cy.get('[data-cy=history-log]').should('have.length', 8);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS,
      Card.SEVEN_OF_HEARTS,
      Card.FOUR_OF_HEARTS,
    ],
    p1Points: [],
    p1FaceCards: [],
    scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
  }, true);

  // Step forward to state 8 (p0 plays ten of spades for points)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=8');
  cy.get('[data-cy=history-log]').should('have.length', 9);

  assertGameState(0, {
    p0Hand: [ Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS,
      Card.SEVEN_OF_HEARTS,
      Card.FOUR_OF_HEARTS,
    ],
    p1Points: [],
    p1FaceCards: [],
    scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
  }, true);

  // Step backward to state 7 (p1 draw)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-backward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=7');
  cy.get('[data-cy=history-log]').should('have.length', 8);

  assertGameState(0, {
    p0Hand: [ Card.TEN_OF_SPADES, Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS,
      Card.SEVEN_OF_HEARTS,
      Card.FOUR_OF_HEARTS,
    ],
    p1Points: [],
    p1FaceCards: [],
    scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
  }, true);

  // skip backward to state 0
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=skip-backward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=0');
  cy.get('[data-cy=history-log]').should('have.length', 1);
  cy.get('[data-player-hand-card]').should('have.length', 5);
  
  // skip forward to state -1 (end of game)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=skip-forward]')
    .click();

  cy.url().should('contain', '?gameStateIndex=-1');
  cy.get('[data-cy=history-log]').should('have.length', 9);

  assertGameState(0, {
    p0Hand: [ Card.ACE_OF_CLUBS ],
    p0Points: [ Card.TEN_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
    p0FaceCards: [],
    p1Hand: [
      Card.TWO_OF_DIAMONDS,
      Card.TWO_OF_HEARTS,
      Card.TWO_OF_SPADES,
      Card.THREE_OF_CLUBS,
      Card.THREE_OF_DIAMONDS,
      Card.SEVEN_OF_HEARTS,
      Card.FOUR_OF_HEARTS,
    ],
    p1Points: [],
    p1FaceCards: [],
    scrap: [ Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS ],
  }, true);

  assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 0, stalemates: 0, winner: 'p1', isRanked: false });

  // Navigate to next game
  cy.get('[data-cy=gameover-rematch]').click();

  // Should start on the first state since game is finished
  cy.url().should('contain', '?gameStateIndex=0');

  // Step forward to game 2 state 1 (loaded game fixture)
  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();
  cy.url().should('contain', '?gameStateIndex=1');
  cy.get('[data-cy=history-log]').should('have.length', 2);

  assertGameState(0, {
    p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
    p0Points: [],
    p0FaceCards: [],
    p1Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
    p1Points: [],
    p1FaceCards: [],
    topCard: Card.SEVEN_OF_HEARTS,
    secondCard: Card.FOUR_OF_HEARTS,
  }, true);

  cy.get('[data-cy=playback-controls]')
    .find('[data-cy=step-forward]')
    .click();
  cy.url().should('contain', '?gameStateIndex=2');
  cy.get('[data-cy=history-log]')
    .should('have.length', 3)
    .should('contain', 'Player1 conceded');

  assertGameOverAsSpectator({ p1Wins: 1, p2Wins: 1, stalemates: 0, winner: 'p2', isRanked: false, rematchWasDeclined: true });
}

function createAndPlayGameWithOneOffs() {
  setupGameBetweenTwoUnseenPlayers('replay');
  cy.get('@replayGameId').then((gameId) => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.ACE_OF_CLUBS, Card.TWO_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.TWO_OF_DIAMONDS ],
      p1Points: [ Card.TEN_OF_CLUBS, Card.TEN_OF_DIAMONDS ],
      p1FaceCards: [],
    }, gameId);

    cy.recoverSessionOpponent(playerOne);
    cy.playOneOffOpponent(Card.ACE_OF_CLUBS, gameId);
    cy.recoverSessionOpponent(playerTwo);
    cy.counterOpponent(Card.TWO_OF_DIAMONDS, gameId);
    cy.recoverSessionOpponent(playerOne);
    cy.counterOpponent(Card.TWO_OF_HEARTS, gameId);
    cy.recoverSessionOpponent(playerTwo);
    cy.resolveOpponent(gameId);

    cy.concedeOpponent(gameId);
    cy.recoverSessionOpponent(playerOne);
    cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
    cy.recoverSessionOpponent(playerTwo);
    cy.rematchOpponent({ gameId, rematch: true, skipDomAssertion: true });
    cy.get(`@game${gameId}RematchId`).then((rematchGameId) => {
      cy.loadGameFixture(0, {
        p0Hand: [ Card.ACE_OF_CLUBS, Card.ACE_OF_DIAMONDS ],
        p0Points: [],
        p0FaceCards: [],
        p1Hand: [ Card.TWO_OF_CLUBS, Card.TWO_OF_DIAMONDS ],
        p1Points: [],
        p1FaceCards: [],
        topCard: Card.SEVEN_OF_HEARTS,
        secondCard: Card.FOUR_OF_HEARTS,
      }, rematchGameId);
      cy.recoverSessionOpponent(playerOne);
      cy.concedeOpponent(rematchGameId);
      cy.rematchOpponent({ gameId: rematchGameId, rematch: false, skipDomAssertion: true });
    });
  });
}

export { createAndFinishCasualMatch, rewatchCasualMatch, createAndPlayGameWithOneOffs };
