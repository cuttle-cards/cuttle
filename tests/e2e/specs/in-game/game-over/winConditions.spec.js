import { assertGameState, assertLoss, assertVictory, assertStalemate, assertSnackbar } from '../../../support/helpers';
import { myUser, opponentOne } from '../../../fixtures/userFixtures';
import { Card } from '../../../fixtures/cards';

function goHomeJoinNewGame() {
  cy.log('Going home');
  cy.get('[data-cy=gameover-go-home]').click();
  cy.url().should('not.include', '/game');
  // Re-join game and confirm it loads normally
  cy.setupGameAsP0(true);
  cy.get('#game-over-dialog').should('not.exist');
  cy.get('[data-player-hand-card]').should('have.length', 5);
  cy.log('Joined new game successfully');
}

describe('Winning the game', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Shows when player wins game with 21 points', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    // Play Seven of Clubs
    cy.get('[data-player-hand-card=7-0]').click();
    cy.get('[data-move-choice=points]').click();
    assertGameState(0, {
      p0Hand: [],
      p0Points: [ Card.SEVEN_OF_CLUBS, Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });
    assertVictory();
    goHomeJoinNewGame();
  });

  it('Shows when player wins game with 14 points and one king', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.JACK_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [],
      p1Points: [ Card.SEVEN_OF_CLUBS ],
      p1FaceCards: [],
      scrap: [ Card.TEN_OF_SPADES ],
    });

    // Play Jack of Clubs
    cy.get('[data-player-hand-card=11-0]').click();
    cy.get('[data-move-choice=jack]').click();
    cy.get('[data-opponent-point-card=7-0]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [ Card.SEVEN_OF_CLUBS, Card.SEVEN_OF_DIAMONDS ],
      p0FaceCards: [ Card.KING_OF_SPADES ],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [ Card.TEN_OF_SPADES ],
    });
    assertVictory();
    goHomeJoinNewGame();
  });

  it('Shows when player wins game with 0 points and four kings', () => {
    
    cy.loadGameFixture(0, {
      p0Hand: [ Card.KING_OF_HEARTS ],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES, Card.KING_OF_CLUBS, Card.KING_OF_DIAMONDS ],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [],
    });

    // Play King of Hearts
    cy.get('[data-player-hand-card=13-2]').click();
    cy.get('[data-move-choice=faceCard]').click();

    assertGameState(0, {
      p0Hand: [],
      p0Points: [],
      p0FaceCards: [ Card.KING_OF_SPADES, Card.KING_OF_CLUBS, Card.KING_OF_DIAMONDS, Card.KING_OF_HEARTS ],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      scrap: [],
    });
    assertVictory();
    goHomeJoinNewGame();
  });

  it('Wins the game when opponent concedes', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.concedeOpponent();
    assertVictory();
    goHomeJoinNewGame();
  });
});

describe('Losing the game', () => {
  beforeEach(() => {
    cy.setupGameAsP1();
  });

  it('Shows when opponent wins with 21 points', () => {
    cy.loadGameFixture(1, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.playPointsOpponent(Card.SEVEN_OF_CLUBS);
    assertLoss();
    goHomeJoinNewGame();
  });

  it('Loses by conceding', () => {
    cy.loadGameFixture(1, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible')
      .get('[data-cy=concede-initiate]')
      .click();

    // Cancel Concede
    cy.get('#request-gameover-dialog').should('be.visible')
      .get('[data-cy=request-gameover-cancel]')
      .click();
    cy.get('#request-gameover-dialog').should('not.be.visible');
    // Re-open concede menu and confirm concession
    cy.get('#game-menu-activator').click();
    cy.get('#game-menu').should('be.visible')
      .get('[data-cy=concede-initiate]')
      .click();
    cy.get('#request-gameover-dialog').should('be.visible')
      .get('[data-cy=request-gameover-confirm]')
      .click();
    assertLoss();
    goHomeJoinNewGame();
  });
});

describe('Stalemates', () => {
  it('Passes three times for a stalemate', () => {

    cy.setupGameAsP0();
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.log('Drawing last two cards');
    cy.get('#deck').should('contain', '(2)')
      .click();
    cy.drawCardOpponent();
    cy.log('Deck empty');

    // Pass three times for stalemate
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)')
      .should('contain', 'PASS')
      .click();
    cy.log('Should log the passing');
    cy.get('#history').contains(`${myUser.username} passed`);
    cy.get('#turn-indicator').contains('OPPONENT\'S TURN');
    cy.passOpponent();
    cy.get('#history').contains(`${opponentOne.username} passed`);
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)')
      .should('contain', 'PASS')
      .click();

    assertStalemate();
    goHomeJoinNewGame();
  });

  it('Registers stalemate when opponent passes first/last', () => {

    cy.setupGameAsP1();
    cy.loadGameFixture(1, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      deck: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.get('#deck').should('contain', '(2)');
    cy.log('Drawing last two cards');
    cy.drawCardOpponent();
    cy.get('#deck').should('contain', '(1)')
      .click();
    cy.log('Deck empty');

    cy.get('#turn-indicator').contains('OPPONENT\'S TURN');
    cy.passOpponent();
    cy.get('#turn-indicator').contains('YOUR TURN');
    cy.get('#deck').should('contain', '(0)')
      .should('contain', 'PASS')
      .click();
    cy.get('#turn-indicator').contains('OPPONENT\'S TURN');
    cy.passOpponent();

    assertStalemate();
    goHomeJoinNewGame();
  });

  describe('Requesting a stalemate', () => {
    it('Ends in stalemate when player requests stalemate and opponent agrees', () => {
      cy.setupGameAsP0();
      cy.get('[data-player-hand-card]').should('have.length', 5);
      cy.log('Game loaded');

      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible')
        .get('[data-cy=stalemate-initiate]')
        .click();
      // Cancel Stalemate
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-cancel]')
        .click();

      cy.get('#request-gameover-dialog').should('not.be.visible');

      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible')
        .get('[data-cy=stalemate-initiate]')
        .click();
      // Request Stalemate
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();

      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');

      cy.acceptStalemateOpponent();
      assertStalemate();
    });

    it('Ends in a stalemate when opponent requests a stalemate and player agrees', () => {
      cy.setupGameAsP1();
      cy.get('[data-player-hand-card]').should('have.length', 6);
      cy.log('Game loaded');

      // Opponent requests stalemate
      cy.stalemateOpponent();

      // Player accepts stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=accept-stalemate]')
        .click();

      assertStalemate();
    });

    it('Requires waiting a turn to request stalemate after opponent rejects prior stalemate request', () => {
      cy.setupGameAsP0();
      cy.get('[data-player-hand-card]').should('have.length', 5);
      cy.log('Game loaded');

      // Request Stalemate
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible')
        .get('[data-cy=stalemate-initiate]')
        .click();
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');

      // Opponent rejects stalemate
      cy.rejectStalemateOpponent();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('not.exist');

      // Player requests stalemate again -- not allowed this turn
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible')
        .get('[data-cy=stalemate-initiate]')
        .click();
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();
      
      assertSnackbar('Stalemate request was already rejected this turn');

      // Draw card to take turn
      cy.get('#deck').click();
      cy.get('#turn-indicator').contains('OPPONENT\'S TURN');

      // Request stalemate again - now allowed
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible')
        .get('[data-cy=stalemate-initiate]')
        .click();
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();

      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
      cy.acceptStalemateOpponent();
      assertStalemate();
    });

    it('Cancels the stalemate when opponent requests and player rejects', () => {
      cy.setupGameAsP1();

      // Opponent requests stalemate
      cy.stalemateOpponent();

      // Player rejects stalemate
      cy.get('#opponent-requested-stalemate-dialog')
        .should('be.visible')
        .find('[data-cy=reject-stalemate]')
        .click();

      cy.get('#opponent-requested-stalemate-dialog').should('not.be.visible');
    });

    it('Player requests stalemate, then reloads before opponent accepts', () => {
      cy.setupGameAsP1();
      cy.get('#game-menu-activator').click();
      cy.get('#game-menu').should('be.visible')
        .get('[data-cy=stalemate-initiate]')
        .click();
      cy.get('#request-gameover-dialog')
        .should('be.visible')
        .get('[data-cy=request-gameover-confirm]')
        .click();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
      cy.reload();
      cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');
      cy.acceptStalemateOpponent();
      assertStalemate();
    });

    describe('Illegal stalemate requests', () => {

      it('Rejects request to initiate stalemate while you already have a stalemate request pending', () => {
        cy.setupGameAsP0();

        // Player requests stalemate
        cy.get('#game-menu-activator').click();
        cy.get('#game-menu').should('be.visible')
          .get('[data-cy=stalemate-initiate]')
          .click();
        cy.get('#request-gameover-dialog')
          .should('be.visible')
          .get('[data-cy=request-gameover-confirm]')
          .click();
        cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');

        // Force store to request stalemate again; should 400
        cy.window()
          .its('cuttle.gameStore')
          .then(async (store) => {
            try {
              await store.requestStalemate();
              // Fail test if backend allows request
              expect(true).to.eq(false, 'Expected 400 error when requesting to initiate stalemate while one is already in progress but came back 200');
            } catch (err) {
              expect(err).to.eq('game.snackbar.stalemate.alreadyConsideringStalemate');
            }
          });
      });

      it('Prevents player from accepting their own stalemate request', () => {
        cy.setupGameAsP0();

        // Player requests stalemate
        cy.get('#game-menu-activator').click();
        cy.get('#game-menu').should('be.visible')
          .get('[data-cy=stalemate-initiate]')
          .click();
        cy.get('#request-gameover-dialog')
          .should('be.visible')
          .get('[data-cy=request-gameover-confirm]')
          .click();
        cy.get('#waiting-for-opponent-stalemate-scrim').should('be.visible');

        // Force store to request stalemate again; should 400
        cy.window()
          .its('cuttle.gameStore')
          .then(async (store) => {
            try {
              await store.acceptStalemate();
              // Fail test if backend allows request
              expect(true).to.eq(false, 'Expected 400 error when requesting to initiate stalemate while one is already in progress but came back 200');
            } catch (err) {
              expect(err).to.eq('game.snackbar.stalemate.opponentConsideringStalemate');
            }
          });
      });

      it('Prevents users from requesting a stalemate while resolving a seven', () => {
        cy.setupGameAsP0();
        cy.loadGameFixture(0, {
          p0Hand: [ Card.SEVEN_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          topCard: Card.FOUR_OF_CLUBS,
          secondCard: Card.SIX_OF_DIAMONDS,
        });
    
        cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);
    
        cy.get('[data-top-card=4-0]').should('exist')
          .and('be.visible');
  
        // Force store to request stalemate; should 400
        cy.window()
          .its('cuttle.gameStore')
          .then(async (store) => {
            try {
              await store.requestStalemate();
              // Fail test if backend allows request
              expect(true).to.eq(false, 'Expected 400 error when requesting to initiate stalemate during 7 resolution, but got 200 response');
            } catch (err) {
              expect(err).to.eq('game.snackbar.stalemate.wrongPhase');
            }
          });
  
        cy.get('[data-second-card=6-1]').click();
        cy.get('[data-move-choice=points]').click();
  
        assertGameState(0, {
          p0Hand: [],
          p0Points: [ Card.SIX_OF_DIAMONDS ],
          p0FaceCards: [],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          scrap: [ Card.SEVEN_OF_CLUBS ]
        });
      });
  
      it('Prevents users from requesting a stalemate during countering', () => {
        cy.setupGameAsP1();
        cy.loadGameFixture(1, {
          p0Hand: [ Card.ACE_OF_CLUBS ],
          p0Points: [],
          p0FaceCards: [],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
        });
  
        cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
        cy.get('#cannot-counter-dialog').should('be.visible');
  
        // Force store to request stalemate; should 400
        cy.window()
          .its('cuttle.gameStore')
          .then(async (store) => {
            try {
              await store.requestStalemate();
              // Fail test if backend allows request
              expect(true).to.eq(false, 'Expected 400 error when requesting to initiate stalemate during countering phase, but got 200 response');
            } catch (err) {
              expect(err).to.eq('game.snackbar.stalemate.wrongPhase');
            }
          });
      });

      it('Prevents requesting a new stalemate when your opponent just requested a stalemate from you', () => {
        cy.setupGameAsP0();

        cy.stalemateOpponent();

        cy.get('#opponent-requested-stalemate-dialog')
          .should('be.visible');

        // Force store to request stalemate; should 400
        cy.window()
          .its('cuttle.gameStore')
          .then(async (store) => {
            try {
              await store.requestStalemate();
              // Fail test if backend allows request
              expect(true).to.eq(false, 'Expected 400 error when requesting to initiate stalemate during countering phase, but got 200 response');
            } catch (err) {
              expect(err).to.eq('game.snackbar.stalemate.alreadyConsideringStalemate');
            }
          });
      });
    }); // End describe illegal stalemates
  }); // End describe requesting stalemates
}); // End describe stalemates

describe('Conceding while a oneOff is being resolved - prevents resolving oneOff state from persisting to new game', () => {
  beforeEach(() => {
    cy.setupGameAsP0();
  });

  it('Opponent concedes while seven oneOff is being resolved', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.playOneOffAndResolveAsPlayer(Card.SEVEN_OF_CLUBS);

    cy.get('[data-top-card=4-0]').should('exist')
      .and('be.visible');
    cy.get('[data-second-card=6-1]').should('exist')
      .and('be.visible');

    cy.concedeOpponent();
    assertVictory();
    goHomeJoinNewGame();

    cy.loadGameFixture(0, {
      p0Hand: [ Card.SEVEN_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [],
      p1Points: [],
      p1FaceCards: [],
      topCard: Card.FOUR_OF_CLUBS,
      secondCard: Card.SIX_OF_DIAMONDS,
    });

    cy.get('[data-top-card=4-0]').should('not.exist');
    cy.get('[data-second-card=6-1]').should('not.exist');
  });

  it('Concede game while resolving a four', () => {
    cy.loadGameFixture(0, {
      p0Hand: [ Card.FOUR_OF_CLUBS ],
      p0Points: [],
      p0FaceCards: [],
      p1Hand: [ Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS ],
      p1Points: [],
      p1FaceCards: [],
    });

    cy.playOneOffAndResolveAsPlayer(Card.FOUR_OF_CLUBS);

    cy.get('#game-menu-activator').click({ force: true });
    cy.get('#game-menu').should('be.visible')
      .get('[data-cy=concede-initiate]')
      .click();
    cy.get('#request-gameover-dialog').should('be.visible')
      .get('[data-cy=request-gameover-confirm]')
      .click();
    assertLoss();
    goHomeJoinNewGame();

    cy.get('#waiting-for-opponent-discard-scrim').should('not.exist');
  });
});
