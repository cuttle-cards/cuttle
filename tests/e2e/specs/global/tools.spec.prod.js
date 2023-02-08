function setup() {
  cy.wipeDatabase();
  cy.visit('/?mock-prod=true', {
    onBeforeLoad(win) {
      cy.stub(win.console, 'log').as('consoleLog')
      cy.stub(win.console, 'error').as('consoleError')
    },
  });
}

describe('Devtools', () => {
  beforeEach(setup);

  it('Should not include cuttle.app in production builds', () => {
    cy.window().its('cuttle.app').should('be.null');
  });

  it('Should not include Vue Devtools in production builds', () => {
    cy.get('@consoleLog').should('not.be.calledWith', 'Connecting devtools');
  });
});
