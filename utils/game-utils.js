const getLobbyDataByGame = (game) => {
  if (!game) {
    return null;
  }

  const { id, name, p0Ready, p1Ready } = game;
  const players = game.players.reduce(
    (acc, player, index) => [
      ...acc,
      {
        username: game.players[index].username,
        pNum: index,
      },
    ],
    []
  );

  return {
    id,
    name,
    players,
    p0Ready,
    p1Ready,
  };
};

module.exports = {
  getLobbyDataByGame,
};
