import { testConvertionGamestate, testConvertionGamestateRow} from '../util/commands';
import { Cards } from '../fixtures/Cards';
import { describe, it } from 'vitest';

const test = { 
  gameState: {
        p0: { 
              hand : [Cards.ACE_OF_SPADES],
              points : [Cards.TEN_OF_SPADES, 
                          { ... Cards.EIGHT_OF_DIAMONDS, 
                            attachments: [Cards.JACK_OF_SPADES, Cards.JACK_OF_DIAMONDS,Cards.JACK_OF_HEARTS,]}], 
              faceCards : [Cards.KING_OF_SPADES],
        },
        p1: { 
          hand : [Cards.ACE_OF_HEARTS, Cards.ACE_OF_DIAMONDS],
          points : [Cards.TEN_OF_HEARTS, { ... Cards.ACE_OF_CLUBS, attachments: [Cards.JACK_OF_CLUBS]}],
          faceCards : [],
        },
        deck : [Cards.ACE_OF_SPADES, Cards.ACE_OF_CLUBS, Cards.KING_OF_HEARTS],
        scrap : [],
        twos : [],
        playedCard : Cards.TEN_OF_CLUBS,
        oneOff : null,
        oneOffTarget : null,
        resolving : null,
        gameId : 1,
        playedBy : 1,
        moveType : 3,
        turn : 3,
        phase : 2,
    },
    gameStateRow: {
      p0Hand : ['AS'],
      p0Points : ['TS', '8D(JS-p0,JD-p1,JH-p0)'],
      p0FaceCards : ['KS'],
      p1Hand : ['AH', 'AD'],
      p1Points : ['TH', 'AC(JC-p1)'], //{ … Cards.ACE_OF_CLUBS, attachments: [Cards.JACK_OF_CLUBS]},], 
      p1FaceCards : [],
      deck : ['AS', 'AC', 'KH'],
      scrap : [],
      twos : [],
      playedCard : 'TC',
      oneOff : null,
      oneOffTarget : null,
      resolving : null,
      gameId : 1,
      playedBy : 1,
      moveType : 3,
      turn : 3,
      phase : 2,
    }
  };
describe('Test gamestate to gamestateRow and vice versa', () => {

  it('Convert cards from gamestate to GameStateRow', () => {
    testConvertionGamestateRow(test);
  });
  it('Convert cards from gamestateRow to GameState', () => {
    testConvertionGamestate(test);
  });
});
