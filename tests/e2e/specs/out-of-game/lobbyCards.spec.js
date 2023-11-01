import { myUser, opponentOne } from '../../fixtures/userFixtures';


function setup(isRanked = false) {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.createGamePlayer({ gameName: 'Test Game', isRanked }).then((gameSummary) => {
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => store.requestSubscribe(gameSummary.gameId));
    cy.vueRoute(`/lobby/${gameSummary.gameId}`);
    cy.wrap(gameSummary).as('gameSummary');
  });
}

describe('P0 Perspective', () => {
  beforeEach(() => {
    //creates a game and player joins it
    setup();
  });

  it('player readies and leaves', () => {
    playerIndicatorShowsNameAndCard();
    playerGetsReady();
    playerGetsNotReady();
    playerLeavesLobby();
    //joins back
    cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Join Casual').click();
    playerShouldNotBeReady();
  });

  it('opponent joins and leaves', () => {
    opponentjoinsLobby();
    opponentIndicatorShowsNameAndCard();
    cy.leaveLobbyOpponent();
    opponentIndicatorShouldBeEmpty();
    testReadyValueInState('p1', false);
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => {
        expect(store.p1Ready).to.eq(store.opponentIsReady); // IS THIS OK TO FAIL ?
      });
  });

  it('opponent joins, readies and leaves', () => {
    opponentjoinsLobby();
    cy.readyOpponent();
    opponentShouldBeReady();
    cy.leaveLobbyOpponent();

    cy.wait(2000);
    // testReadyValueInState('p1', null); // THIS SHOULD NOT FAIL
    testReadyValueInState('p1', false); // THIS SHOULD PROBABLY FAIL
    // testReadyValueInState('p1', true); // THIS SHOULD FAIL
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => {
        expect(store.p1Ready).to.eq(store.opponentIsReady); // IS THIS OK TO FAIL ?
      });
  });

  it('opponent joins, readies, leaves and joins back', () => {
    cy.window()
      .its('cuttle.gameStore')
      .then((gameData) => {
        cy.signupOpponent(opponentOne);
        cy.subscribeOpponent(gameData.id);
        cy.readyOpponent();
        cy.leaveLobbyOpponent();
        cy.subscribeOpponent(gameData.id);
        opponentIndicatorShowsNameAndCard();
        opponentShouldNotBeReady();  // THIS SHOULD NOT FAIL
        // opponentShouldBeReady(); // THIS SHOULD FAIL
      });
  });

  it('opponent joins, readies, leaves, joins back, player leaves and come back', () => {
    cy.window()
      .its('cuttle.gameStore')
      .then((gameData) => {
        cy.signupOpponent(opponentOne);
        cy.subscribeOpponent(gameData.id);
        cy.readyOpponent();
        cy.leaveLobbyOpponent();
        cy.subscribeOpponent(gameData.id);
        opponentIndicatorShowsNameAndCard();
        opponentShouldNotBeReady();  // THIS SHOULD NOT FAIL
        // opponentShouldBeReady(); // THIS SHOULD FAIL
      });
    playerLeavesLobby();
    //joins back
    cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Join Casual').click();

    //check both names are different in state
    cy.window()
    .its('cuttle.gameStore')
    .then((gameData) => {
      expect(gameData.players[0].username).to.not.eq(gameData.players[1].username);
    });
    
    playerIndicatorShowsNameAndCard();
    playerShouldNotBeReady();
    opponentIndicatorShowsNameAndCard(); // FAILS => OPPONENT HAS PLAYER'S NAME IN THE UI
    opponentShouldNotBeReady();
  });
});



// functions

function clickReadyButton() {
  cy.get('[data-cy=ready-button]').click();
}

function testReadyValueInState(player, value) {
  let prop = player === 'p0' ? 'p0Ready' : 'p1Ready';
  cy.window()
    .its('cuttle.gameStore')
    .then((game) => {
      expect(game[prop]).to.eq(value);
    });
}

function playerIndicatorShowsNameAndCard () {
  cy.get('[data-cy=my-indicator]').contains(myUser.username);
  cy.get('[data-cy=my-indicator]').find('[data-cy="lobby-card-container"]')
    .should('exist');
  cy.get('[data-cy=my-indicator]').find('[data-cy="lobby-back-card"]').should('exist');
  cy.get('[data-cy=my-indicator]').find('[data-cy="lobby-ready-card"]').should('exist');
}
function opponentIndicatorShouldBeEmpty() {
  cy.get('[data-cy=opponent-indicator]').contains('Invite');
}
function opponentIndicatorShowsNameAndCard() {
  cy.get('[data-cy=opponent-indicator]').contains(opponentOne.username);
  cy.get('[data-cy=opponent-indicator]').find('[data-cy="lobby-card-container"]')
    .should('exist');
  cy.get('[data-cy=opponent-indicator]').find('[data-cy="lobby-back-card"]').should('exist');
  cy.get('[data-cy=opponent-indicator]').find('[data-cy="lobby-ready-card"]').should('exist');
}



function playerShouldNotBeReady() {
  cy.get('[data-cy=my-indicator]').find('[data-cy="lobby-card-container"]').should('have.class', 'notReady');
  testReadyValueInState('p0', false );
}
function playerShouldBeReady() {
  cy.get('[data-cy=my-indicator]').find('[data-cy="lobby-card-container"]').should('have.class', 'ready');
  testReadyValueInState('p0', true );
}
function opponentShouldNotBeReady() {
  cy.get('[data-cy=opponent-indicator]').find('[data-cy="lobby-card-container"]').should('have.class', 'notReady');
  testReadyValueInState('p1', false);
}
function opponentShouldBeReady() {
  cy.get('[data-cy=opponent-indicator]').find('[data-cy="lobby-card-container"]').should('have.class', 'ready');
  testReadyValueInState('p1', true);
}


function playerGetsReady() {
  clickReadyButton();
  playerShouldBeReady();
}
function playerGetsNotReady() {
  clickReadyButton();
  playerShouldNotBeReady();
}


function playerLeavesLobby() {
  cy.get('[data-cy=exit-button]').click();
  cy.hash().should('eq', '#/');
  // Test store state
  cy.window()
    .its('cuttle.gameStore')
    .then((state) => {
      expect(state.players.length).to.eq(0);
      expect(state.id).to.eq(null);
      expect(state.name).to.eq(null);
      expect(state.myPNum).to.eq(null);
    });
}

function opponentjoinsLobby() {
  cy.window()
      .its('cuttle.gameStore')
      .then((gameData) => {
        cy.contains('[data-cy=opponent-indicator]', 'Invite');
        // Sign up new user and subscribe them to game
        cy.signupOpponent(opponentOne);
        cy.subscribeOpponent(gameData.id);
        // Test that opponent's username appears in indicator
        cy.contains('[data-cy=opponent-indicator]', opponentOne.username);
      });
}
