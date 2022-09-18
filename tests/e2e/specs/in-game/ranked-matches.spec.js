import { setupGameAsP0 } from '../../support/helpers';

describe('Creating And Updating Ranked Matches', () => {
  it.only('Creates a match when two players play a ranked game for the first time this week', () => {
    // Signs up and creates new ranked game
    setupGameAsP0(false, true);
    // There should be no matches initially
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(0);
    });

    cy.concedeOpponent();
    cy.get('[data-cy=gameover-go-home]').click();
    cy.url().should('not.include', '/game');

    // There should now be one match for the two players
    cy.request('http://localhost:1337/match').then((res) => {
      expect(res.body.length).to.eq(1);
    });
  });

  it('Adds games to the existing match for this week between players and sets winner appropriately', () => {});
  it('Sets game back to unranked and does not update match if the relevant match is already completed', () => {});
  it('Creates a new match if the week changes before the match concludes', () => {});
  it('Does not create or update matches for unranked games', () => {});
});
