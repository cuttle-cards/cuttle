const GameStatus = require('../../../../utils/GameStatus');

module.exports = async function (req, res) {
  const playerId = req.session.usr;
  const player = await User.findOne(playerId);
  const botPlayer = await sails.helpers.gameStates.ai.findOrCreateBotUser();
  const { previousGameId } = req.body;
  if (!player) {
    return res.forbidden('You must be logged in to play vs AI');
  }
  
  let pNum = 0;
  if (previousGameId) {
    const previousGame = await Game.findOne({ id: previousGameId });
    switch (playerId) {
      case previousGame.p0:
        pNum = 1;
        break;
      case previousGame.p1:
        pNum = 0;
        break;
      default:
        return res.forbidden('You were not in the game');
    }
  }

  const botPNum = (pNum + 1) % 2;

  const gameData = {
    name: `${player.username} vs AI`,
    isVsAi: true,
    status: GameStatus.STARTED,
    isRanked: false,
    p0Ready: true,
    p1Ready: true,
  };

  gameData[`p${pNum}`] = playerId;
  gameData[`p${botPNum}`] = botPlayer.id;
  gameData[`p${botPNum}Rematch`] = true;

  const newGame = await Game.create(gameData).fetch();

  const gameId = newGame.id;

  const roomName = `game_${gameId}_p${pNum}`;
  sails.sockets.join(req, roomName);

  if (previousGameId) {
    await Game.updateOne({ id: previousGameId }).set({ rematchGame: gameId });
  }

  await sails.helpers.gameStates.dealCards({
    ...newGame,
    gameStates: []
  });

  return res.ok(gameId);
};
