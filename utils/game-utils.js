const getCardName = (card) => {
  const str_rank =
    {
      1: 'A',
      11: 'J',
      12: 'Q',
      13: 'K',
    }[card.rank] ?? card.rank;
  const str_suit = [ '♣️', '♦️', '♥️', '♠️' ][card.suit];
  return str_rank + str_suit;
};

module.exports = {
  getCardName
};
