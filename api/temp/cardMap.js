//Suit: ‘C’ (Clubs), ‘D’ (Diamonds), ‘H’ (Hearts), ‘S’ (Spades)  
const suitMap = {
  'C': 0,
  'D': 1,
  'H': 2,
  'S': 3
};

//Rank: ‘A’ (Ace), ‘2’, ‘3’, ‘4’, ‘5’, ‘6’, ‘7’, ‘8’, ‘9’, ‘T’ (Ten), ‘J’ (Jack), ‘Q’ (Queen), ‘K’ (King)
const rankMap = {
  'A': 1,
  'T': 10,
  'J': 11,
  'Q': 12,
  'K': 13
};

const cardMap = { suitMap : suitMap, rankMap : rankMap};

module.exports = cardMap;