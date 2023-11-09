import { myUser, opponentOne } from '../../fixtures/userFixtures';git branch
import en from '../../../../src/translations/en.json';

describe('Lobby - Page content of casual game', () => {
  beforeEach(() => {
    setup();
  });

  it('Create casual game and join', () => {
    checkPageContentOfLobby('casual');
  });

  it('Changes games type.  casual, ranked, casual', () => {
    //switch to ranked
    cy.toggleInput('[data-cy=edit-game-ranked-switch]');
    checkPageContentOfLobby();
    checkRanked(true);
    //switch back to casual
    cy.toggleInput('[data-cy=edit-game-ranked-switch]', true);
    checkPageContentOfLobby();
    checkRanked(false);
  });
});

describe('Lobby - Page Content of ranked game', () => {
  beforeEach(() => {
    setup(true);
  });

  it('Create ranked game and join', () => {
    checkPageContentOfLobby();
  });

  it('Changes games type.  ranked, casual, ranked', () => {
    //switch to ranked
    cy.toggleInput('[data-cy=edit-game-ranked-switch]', true);
    checkPageContentOfLobby();
    checkRanked(false);
    //switch back to casual
    cy.toggleInput('[data-cy=edit-game-ranked-switch]');
    checkPageContentOfLobby();
    checkRanked(true);
  });
});

describe('P0 Perspective - Player joins/leaves, ready/unready', () => {
  beforeEach(() => {
    //creates a game and player joins it
    setup();
  });

  it('Exit lobby with exit button', () => {
    cy.get('[data-cy=exit-button]').click();
    // Confirm navigation back to home
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
  });

  it('Ready & UnReady buttons work', () => {
    cy.get('[data-cy=ready-button]')
      // Test: Button text defaults to 'Ready'
      .contains(en.lobby.ready)
      .should('not.contain', en.lobby.unready)
      .click()
      .contains(en.lobby.unready)
      .click()
      .contains(en.lobby.ready)
      .should('not.contain', en.lobby.unready);
  });

  it('Player readies, exists and joins back', () => {
      indicatorShowsNameAndCard('player');
    playerGetsReady();
      userShouldDisplayReady('player', true);
      testReadyValueInState('p0', true);
    playerGetsNotReady();
      userShouldDisplayReady('player', false);
      testReadyValueInState('p0', false);
    playerLeavesLobby();
      testReadyValueInState('p0', false);
    //joins back
    cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Join Casual').click();
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', false);
      testReadyValueInState('p0', false);
  });
});

describe('P0 Perspective - opponent join/leave, ready/unready', () => {
  beforeEach(() => {
    //creates a game and player joins it
    setup();
  });

  it('opponent joins and leaves', () => {
      indicatorShowsNameAndCard('player');
    playersArrayShouldBeEqualTo(1);
      opponentjoinsLobby();
      indicatorShowsNameAndCard('opponent');
      userShouldDisplayReady('opponent', false);
      testReadyValueInState('p1', false);
      playersArrayShouldBeEqualTo(2);
    cy.leaveLobbyOpponent();
      indicatorShowsNameAndCard('player');
      opponentIndicatorShouldBeEmpty();
      playersArrayShouldBeEqualTo(1);
      testReadyValueInState('p1', false);
  });

  it('opponent joins, player leaves and joins back', () => {
    opponentjoinsLobby();
    playerLeavesLobby();
      playersArrayShouldBeEqualTo(0);
      testReadyValueInState('p1', false);
      checkOpponentIsReadyInGetter(null);
    // joins back
    cy.get('[data-cy=game-list-item]').contains('button.v-btn', 'Join Casual').click();
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', false);
      indicatorShowsNameAndCard('opponent');
      userShouldDisplayReady('opponent', false);
      testReadyValueInState('p0', false);
      testReadyValueInState('p1', false);
      checkOpponentIsReadyInGetter(false);

    //check that players array is sorted (p0 at index O, p1 at index 1)
    cy.window()
      .its('cuttle.gameStore')
      .then((gameData) => {
        expect(gameData.players[0].username).to.eq(myUser.username);
        expect(gameData.players[1].username).to.eq(opponentOne.username);
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
          opponentIndicatorShouldBeEmpty();
          testReadyValueInState('p1', false);
          checkOpponentIsReadyInGetter(null);
          playersArrayShouldBeEqualTo(1);
        cy.subscribeOpponent(gameData.id);
          indicatorShowsNameAndCard('opponent');
          userShouldDisplayReady('opponent', false);
          testReadyValueInState('p1', false);
          checkOpponentIsReadyInGetter(false);
          playersArrayShouldBeEqualTo(2);
      });
  });

  it('Shows when opponent changes game to ranked or casual', function () {
    opponentjoinsLobby();
      checkRanked(false);
    cy.setIsRankedOpponent(true);
      checkRanked(true);
  });
});

describe('P0 Perspective - game starts', () => {
  beforeEach(() => {
    //creates a game and player joins it
    setup();
  });

   it('Game starts when both players are ready - opponent first', function () {
    opponentjoinsLobby();
    cy.readyOpponent().then(() => {
      playerGetsReady();
      assertGameStarted();
    });
  });

  it('Game starts when both players are ready - player first', function () {
    playerGetsReady();
    opponentjoinsLobby();
    cy.readyOpponent().then(() => {
      assertGameStarted();
    });
  });
});

describe('P0 Perspective - page reloading', () => {
  beforeEach(() => {
    //creates a game and player joins it
    setup();
  }); 

    it('join, reload', function () {
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', false);
      opponentIndicatorShouldBeEmpty();
  });

  it('join, switch to ranked, reload', function () {
    cy.toggleInput('[data-cy=edit-game-ranked-switch]');
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', false);
      opponentIndicatorShouldBeEmpty();
      checkRanked(true);
    cy.window()
    .its('cuttle.gameStore')
    .then((gameData) => {
      expect(gameData.isRanked).to.eq(true);      
    });
  });

  it('join, get ready, reload', function () {
    playerGetsReady();
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', true);
      opponentIndicatorShouldBeEmpty();
  });

  it('join, get ready, switch to ranked, reload', function () {
    playerGetsReady();
    cy.toggleInput('[data-cy=edit-game-ranked-switch]');
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', true);
      opponentIndicatorShouldBeEmpty();
      checkRanked(true);
  });

  it('join, opponent joins, reload', function () {
    opponentjoinsLobby();
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', false);
      indicatorShowsNameAndCard('opponent');
      userShouldDisplayReady('opponent', false);
      testReadyValueInState('p0', false);
      testReadyValueInState('p1', false);
      checkOpponentIsReadyInGetter(false);
  });

  it('join, opponent joins, player  gets ready, reload', function () {
    opponentjoinsLobby();
    playerGetsReady();
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', true);
      indicatorShowsNameAndCard('opponent');
      userShouldDisplayReady('opponent', false);
      testReadyValueInState('p0', true);
      testReadyValueInState('p1', false);
      checkOpponentIsReadyInGetter(false);
  });

  it('join, opponent joins, opponent gets ready, reload', function () {
    opponentjoinsLobby();
    cy.readyOpponent();
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', false);
      indicatorShowsNameAndCard('opponent');
      userShouldDisplayReady('opponent', true);
      testReadyValueInState('p0', false);
      testReadyValueInState('p1', true);
      checkOpponentIsReadyInGetter(true);
  });
});

describe('Lobby - P1 Perspective', () => {
  beforeEach(() => {
    //create a game, opponent joins, player joins
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(myUser);
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameSummary) => {
      cy.wrap(gameSummary).as('gameSummary');
      // Sign up new (other) user and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameSummary.gameId);
      // Join game as this user and navigate to lobby
      cy.window()
        .its('cuttle.gameStore')
        .then((store) => store.requestSubscribe(gameSummary.gameId));
      cy.vueRoute(`/lobby/${gameSummary.gameId}`);
    });
  });

  it('player joins', () => {
    indicatorShowsNameAndCard('opponent');
    indicatorShowsNameAndCard('player');
  });

  it('Ready & UnReady buttons work', () => {
    playerGetsReady();
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', true);
      indicatorShowsNameAndCard('opponent');
      userShouldDisplayReady('opponent', false);
      testReadyValueInState('p1', true);
      testReadyValueInState('p0', false);
      checkOpponentIsReadyInGetter(false);
    playerGetsNotReady();
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', false);
      testReadyValueInState('p1', false);
  });

  it('Shows when oppenent Readies/Unreadies', () => {
    cy.readyOpponent();
      userShouldDisplayReady('player', false);
      userShouldDisplayReady('opponent', true);
      testReadyValueInState('p1', false);
      testReadyValueInState('p0', true);
      checkOpponentIsReadyInGetter(true);
    cy.readyOpponent();
      userShouldDisplayReady('player', false);
      userShouldDisplayReady('opponent', false);
      testReadyValueInState('p1', false);
      testReadyValueInState('p0', false);
      checkOpponentIsReadyInGetter(false);
  });

  it('Shows when opponent leaves and rejoins', function () {
    cy.leaveLobbyOpponent(); // Opponent leaves
      userShouldDisplayReady('player', false);
      opponentIndicatorShouldBeEmpty();
      testReadyValueInState('p1', false);
      testReadyValueInState('p0', false);
      checkOpponentIsReadyInGetter(null);
    cy.subscribeOpponent(this.gameSummary.gameId);
      indicatorShowsNameAndCard('opponent');
  });

  it('join, get ready, reload', function () {
    playerGetsReady();
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', true);
      indicatorShowsNameAndCard('opponent');
      userShouldDisplayReady('opponent', false);
      testReadyValueInState('p1', true);
      testReadyValueInState('p0', false);
      checkOpponentIsReadyInGetter(false);
  });

  it('join, opponent gets ready, reload', function () {
    cy.readyOpponent();
    cy.reload();
    cy.url().should('include', '/lobby');
      indicatorShowsNameAndCard('player');
      userShouldDisplayReady('player', false);
      indicatorShowsNameAndCard('opponent');
      userShouldDisplayReady('opponent', true);
      testReadyValueInState('p1', false);
      testReadyValueInState('p0', true);
      checkOpponentIsReadyInGetter(true);
  });

  it('Game starts when both players are ready - opponent ready before joining', function () {
    playerLeavesLobby(); // leave game so opponent can ready before player joins
    cy.readyOpponent();
    //player joins back
    cy.window()
      .its('cuttle.gameStore')
      .then((store) => store.requestSubscribe(this.gameSummary.gameId));
      cy.vueRoute(`/lobby/${this.gameSummary.gameId}`);
      playerGetsReady();
      assertGameStarted();
  });

  it('Game starts when both players are ready - opponent readies first after player joins', function () {
    cy.readyOpponent();
    playerGetsReady();
    assertGameStarted();
  });

  it('Game starts when both players are ready - player readies first', () => {
    playerGetsReady();
    cy.readyOpponent();
    assertGameStarted();
  });

  // it('Reloads lobby after page refresh and loads user into the game when game has already started with one move made', function () {
  //   playerGetsReady();
  //   cy.reload();
  //   // Disconnect socket and then opponent hits ready to start game
  //   cy.window()
  //     .its('cuttle.authStore')
  //     .then((store) => store.disconnectSocket());
  //   cy.readyOpponent();
  //   cy.drawCardOpponent();
  //   // Reload the page -- should bring user into the game
  //   cy.reload();
  //     assertGameStarted(false); // skip hand size assertion
  //     cy.get('[data-player-hand-card]').should('have.length', 6);
  //     cy.get('[data-opponent-hand-card]').should('have.length', 6);
  // });
});


// helper functions

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

function playersArrayShouldBeEqualTo(length) {
  cy.window()
    .its('cuttle.gameStore')
    .then((gameData) => {
      expect(gameData.players.length).to.eq(length);
    });
}

function checkPageContentOfLobby() {
  // Displays title, game name and nav drawer
    cy.contains('h1', en.lobby.lobbyFor);
    cy.window()
      .its('cuttle.gameStore')
      .then((gameData) => {
        cy.contains('h5', gameData.name);
      });
    cy.get('[data-cy=nav-drawer]').should('not.exist');
  // Shows exit button, ready buttonn casual/ranked switch
    cy.contains('button.v-btn', en.lobby.exit);
    cy.contains('button.v-btn', en.lobby.ready);
    cy.get('[data-cy=edit-game-ranked-switch]').should('exist');
}

function checkRanked(isRanked) {
  if(isRanked) {
    cy.get('[data-cy=ready-button-coffee-icon]').should('not.exist');
    cy.get('[data-cy=ready-button-sword-cross-icon]').should('exist');
    cy.contains('[data-cy=edit-game-ranked-switch]', en.global.ranked);
  } else {
    cy.get('[data-cy=ready-button-coffee-icon]').should('exist');
    cy.get('[data-cy=ready-button-sword-cross-icon]').should('not.exist');
    cy.contains('[data-cy=edit-game-ranked-switch]', en.global.casual);
  }

  cy.window()
  .its('cuttle.gameStore')
    .then((game) => {
      expect(game.isRanked).to.eq(isRanked);
    });
}

function assertGameStarted(noMovesYet = true) {
  cy.url().should('include', '/game');
  cy.window()
    .its('cuttle.gameStore')
    .then((game) => {
      expect(game.players[1].hand.length).to.eq(6);
      if (noMovesYet) {
        expect(game.players.length).to.eq(2);
        expect(game.players[0].hand.length).to.eq(5);
        expect(game.deck.length).to.eq(39);
      }
      expect(game.topCard.rank).to.be.greaterThan(0);
      expect(game.secondCard.rank).to.be.greaterThan(0);
      expect(game.scrap.length).to.eq(0);
      expect(game.twos.length).to.eq(0);
    });
}

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
function checkOpponentIsReadyInGetter(status) {
  cy.window()
  .its('cuttle.gameStore')
  .then((store) => {
    expect(store.opponentIsReady).to.eq(status);
  });

}


function indicatorShowsNameAndCard(user) {
  const userString = user === 'player' ? 'my' : 'opponent';

  if(user === 'player') {
    cy.get(`[data-cy=${userString}-indicator]`).contains(myUser.username);
  } else {
    cy.get(`[data-cy=${userString}-indicator]`).contains(opponentOne.username);
  }

  cy.get(`[data-cy=${userString}-indicator]`).find('[data-cy="lobby-card-container"]')
    .should('exist');
  cy.get(`[data-cy=${userString}-indicator]`).find('[data-cy="lobby-back-card"]').should('exist');
  cy.get(`[data-cy=${userString}-indicator]`).find('[data-cy="lobby-ready-card"]').should('exist');
}

function opponentIndicatorShouldBeEmpty() {
  cy.get('[data-cy=opponent-indicator]').contains('Invite');
}

function userShouldDisplayReady(user, isReady) {
  const userString = user === 'player' ? 'my' : 'opponent';
  if(isReady) {
    cy.get(`[data-cy=${userString}-indicator]`).find('[data-cy="lobby-card-container"]').should('have.class', 'ready');
  } else {
    cy.get(`[data-cy=${userString}-indicator]`).find('[data-cy="lobby-card-container"]').should('not.have.class', 'ready');
  }
}

function playerGetsReady() {
  clickReadyButton();
}
function playerGetsNotReady() {
  clickReadyButton();
}


function playerLeavesLobby() {
  cy.get('[data-cy=exit-button]').click();
}

function opponentjoinsLobby() {
  cy.window()
    .its('cuttle.gameStore')
    .then((gameData) => {
      cy.contains('[data-cy=opponent-indicator]', en.lobby.invite);
      // Sign up new user and subscribe them to game
      cy.signupOpponent(opponentOne);
      cy.subscribeOpponent(gameData.id);
    });
}
