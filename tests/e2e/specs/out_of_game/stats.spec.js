import { username, validPassword } from '../../support/helpers';
function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(username, validPassword);
  cy.vueRoute('/stats');
}

describe('Stats Page', () => {
  beforeEach(setup);

  it('Displays Headers, Cards, and Table', () => {
    cy.get('[data-cy=selected-season-header]');
  });
});
