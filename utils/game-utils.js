/**
 * @returns int <= 0 if card1 is lower rank or same rank & lower suit
 * @param {rank: number, suit: number} card1
 * @param {rank: number, suit: number} card2
 */
function compareByRankThenSuit(card1, card2) {
  // Compare by suit (clubs->diamonds->hearts->spades)
  // Then compare by rank (1,2...12,13)
  return card1.suit - card2.suit || card1.rank - card2.rank;
}

const getPlayerPnumByUsername = (players, username) => {
  if (!Array.isArray(players)) {
    return null;
  }
  const pNum = players.findIndex(({ username: pUsername }) => pUsername === username);
  return pNum > -1 ? pNum : null;
};

const pNumIsValid = (pNum) => [0, 1].includes(pNum);

module.exports = {
  compareByRankThenSuit,
  getPlayerPnumByUsername,
  pNumIsValid,
};
