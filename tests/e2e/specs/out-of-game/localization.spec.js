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
    // Check elements in the navbar for language translation
    cy.get('[data-cy="Play"]').should('contain', lang.global.play);
  };

  const checkLoginTranslation = (lang) => {
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

  const checkLobbyTranslation = (lang) => {
    cy.createGamePlayer({ gameName: 'Test Game', isRanked: false }).then((gameSummary) => {
      cy.window()
        .its('cuttle.gameStore')
        .then((store) => store.requestSubscribe(gameSummary.gameId));
      cy.vueRoute(`/lobby/${gameSummary.gameId}`);
      cy.wrap(gameSummary).as('gameSummary');
    });
    cy.get('[data-cy="opponent-indicator"]').should('contain', lang.lobby.invite);
    cy.get('[data-cy="ready-button"]').should('contain', lang.lobby.ready);
    cy.get('[data-cy="ready-button"]').click();
    cy.get('[data-cy=my-indicator]').find('[data-cy="lobby-ready-card"]').should('exist');
    cy.get('[data-cy="ready-button"]').should('contain', lang.lobby.unready);
    cy.get('[data-cy="exit-button"]').should('contain', lang.lobby.exit);
    cy.get('h1').should('contain', lang.lobby.lobbyFor);
  };

  it('Should check translation for English (default)', () => {
    checkAndChangeLanguage('en', en);
    checkLoginTranslation(en);
    checkLobbyTranslation(en);
  });

  it('Should check translation for Spanish', () => {
    checkAndChangeLanguage('es', es);
    checkLoginTranslation(es);
    checkLobbyTranslation(es);
  });

  it('Should check translation for French', () => {
    checkAndChangeLanguage('fr', fr);
    checkLoginTranslation(fr);
    checkLobbyTranslation(fr);
  });
});

describe('language files', () => {
  function extractKeys(obj, keyList = []) {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        extractKeys(obj[key], keyList);
      } else {
        keyList.push(key);
      }
    }
    return keyList;
  }

  let enKeys = extractKeys(en).sort();
  let frKeys = extractKeys(fr).sort();
  let esKeys = extractKeys(es).sort();

  it('French should have the same keys', () => {
    for(let i = 0; i < enKeys.length; i++) {
      expect(enKeys[i]).to.eql(frKeys[i]);
    }
  });

  it('French should have no empty strings', () => {
    frKeys.forEach((key) => {
      expect(fr[key]).to.not.eql('');
    });
  }); 

  it('Spanish should have the same keys', () => {
    for(let i = 0; i < enKeys.length; i++) {
      expect(enKeys[i]).to.eql(esKeys[i]);
    }
  });

  it('Spanish should have no empty strings', () => {
    frKeys.forEach((key) => {
      expect(es[key]).to.not.eql('');
    });
  });
});