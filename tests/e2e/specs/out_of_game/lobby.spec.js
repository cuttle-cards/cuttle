import {
	username as validUsername,
	validPassword,
	opponentUsername,
	opponentPassword
} from '../../support/helpers';

function setup() {
	cy.wipeDatabase();
	cy.visit('/');
	cy.signupPlayer(validUsername, validPassword);
	cy.createGamePlayer('Test Game')
		.then((gameSummary) => {
			cy.window().its('app.$store').invoke('dispatch', 'requestSubscribe', gameSummary.gameId);
			cy.vueRoute(`/lobby/${gameSummary.gameId}`);
			cy.wrap(gameSummary).as('gameSummary');
		});
}
function assertGameStarted() {
	cy.url().should('include', '/game');
	cy.window().its('app.$store.state.game').then((game) => {
		expect(game.players.length).to.eq(2);
		expect(game.players[0].hand.length).to.eq(5);
		expect(game.players[1].hand.length).to.eq(6);
		expect(game.deck.length).to.eq(39);
		expect(game.topCard.rank).to.be.greaterThan(0);
		expect(game.secondCard.rank).to.be.greaterThan(0);
		expect(game.scrap.length).to.eq(0);
		expect(game.twos.length).to.eq(0);
	});
}
describe('Lobby - Page Content', () => {
	beforeEach(() => {
		setup();
	});
	it('Displays headers', () => {
		cy.contains('h1', 'Lobby for Test Game');
	});
	it('Displays logo', () => {
		cy.get('#logo')
	});
	it('Displays buttons', () => {
		cy.contains('button.v-btn', 'EXIT');
		cy.contains('button.v-btn', 'READY');
	});
	it('Shows both players indicators', () => {
		cy.get('[data-cy=my-indicator]')
			.contains(validUsername.split('@')[0])
			.should('not.contain', '@');
		cy.get('[data-cy=opponent-indicator]')
			.contains('Invite');
	});
	it('Defaults to not-ready', () => {
		cy.get('[data-cy=my-indicator]').should('not.have.class', 'ready');
		cy.get('[data-cy=opponent-indicator]').should('not.have.class', 'ready');
	});
    
});

describe('Lobby - P0 Perspective', () => {
	beforeEach(() => {
		setup();
	});
	it('Exits the Lobby', () => {
		cy.get('[data-cy=my-indicator]')
			.contains(validUsername);
		cy.get('[data-cy=exit-button]').click();
		// Confirm navigation back to home
		cy.hash().should('eq', '#/');
		// Test store state
		cy.window().its('app.$store.state')
			.then((state) => {
				expect(state.game.players.length).to.eq(0);
				expect(state.game.id).to.eq(null);
				expect(state.game.name).to.eq(null);
				expect(state.game.myPNum).to.eq(null);
			});
	});
	it('Ready & UnReady buttons work', () => {
		cy.get('[data-cy=ready-button]')
		// Test: Button text defaults to 'Ready'
			.contains('READY')
			.should('not.contain', 'UNREADY')
			.click()
			.contains('UNREADY');
		// Test: player indicator classes
		cy.get('[data-cy=my-indicator]')
			.should('have.class', 'ready')
			.contains(validUsername);;
		cy.get('[data-cy=opponent-indicator]').should('not.have.class', 'ready');
		cy.window().its('app.$store')
			.then((store) => {
				// Test: store state
				expect(store.state.game.p0Ready).to.eq(true); // Player is ready
				expect(store.getters.opponentIsReady).to.eq(null); // Opponent is missing (not ready)
				// Click Unready button
				cy.get('[data-cy=ready-button]').click();
				cy.get('[data-cy=my-indicator]').should('not.have.class', 'ready');
				//Return updated store state
				return cy.wrap(store.state.game);
			})
			.then((updatedGameState) => {
				//Test updated store state
				expect(updatedGameState.p0Ready).to.eq(false); // Player not ready
			});
	});
	it('Shows when opponent joins, leaves, and re-joins', () => {
		cy.contains('[data-cy=opponent-indicator]', 'Invite');
		cy.window().its('app.$store.state.game').then(gameData => {
			cy.contains('[data-cy=opponent-indicator]', 'Invite');
			// Sign up new user and subscribe them to game
			cy.signupOpponent(opponentUsername, opponentPassword);
			cy.subscribeOpponent(gameData.id);
			// Test that opponent's username appears in indicator
			cy.contains('[data-cy=opponent-indicator]', opponentUsername.split('@')[0]);
			// Opponent leaves
			cy.leaveLobbyOpponent();
			cy.contains('[data-cy=opponent-indicator]', 'Invite');
			// Opponent joins again
			cy.subscribeOpponent(gameData.id);
			cy.contains('[data-cy=opponent-indicator]', opponentUsername.split('@')[0]);
		});
	});
	it('Shows when oppenent Readies/Unreadies', function () {
		// Opponent subscribes & readies up
		cy.signupOpponent(opponentUsername, opponentPassword);
		cy.subscribeOpponent(this.gameSummary.gameId);
		cy.get('[data-cy=opponent-indicator]').should('not.have.class', 'ready');
		cy.readyOpponent();
		cy.get('[data-cy=opponent-indicator]').should('have.class', 'ready');
		//Opponent un-readies
		cy.readyOpponent();
		cy.get('[data-cy=opponent-indicator]').should('not.have.class', 'ready');
	});
	it('Game starts when both players are ready - opponent first', function () {
		cy.signupOpponent(opponentUsername, opponentPassword);
		cy.subscribeOpponent(this.gameSummary.gameId);
		cy.readyOpponent().then(() => {
			cy.get('[data-cy=opponent-indicator]').should('have.class', 'ready');
			cy.get('[data-cy=ready-button]').click();
			assertGameStarted();
		});
	});
	it('Game starts when both players are ready - player first', function () {
		cy.get('[data-cy=ready-button]').click();
		cy.signupOpponent(opponentUsername, opponentPassword);
		cy.subscribeOpponent(this.gameSummary.gameId);
		cy.readyOpponent().then(() => {
			assertGameStarted();
		});
	});
	it.skip('[Missing Feature] Loads lobby after page refresh', () => {
		cy.reload();
		expect(true).to.eq(false, 'Empty Test');
	});
});

describe('Lobby - P1 Perspective', () => {
	beforeEach(() => {
		cy.wipeDatabase();
		cy.visit('/');
		cy.signupPlayer(validUsername, validPassword);
		cy.createGamePlayer('Test Game')
			.then((gameSummary) => {
				cy.wrap(gameSummary).as('gameSummary');
				// Sign up new (other) user and subscribe them to game
				cy.signupOpponent(opponentUsername, opponentPassword);
				cy.subscribeOpponent(gameSummary.gameId);
				// Join game as this user and navigate to lobby
				cy.window().its('app.$store').invoke('dispatch', 'requestSubscribe', gameSummary.gameId);
				cy.vueRoute(`/lobby/${gameSummary.gameId}`);
			});
	});
	it('Shows opponent already in lobby for player joining second', () => {
		cy.contains('[data-cy=opponent-indicator]', opponentUsername.split('@')[0]);
	});
	it('Shows when oppenent Readies/Unreadies', () => {
		cy.contains('[data-cy=opponent-indicator]', opponentUsername.split('@')[0]);
		cy.get('[data-cy=opponent-indicator]').should('not.have.class', 'ready');
		cy.readyOpponent();
		cy.get('[data-cy=opponent-indicator]', {timeOut: 10000}).should('have.class', 'ready');
		cy.get('[data-cy=my-indicator]').should('not.have.class', 'ready');
		//Opponent un-readies
		cy.readyOpponent();
		cy.get('[data-cy=opponent-indicator]').should('not.have.class', 'ready');
		cy.get('[data-cy=my-indicator]').should('not.have.class', 'ready');
	});
	it('Shows when opponent leaves and rejoins', function () {
		cy.contains('[data-cy=opponent-indicator]', opponentUsername.split('@')[0]);
		cy.leaveLobbyOpponent(); // Opponent leaves
		cy.contains('[data-cy=opponent-indicator]', 'Invite');
		// Opponent joins again
		cy.subscribeOpponent(this.gameSummary.gameId);
		cy.contains('[data-cy=opponent-indicator]', opponentUsername.split('@')[0]);
	});
	it('Ready & UnReady buttons work', () => {
		cy.get('[data-cy=ready-button]')
		// Test: Button text defaults to 'Ready'
			.contains('READY')
			.should('not.contain', 'UNREADY')
			.click()
			.contains('UNREADY');
		// Test: player indicator classes
		cy.get('[data-cy=my-indicator]')
			.should('have.class', 'ready')
			.contains(validUsername);
		cy.get('[data-cy=opponent-indicator]').should('not.have.class', 'ready');
		cy.window().its('app.$store')
			.then((store) => {
				// Test: store state
				expect(store.state.game.p1Ready).to.eq(true); // Player is ready
				expect(store.getters.opponentIsReady).to.eq(false); // Opponent is not ready
				// Click Unready button
				cy.get('[data-cy=ready-button]')
					.should('contain', 'UNREADY')
					.click()
					.should('not.contain', 'UNREADY')
					.should('contain', 'READY');
				cy.get('[data-cy=my-indicator]').should('not.have.class', 'ready');
				//Return updated store state
				return cy.wrap(store.state.game);
			})
			.then((updatedGameState) => {
				//Test updated store state
				expect(updatedGameState.p1Ready).to.eq(false); // Player not ready
			});
	});
	it('Game starts when both players are ready - opponent ready before joining', function () {
		cy.get('[data-cy=exit-button]').click(); // leave game so opponent can ready before player joins
		cy.readyOpponent();
		// Join game again
		cy.window().its('app.$store').invoke('dispatch', 'requestSubscribe', this.gameSummary.gameId);
		cy.vueRoute(`/lobby/${this.gameSummary.gameId}`);
		cy.get('[data-cy=ready-button]').click();
		// Test that game started
		assertGameStarted();
	});
	it('Game starts when both players are ready - opponent readies first after player joins', () => {
		cy.readyOpponent();
		cy.get('[data-cy=ready-button]').click();
		assertGameStarted();
	});
	it('Game starts when both players are ready - player readies first', () => {
		cy.get('[data-cy=ready-button]').click();
		cy.readyOpponent();
		assertGameStarted();
	});
	it.skip('[Feature Missing] Loads lobby after page refresh', () => {
		expect(true).to.eq(false, 'Empty Test');
	});
})
