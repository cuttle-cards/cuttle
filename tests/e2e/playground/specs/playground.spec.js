// Run via a command like `npm run e2e:server:playground`

import { setupGameAsP0 } from '../../support/helpers';

const attempts = 400;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  describe(`Untargeted One-Offs (${attempt}/${attempts})`, () => {
    beforeEach(() => {
      setupGameAsP0();
    });

    it.only('playground noop', () => {
      cy.get('[data-playground]').should('have.length', 0);
    });
  });
}
