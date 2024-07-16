import { Card } from '../fixtures/Card';
const fixture = {
  gameState: {
        p0: {
              hand : [Card.ACE_OF_SPADES],
              points : [Card.TEN_OF_SPADES,
                        { ...Card.EIGHT_OF_DIAMONDS,
                             attachments: [Card.JACK_OF_CLUBS, Card.JACK_OF_SPADES]}],
              faceCards : [Card.KING_OF_SPADES],
        },
        p1: {
          hand : [Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS],
          points : [Card.TEN_OF_HEARTS, { ... Card.ACE_OF_CLUBS, attachments: [Card.JACK_OF_CLUBS]}],
          faceCards : [],
        },
        deck : [Card.ACE_OF_SPADES, Card.ACE_OF_CLUBS, Card.KING_OF_HEARTS],
        scrap : [],
        twos : [],
        discardedCards : [],
        oneOff : null,
        oneOffTarget : null,
        resolving : null,
        playedCard : Card.TEN_OF_CLUBS,
        gameId : 1,
        playedBy : 1,
        moveType : 3,
        turn : 3,
        phase : 2,
        targetCard : null
  },
  gameStateRow: {
    p0Hand : ['AS'],
    p0Points : ['TS', '8D(JC-p1,JS-p0)'],
    p0FaceCards : ['KS'],
    p1Hand : ['AH', 'AD'],
    p1Points : ['TH', 'AC(JC-p1)'],
    p1FaceCards : [],
    deck : ['AS', 'AC', 'KH'],
    scrap : [],
    twos : [],
    discardedCards : [],
    playedCard : 'TC',
    oneOff : null,
    oneOffTarget : null,
    resolving : null,
    gameId : 1,
    playedBy : 1,
    moveType : 3,
    turn : 3,
    phase : 2,
    targetCard : null
  }
};
export { fixture };