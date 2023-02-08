function setup() {
  cy.wipeDatabase();
  cy.visit('/', {
    onBeforeLoad(win) {
      cy.stub(win.console, 'log').as('consoleLog')
      cy.stub(win.console, 'error').as('consoleError')
    },
  });
}

describe('Devtools', () => {
  beforeEach(setup);

  it('Should include cuttle.app in development builds', () => {
    cy.window().its('cuttle.app').should('exist');
  });

  it('Should include Vue Devtools in development builds', () => {
    cy.get('@consoleLog').should('be.calledWith', 'Connecting devtools');
  });
});
