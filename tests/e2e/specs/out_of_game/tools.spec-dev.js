import { username as playerUsername, validPassword as playerPassword } from '../../support/helpers';

function setup() {
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(playerUsername, playerPassword);
  cy.vueRoute('/');
}

describe('Vue Devtools', () => {
  beforeEach(setup);

  it('Should include Vue Devtools when ENABLE_VUE_DEVTOOLS is true', () => {
    const hasDevtoolsEnabled = Cypress.env('ENABLE_VUE_DEVTOOLS') === 'true';
    cy.get('[data-vue-devtools]').should('have.length', hasDevtoolsEnabled ? 1 : 0);
  });
});
