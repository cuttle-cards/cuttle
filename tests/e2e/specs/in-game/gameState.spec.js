import { forEach } from 'lodash';
import { gameStateRowMap } from '../../fixtures/gameStateRowMap';
const g = gameStateRowMap;

describe('Test gamestate to gamestateRow and vice versa', () => {

  it('Convert cards to gamestateRow then gamestate', () => {

    cy.testConvertionGamestateRow(
        true ,  // use g.cards.ACE_OF_SPADES format
        { 
            p0Hand: [g.cards.ACE_OF_SPADES, g.cards.ACE_OF_CLUBS],
            p0Points: [g.cards.TEN_OF_SPADES],                             
            p0FaceCards:[g.cards.KING_OF_SPADES],
            p1Hand: [g.cards.ACE_OF_HEARTS, g.cards.ACE_OF_DIAMONDS],
            p1Points: [g.cards.TEN_OF_HEARTS], 
            p1FaceCards: [g.cards.KING_OF_HEARTS],
            deck : [g.cards.ACE_OF_SPADES, g.cards.ACE_OF_CLUB, g.cards.KING_OF_HEARTS],
            scrap : [g.cards.ACE_OF_SPADES, g.cards.ACE_OF_CLUB, g.cards.KING_OF_HEARTS],
            twos : [g.cards.ACE_OF_HEARTS, g.cards.ACE_OF_DIAMONDS],
            playedCard : g.cards.TEN_OF_CLUBS,
            oneOff : g.cards.NINE_OF_HEARTS,
            oneOffTarget : g.cards.SEVEN_OF_SPADES,
            resolving : g.cards.SIX_OF_HEARTS,
            gameId : 1,
            playedBy : 1,
            moveType : 3,
            turn : 3,
            phase : 2,
          }
      );
  });
  it('Convert cards from gamestateRow to a gamestate', () => {
      cy.testConvertionGamestateRow(
        false, // use gamestateRow format
        { 
          p0Hand: [],
          p0Points: ['3D', '4S(JS-p0)', 'TH(JH-p0,JC-p1,JD-p0)'],                             
          p0FaceCards:[],
          p1Hand: [],
          p1Points: [],
          p1FaceCards: [],
          deck : [],
          scrap : [],
          twos : [],
          playedCard : null,
          oneOff : null,
          oneOffTarget : null,
          resolving : null,
          gameId : 1,
          playedBy : 1,
          moveType : 3,
          turn : 3,
          phase : 2,
        }
      );
    });
  });