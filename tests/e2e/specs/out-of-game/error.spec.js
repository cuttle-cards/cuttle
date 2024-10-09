describe('Not Found Page', () => {
  beforeEach(() => {
    cy.visit('/asdf'); // non-existent route
  });

  it('Logo and title link to the homepage', () => {
    // Check that the parent of the logo links to the homepage
    cy.get('#not-found-logo').parent()
      .should('have.attr', 'href', '/');

    // Check that the parent of the title links to the homepage
    cy.get('h1').parent()
      .should('have.attr', 'href', '/');
  });
});
