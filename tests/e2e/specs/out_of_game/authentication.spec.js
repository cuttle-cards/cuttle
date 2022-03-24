import {  assertSnackbarError } from '../../support/helpers';
import {
	username as validUsername,
	validPassword,
} from '../../support/helpers';

function assertSuccessfulAuth(username) {
	// Confirm we have navigated to home
	cy.hash().should('eq', '#/');
	// Check store auth data
	cy.window().its('app.$store.state.auth').as('authState')
		.then((authState) => {
			expect(authState.authenticated).to.eq(true);
			expect(authState.username).to.eq(username);
		});
}

function assertFailedAuth() {
	// Confirm we have not navigated away from login/signup
	cy.hash().should('eq', '#/login');
	// Check store auth data
	cy.window().its('app.$store.state.auth').as('authState')
		.then((authState) => {
			expect(authState.authenticated).to.eq(false);
			expect(authState.username).to.eq(null);
		});
}

describe('Auth - Page Content', () => {
	beforeEach(() => {
		cy.wipeDatabase();
		cy.visit('#/login');
		cy.signupOpponent(validUsername, validPassword);
	});

	it('Displays logo and navigates to rules page', () => {
		cy.get('#logo')
		cy.get('[data-cy=rules-link]').click();
		cy.hash().should('eq', '#/rules');
	});

})

describe('Logging In', () => {
	beforeEach(() => {
		cy.wipeDatabase();
		cy.visit('#/login');
		cy.signupOpponent(validUsername, validPassword);
	});

	/**
     * Successful Logins
     */
	it('Can log into existing account with submit button', () => {
		cy.get('[data-cy=username]').type(validUsername);
		cy.get('[data-cy=password]').type(validPassword);
		cy.get('[data-cy=submit]').click();
		assertSuccessfulAuth(validUsername);
	});
	it('Can login via enter key in username', () => {
		cy.get('[data-cy=password]').type(validPassword);
		cy.get('[data-cy=username]').type(validUsername + '{enter}');
		assertSuccessfulAuth(validUsername);
	});
	it('Can login via enter key in password', () => {
		cy.get('[data-cy=username]').type(validUsername);
		cy.get('[data-cy=password]').type(validPassword + '{enter}');
		assertSuccessfulAuth(validUsername);
	});

	/**
     * Rejected logins
     */
	it('Rejects login before signup', () => {
		cy.get('[data-cy=username]').type('unRegisteredUsername');
		cy.get('[data-cy=password]').type(validPassword);
		cy.get('[data-cy=submit]').click();
		assertSnackbarError('Could not find that user with that username. Try signing up!', 'auth');
		assertFailedAuth();
	});
	it('Rejects incorrect password', () => {
		cy.get('[data-cy=username]').type(validUsername);
		cy.get('[data-cy=password]').type('incorrectPw');
		cy.get('[data-cy=submit]').click();
		assertSnackbarError('Username and password do not match', 'auth');
		assertFailedAuth();
	});
});

describe('Signing Up', () => {
	beforeEach(() => {
		cy.wipeDatabase();
		cy.visit('#/login');
		cy.get('[data-cy=switch-mode]').click(); // Switch to signup
	});

	/**
     * Successful Signups
     */
	it('Successfully signs up and navigates to home page', () => {
		cy.get('[data-cy=username]').type(validUsername);
		cy.get('[data-cy=password]').type(validPassword);
		cy.get('[data-cy=submit]').click();
		assertSuccessfulAuth(validUsername);
	});
	it('Signs up by pressing enter on the username field', () => {
		cy.get('[data-cy=password]').type(validPassword);
		cy.get('[data-cy=username]').type(validUsername + '{enter}');
		assertSuccessfulAuth(validUsername);
	});
	it('Signs up by pressing enter on the password field', () => {
		cy.get('[data-cy=username]').type(validUsername);
		cy.get('[data-cy=password]').type(validPassword + '{enter}');
		assertSuccessfulAuth(validUsername);
	});

	/**
     * Rejected Signups
     */
	it('Requires password to be at least eight characters', () => {
		cy.get('[data-cy=username]').type(validUsername);
		cy.get('[data-cy=password]').type('sh0rt');
		cy.get('[data-cy=submit]').click();
		assertFailedAuth();
		assertSnackbarError('Your password must contain at least eight characters', 'auth');
	});
	it('Password is required', () => {
		cy.get('[data-cy=username]').type(validUsername);
		cy.get('[data-cy=submit]').click();
		assertFailedAuth();
		assertSnackbarError('Password is required', 'auth');
	});
	it('Username is required', () => {
		cy.get('[data-cy=password]').type(validPassword);
		cy.get('[data-cy=submit]').click();
		assertFailedAuth();
		assertSnackbarError('Please provide a non-empty username', 'auth');
	});
	it('Rejects signup if username already exists', () => {
		cy.signupOpponent(validUsername, validPassword);
		cy.get('[data-cy=username]').type(validUsername);
		cy.get('[data-cy=password]').type(validPassword);
		cy.get('[data-cy=submit]').click();
		assertFailedAuth();
		assertSnackbarError('That username is already registered to another user; try logging in!', 'auth');
	});
});