import { myUser } from '../../fixtures/userFixtures';
import es from '../../../../src/translations/es.json';
import fr from '../../../../src/translations/fr.json';
import en from '../../../../src/translations/en.json';

describe('Localization', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.wipeDatabase();
    cy.visit('/');
    cy.signupPlayer(myUser);
    cy.vueRoute('/');
  });

  const checkAndChangeLanguage = (name, lang) => {
    // Open the user menu
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="language-menu"]').click();

    // Select the language
    cy.get(`[data-lang="${name}"]`).click();

    // Check the translation
    checkTranslation(lang);
  };

  const checkTranslation = (lang) => {
    // Check elements in the navbar for language translation
    cy.get('[data-cy="Play"]').should('contain', lang.global.play);

    // Log out and check the login page translation
    cy.get('[data-nav="Log Out"]').click();
    cy.reload();
    cy.contains('h1', lang.login.title);
    cy.get('[data-cy="submit"]').should('contain', lang.global.login);
    cy.loginPlayer(myUser);
    cy.reload();

    // Check elements in the navbar again
    cy.get('[data-cy="Play"]').should('contain', lang.global.play);
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-nav="Log Out"]').should('contain', lang.global.logout);
  };

  it('Should check translation for English (default)', () => {
    checkAndChangeLanguage('en', en);
  });

  it('Should check translation for Spanish', () => {
    checkAndChangeLanguage('es', es);
  });

  it('Should check translation for French', () => {
    checkAndChangeLanguage('fr', fr);
  });
});
