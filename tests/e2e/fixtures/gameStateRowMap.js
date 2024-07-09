const gameStateRowMap = {
  cards : {
    // Clubs
    ACE_OF_CLUBS: { objectRep : { rank: 1, suit: 0 }, Id : 'AC'},
    TWO_OF_CLUBS: { objectRep : { rank: 2, suit: 0 }, Id : '2C'},
    THREE_OF_CLUBS: { objectRep : { rank: 3, suit: 0 }, Id : '3C'},
    FOUR_OF_CLUBS: { objectRep : { rank: 4, suit: 0 }, Id : '4C'},
    FIVE_OF_CLUBS: { objectRep : { rank: 5, suit: 0 }, Id : '5C'},
    SIX_OF_CLUBS: { objectRep : { rank: 6, suit: 0 }, Id : '6C'},
    SEVEN_OF_CLUBS: { objectRep : { rank: 7, suit: 0 }, Id : '7C'},
    EIGHT_OF_CLUBS: { objectRep : { rank: 8, suit: 0 }, Id : '8C'},
    NINE_OF_CLUBS: { objectRep : { rank: 9, suit: 0 }, Id : '9C'},
    TEN_OF_CLUBS: { objectRep : { rank: 10, suit: 0 }, Id : 'TC'},
    JACK_OF_CLUBS: { objectRep : { rank: 11, suit: 0 }, Id : 'JC'},
    QUEEN_OF_CLUBS: { objectRep : { rank: 12, suit: 0 }, Id : 'QC'},
    KING_OF_CLUBS: { objectRep : { rank: 13, suit: 0 }, Id : 'KC'},
    // Diamonds
    ACE_OF_DIAMONDS: { objectRep : { rank: 1, suit: 1 }, Id : 'AD'},
    TWO_OF_DIAMONDS: { objectRep : { rank: 2, suit: 1 }, Id : '2D'},
    THREE_OF_DIAMONDS: { objectRep : { rank: 3, suit: 1 }, Id : '3D'},
    FOUR_OF_DIAMONDS: { objectRep : { rank: 4, suit: 1 }, Id : '4D'},
    FIVE_OF_DIAMONDS: { objectRep : { rank: 5, suit: 1 }, Id : '5D'},
    SIX_OF_DIAMONDS: { objectRep : { rank: 6, suit: 1 }, Id : '6D'},
    SEVEN_OF_DIAMONDS: { objectRep : { rank: 7, suit: 1 }, Id : '7D'},
    EIGHT_OF_DIAMONDS: { objectRep : { rank: 8, suit: 1 }, Id : '8D'},
    NINE_OF_DIAMONDS: { objectRep : { rank: 9, suit: 1 }, Id : '9D'},
    TEN_OF_DIAMONDS: { objectRep : { rank: 10, suit: 1 }, Id : 'TD'},
    JACK_OF_DIAMONDS: { objectRep : { rank: 11, suit: 1 }, Id : 'JD'},
    QUEEN_OF_DIAMONDS: { objectRep : { rank: 12, suit: 1 }, Id : 'QD'},
    KING_OF_DIAMONDS: { objectRep : { rank: 13, suit: 1 }, Id : 'KD'},
    // Hearts
    ACE_OF_HEARTS: { objectRep : { rank: 1, suit: 2 }, Id : 'AH'},
    TWO_OF_HEARTS: { objectRep : { rank: 2, suit: 2 }, Id : '2H'},
    THREE_OF_HEARTS: { objectRep : { rank: 3, suit: 2 }, Id : '3H'},
    FOUR_OF_HEARTS: { objectRep : { rank: 4, suit: 2 }, Id : '4H'},
    FIVE_OF_HEARTS: { objectRep : { rank: 5, suit: 2 }, Id : '5H'},
    SIX_OF_HEARTS: { objectRep : { rank: 6, suit: 2 }, Id : '6H'},
    SEVEN_OF_HEARTS: { objectRep : { rank: 7, suit: 2 }, Id : '7H'},
    EIGHT_OF_HEARTS: { objectRep : { rank: 8, suit: 2 }, Id : '8H'},
    NINE_OF_HEARTS: { objectRep : { rank: 9, suit: 2 }, Id : '9H'},
    TEN_OF_HEARTS: { objectRep : { rank: 10, suit: 2 }, Id : 'TH'},
    JACK_OF_HEARTS: { objectRep : { rank: 11, suit: 2 }, Id : 'JH'},
    QUEEN_OF_HEARTS: { objectRep : { rank: 12, suit: 2 }, Id : 'QH'},
    KING_OF_HEARTS: { objectRep : { rank: 13, suit: 2 }, Id : 'KH'},
    // Spades
    ACE_OF_SPADES: { objectRep : { rank: 1, suit: 3 }, Id : 'AS'},
    TWO_OF_SPADES: { objectRep : { rank: 2, suit: 3 }, Id : '2S'},
    THREE_OF_SPADES: { objectRep : { rank: 3, suit: 3 }, Id : '3S'},
    FOUR_OF_SPADES: { objectRep : { rank: 4, suit: 3 }, Id : '4S'},
    FIVE_OF_SPADES: { objectRep : { rank: 5, suit: 3 }, Id : '5S'},
    SIX_OF_SPADES: { objectRep : { rank: 6, suit: 3 }, Id : '6S'},
    SEVEN_OF_SPADES: { objectRep : { rank: 7, suit: 3 }, Id : '7S'},
    EIGHT_OF_SPADES: { objectRep : { rank: 8, suit: 3 }, Id : '8S'},
    NINE_OF_SPADES: { objectRep : { rank: 9, suit: 3 }, Id : '9S'},
    TEN_OF_SPADES: { objectRep : { rank: 10, suit: 3 }, Id : 'TS'},
    JACK_OF_SPADES: { objectRep : { rank: 11, suit: 3 }, Id : 'JS' },
    QUEEN_OF_SPADES: { objectRep : { rank: 12, suit: 3 }, Id : 'QS'},
    KING_OF_SPADES: { objectRep : { rank: 13, suit: 3 }, Id : 'KS'},
  },

  //
  pathMap : { 
    p0Hand : {rowPath : 'p0Hand', player : 'p0', att : 'hand'},
    p0Points : {rowPath : 'p0Points', player : 'p0', att : 'points'},
    p0FaceCards : {rowPath : 'p0FaceCards', player : 'p0', att : 'faceCards'},
    p1Hand : {rowPath : 'p1Hand', player : 'p1', att : 'hand'},
    p1Points : {rowPath : 'p1Points', player : 'p1', att : 'points'},
    p1FaceCards :{rowPath : 'p1FaceCards', player : 'p1', att : 'faceCards'}
  }
};

export { gameStateRowMap };
