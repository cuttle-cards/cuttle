const getPlayerPnumByUsername = (players, username) => {
  const pNum = players.findIndex(({ username: pUsername }) => pUsername === username);
  return pNum > -1 ? pNum : null;
};

const pNumIsValid = (pNum) => [0, 1].includes(pNum);

module.exports = {
  getPlayerPnumByUsername,
  pNumIsValid,
};
