import { myUser } from '../../fixtures/userFixtures';
import es from '../../../../src/translations/es.json';
import fr from '../../../../src/translations/fr.json';

function setup() {
  cy.viewport(1920, 1080);
  cy.wipeDatabase();
  cy.visit('/');
  cy.signupPlayer(myUser);
  cy.vueRoute('/');
}

describe('Localization ', () => {
  beforeEach(setup);

  it('Checking Translation For Spanish', () => {
    checkTranslation ('es', es);
  });

  it('Checking Translation For French', () => {
    checkTranslation ('fr', fr);
  });
});

function checkTranslation(name, lang) {
  // Open the menu
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="language-menu"]').click();

  //Selects the language 
  cy.get(`[data-lang="${name}"]`).click();

  // checks elements in navbar has changed language
  cy.get('[data-cy="Play"]').should('contain', lang.global.play);
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-nav="Log Out"]').should('contain', lang.global.logout);
}
