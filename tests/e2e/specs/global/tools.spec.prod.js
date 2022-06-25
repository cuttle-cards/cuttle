function setup() {
  cy.wipeDatabase();
  cy.visit('/');
}

describe('Vue Devtools', () => {
  beforeEach(setup);

  it('Should not include Vue Devtools in production builds', () => {
    cy.get('[data-cy-vue-devtools]').should('have.length', 0);
  });
});
