// Run via command `npm run e2e:server:playground`

const attempts = 400;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  describe(`Untargeted One-Offs (${attempt}/${attempts})`, () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('playground noop', () => {
      cy.get('[data-playground]').should('have.length', 0);
    });
  });
}
