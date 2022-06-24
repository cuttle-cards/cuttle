import { username as playerUsername, validPassword as playerPassword } from '../../support/helpers';

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(playerUsername, playerPassword);
  cy.vueRoute('/');
}

describe('Vue Devtools', () => {
  beforeEach(setup);

  it('Should not include Vue Devtools in production builds', () => {
    cy.get('[data-vue-devtools]').should('have.length', 0);
  });
});
