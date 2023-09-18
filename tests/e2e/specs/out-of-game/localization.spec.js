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
    langaugeMenu('es', es);
  });

  it('Checking Translation For French', () => {
    langaugeMenu('fr', fr);
  });
});

function langaugeMenu(name, data) {
  // Open the menu
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="language-menu"]').click();

  //Selects the language 
  cy.get('[data-lang="' + name + '"]').click();

  // checks elements in navbar has changed language
  cy.get('[data-cy="' + data.global.play + '"]').should('contain', data.global.play);
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-nav="' + data.global.logout + '"]').should('contain', data.global.logout);
}
