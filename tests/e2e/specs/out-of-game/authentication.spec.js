import { assertSnackbarError } from '../../support/helpers';
import { myUser } from '../../fixtures/userFixtures';

function assertSuccessfulAuth(username) {
  // Confirm we have navigated to home
  cy.hash().should('eq', '#/');
  // Check store auth data
  cy.window()
    .its('cuttle.app.config.globalProperties.$store.state.auth')
    .as('authState')
    .then((authState) => {
      expect(authState.authenticated).to.eq(true);
      expect(authState.username).to.eq(username);
    });
}

function assertFailedAuth(path) {
  // Confirm we have not navigated away from login/signup
  cy.hash().should('eq', path);
  // Check store auth data
  cy.window()
    .its('cuttle.app.config.globalProperties.$store.state.auth')
    .as('authState')
    .then((authState) => {
      expect(authState.authenticated).to.eq(false);
      expect(authState.username).to.eq(null);
    });
}

describe('Auth - Page Content', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('#/login');
    cy.signupOpponent(myUser);
  });

  it('Displays logo and navigates to rules page', () => {
    cy.get('#logo');
    cy.get('[data-cy=rules-link]').click();
    cy.hash().should('eq', '#/rules');
  });

    
  it('Navigates to /login if returning visiter, /signup if first new visiter', () => {
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=username]').type(myUser.username + '{enter}');
    cy.get('[data-nav=Logout]').click();
    cy.visit('/');
    cy.hash().should('eq', '#/login');
    cy.clearLocalStorage();
    cy.visit('/');
    cy.hash().should('eq', '#/signup');
  });


});

describe('Logging In', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('#/login');
    cy.signupOpponent(myUser);
  });

  /**
   * Successful Logins
   */
  it('Can log into existing account with submit button', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertSuccessfulAuth(myUser.username);
  });
  it('Can login via enter key in username', () => {
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=username]').type(myUser.username + '{enter}');
    assertSuccessfulAuth(myUser.username);
  });
  it('Can login via enter key in password', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password + '{enter}');
    assertSuccessfulAuth(myUser.username);
  });

  /**
   * Rejected logins
   */
  it('Rejects login before signup', () => {
    cy.get('[data-cy=username]').type('unRegisteredUsername');
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertSnackbarError('Could not find that user with that username. Try signing up!', 'auth');
    assertFailedAuth('#/login');
  });
  it('Rejects incorrect password', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type('incorrectPw');
    cy.get('[data-cy=submit]').click();
    assertSnackbarError('Username and password do not match', 'auth');
    assertFailedAuth('#/login');
  });
});

describe('Signing Up', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('#/signup');
  });

  /**
   * Successful Signups
   */
  it('Successfully signs up and navigates to home page', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertSuccessfulAuth(myUser.username);
  });
  it('Signs up by pressing enter on the username field', () => {
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=username]').type(myUser.username + '{enter}');
    assertSuccessfulAuth(myUser.username);
  });
  it('Signs up by pressing enter on the password field', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password + '{enter}');
    assertSuccessfulAuth(myUser.username);
  });

  /**
   * Rejected Signups
   */
  it('Requires password to be at least eight characters', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type('sh0rt');
    cy.get('[data-cy=submit]').click();
    assertFailedAuth('#/signup');
    assertSnackbarError('Your password must contain at least eight characters', 'auth');
  });
  it('Password is required', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=submit]').click();
    assertFailedAuth('#/signup');
    assertSnackbarError('Password is required', 'auth');
  });
  it('Username is required', () => {
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertFailedAuth('#/signup');
    assertSnackbarError('Please provide a non-empty username', 'auth');
  });
  it('Rejects signup if username already exists', () => {
    cy.signupOpponent(myUser);
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertFailedAuth('#/signup');
    assertSnackbarError('That username is already registered to another user; try logging in!', 'auth');
  });
});
