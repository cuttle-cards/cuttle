import { assertSnackbar } from '../../support/helpers';
import { myUser } from '../../fixtures/userFixtures';
import { announcementData } from '../../../../src/routes/home/components/announcementDialog/data/announcementData';

function assertSuccessfulAuth(username) {
  // Confirm we have navigated to home
  cy.location('pathname').should('eq', '/');
  // Check store auth data
  cy.window()
    .its('cuttle.authStore')
    .then((store) => {
      expect(store.authenticated).to.eq(true);
      expect(store.username).to.eq(username);
    });
}

function assertFailedAuth(path) {
  // Confirm we have not navigated away from login/signup
  cy.location('pathname').should('eq', path);
  // Check store auth data
  cy.window()
    .its('cuttle.authStore')
    .then((store) => {
      expect(store.authenticated).to.eq(false);
      expect(store.username).to.eq(null);
    });
}

function forceFormSubmit() {
  cy.get('[data-cy=submit]').then((btn) => {
    btn[0].disabled = false;
    btn.click();
  });
}

describe('Auth - Page Content', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/signup');
    cy.signupOpponent(myUser);
    window.localStorage.setItem('announcement', announcementData.id);
  });

  it('Displays logo and navigates to rules page', () => {
    cy.get('#logo');
    cy.get('[data-cy=rules-link]').click();
    cy.location('pathname').should('eq', '/rules');
  });

  it('Navigates to /login if returning visiter, /signup if first new visiter', () => {
    cy.wipeDatabase();
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=username]').type(myUser.username + '{enter}');
    cy.get('[data-cy="user-menu"]').click();
    cy.get("[data-nav='Log Out']").click();
    cy.visit('/');
    cy.location('pathname').should('eq', '/login');
    cy.clearLocalStorage();
    cy.visit('/');
    cy.location('pathname').should('eq', '/signup');
  });
});

describe('Logging In', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/login');
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
    assertSnackbar('Could not find that user with that username. Try signing up!', 'error', 'auth');
    assertFailedAuth('/login');
  });
  it('Rejects incorrect password', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type('incorrectPw');
    cy.get('[data-cy=submit]').click();
    assertSnackbar('Username and password do not match', 'error', 'auth');
    assertFailedAuth('/login');
  });
});

describe('Signing Up', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('/signup');
    window.localStorage.setItem('announcement', announcementData.id);
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
    cy.get('#password-messages').should('contain', 'Password must contain at least eight characters');
    cy.get('[data-cy=submit]').should('not.be', 'enabled');
    forceFormSubmit();
    assertFailedAuth('/signup');
    assertSnackbar('Your password must contain at least eight characters', 'error', 'auth');
  });
  it('Password is required', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=submit]').should('not.be', 'enabled');
    forceFormSubmit();
    assertFailedAuth('/signup');
    assertSnackbar('Password is required', 'error', 'auth');
  });
  it('Username is required', () => {
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').should('not.be', 'enabled');
    forceFormSubmit();
    assertFailedAuth('/signup');
    assertSnackbar('Please provide a non-empty username', 'error', 'auth');
  });
  it('Rejects signup if username already exists', () => {
    cy.signupOpponent(myUser);
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertFailedAuth('/signup');
    assertSnackbar('That username is already registered to another user; try logging in!', 'error', 'auth');
  });
});

// Check for canonical link in head
describe('Canonical Link', () => {
  it('Checks for the canonical link in the head meta data on login/signup page', () => {
    cy.visit('/login');
    cy.get('head link[rel="canonical"]')
      .should('have.attr', 'href')
      .and('contain', '/signup');
  });
});

