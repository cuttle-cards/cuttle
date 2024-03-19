describe('Hash Router Redirects', () => {
  it('Redirects from hash URL to non-hash URL', () => {
    // Visit a URL with a hash
    cy.visit('/#/rules');

    // Check that the final location is the expected path without the hash
    cy.location('pathname').should('eq', '/rules');
  });
});
