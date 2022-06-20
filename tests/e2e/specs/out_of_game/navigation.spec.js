describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it.only('Expands and collapses navbar on desktop and always collapses on mobile', () => {
    // Desktop display
    cy.viewport(1920, 1080);
    cy.get('[data-cy=nav-drawer]')
      .should('be.visible')
      .should('contain', 'Login')
      .should('contain', 'Rules')
      .should('not.have.class', 'v-navigation-drawer--mini-variant')
      // Collapse nav
      .find('[data-cy=collapse-nav]')
      .click();
    // Nav drawer should be collapsed
    cy.get('[data-cy=nav-drawer]')
      .should('have.class', 'v-navigation-drawer--mini-variant')
      // Expand nav
      .find('[data-cy=expand-nav]')
      .click();
    // Should be expanded again
    cy.get('[data-cy=nav-drawer]')
      .should('be.visible')
      .should('contain', 'Login')
      .should('contain', 'Rules')
      .should('not.have.class', 'v-navigation-drawer--mini-variant');

    // Mobile display
    cy.viewport('iphone-8');
    cy.get('[data-cy=nav-drawer]')
      .should('be.visible')
      .should('have.class', 'v-navigation-drawer--mini-variant')
      // Collapse and expand buttons not displayed on mobile
      .find('[data-cy=expand-nav]')
      .should('not.exist');
    cy.get('[data-cy=collapse-nav]').should('not.exist');
  });

  it('Navigates to Login and Rules pages when unauthenticated', () => {});

  it('Navigates to Rules, Home, and Stats pages when authenticated', () => {});

  it('Hides nav drawer on Lobby Page', () => {
    expect(true).to.eq(false);
  });
});
