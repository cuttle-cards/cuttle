const gameStateRowMap = {
  cards : {
    // Clubs
    ACE_OF_CLUBS: {  rank: 1, suit: 0 , id : 'AC'},
    TWO_OF_CLUBS: {  rank: 2, suit: 0 , id : '2C'},
    THREE_OF_CLUBS: {  rank: 3, suit: 0 , id : '3C'},
    FOUR_OF_CLUBS: {  rank: 4, suit: 0 , id : '4C'},
    FIVE_OF_CLUBS: {  rank: 5, suit: 0 , id : '5C'},
    SIX_OF_CLUBS: {  rank: 6, suit: 0 , id : '6C'},
    SEVEN_OF_CLUBS: {  rank: 7, suit: 0 , id : '7C'},
    EIGHT_OF_CLUBS: {  rank: 8, suit: 0 , id : '8C'},
    NINE_OF_CLUBS: {  rank: 9, suit: 0 , id : '9C'},
    TEN_OF_CLUBS: {  rank: 10, suit: 0 , id : 'TC'},
    JACK_OF_CLUBS: {  rank: 11, suit: 0 , id : 'JC'},
    QUEEN_OF_CLUBS: {  rank: 12, suit: 0 , id : 'QC'},
    KING_OF_CLUBS: {  rank: 13, suit: 0 , id : 'KC'},
    // Diamonds
    ACE_OF_DIAMONDS: {  rank: 1, suit: 1 , id : 'AD'},
    TWO_OF_DIAMONDS: {  rank: 2, suit: 1 , id : '2D'},
    THREE_OF_DIAMONDS: {  rank: 3, suit: 1 , id : '3D'},
    FOUR_OF_DIAMONDS: {  rank: 4, suit: 1 , id : '4D'},
    FIVE_OF_DIAMONDS: {  rank: 5, suit: 1 , id : '5D'},
    SIX_OF_DIAMONDS: {  rank: 6, suit: 1 , id : '6D'},
    SEVEN_OF_DIAMONDS: {  rank: 7, suit: 1 , id : '7D'},
    EIGHT_OF_DIAMONDS: {  rank: 8, suit: 1 , id : '8D'},
    NINE_OF_DIAMONDS: {  rank: 9, suit: 1 , id : '9D'},
    TEN_OF_DIAMONDS: {  rank: 10, suit: 1 , id : 'TD'},
    JACK_OF_DIAMONDS: {  rank: 11, suit: 1 , id : 'JD'},
    QUEEN_OF_DIAMONDS: {  rank: 12, suit: 1 , id : 'QD'},
    KING_OF_DIAMONDS: {  rank: 13, suit: 1 , id : 'KD'},
    // Hearts
    ACE_OF_HEARTS: {  rank: 1, suit: 2 , id : 'AH'},
    TWO_OF_HEARTS: {  rank: 2, suit: 2 , id : '2H'},
    THREE_OF_HEARTS: {  rank: 3, suit: 2 , id : '3H'},
    FOUR_OF_HEARTS: {  rank: 4, suit: 2 , id : '4H'},
    FIVE_OF_HEARTS: {  rank: 5, suit: 2 , id : '5H'},
    SIX_OF_HEARTS: {  rank: 6, suit: 2 , id : '6H'},
    SEVEN_OF_HEARTS: {  rank: 7, suit: 2 , id : '7H'},
    EIGHT_OF_HEARTS: {  rank: 8, suit: 2 , id : '8H'},
    NINE_OF_HEARTS: {  rank: 9, suit: 2 , id : '9H'},
    TEN_OF_HEARTS: {  rank: 10, suit: 2 , id : 'TH'},
    JACK_OF_HEARTS: {  rank: 11, suit: 2 , id : 'JH'},
    QUEEN_OF_HEARTS: {  rank: 12, suit: 2 , id : 'QH'},
    KING_OF_HEARTS: {  rank: 13, suit: 2 , id : 'KH'},
    // Spades
    ACE_OF_SPADES: {  rank: 1, suit: 3 , id : 'AS'},
    TWO_OF_SPADES: {  rank: 2, suit: 3 , id : '2S'},
    THREE_OF_SPADES: {  rank: 3, suit: 3 , id : '3S'},
    FOUR_OF_SPADES: {  rank: 4, suit: 3 , id : '4S'},
    FIVE_OF_SPADES: {  rank: 5, suit: 3 , id : '5S'},
    SIX_OF_SPADES: {  rank: 6, suit: 3 , id : '6S'},
    SEVEN_OF_SPADES: {  rank: 7, suit: 3 , id : '7S'},
    EIGHT_OF_SPADES: {  rank: 8, suit: 3 , id : '8S'},
    NINE_OF_SPADES: {  rank: 9, suit: 3 , id : '9S'},
    TEN_OF_SPADES: {  rank: 10, suit: 3 , id : 'TS'},
    JACK_OF_SPADES: {  rank: 11, suit: 3 , id : 'JS' },
    QUEEN_OF_SPADES: {  rank: 12, suit: 3 , id : 'QS'},
    KING_OF_SPADES: {  rank: 13, suit: 3 , id : 'KS'},
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
