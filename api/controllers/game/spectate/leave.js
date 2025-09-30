module.exports = async function (req, res) {
  const { usr: spectator } = req.session;
  let { gameId } = req.params;
  gameId = Number(gameId);

  try {
    const [ user ] = await Promise.all([
      User.findOne({ id: spectator }),

      UserSpectatingGame.update({ gameSpectated: gameId, spectator }).set({
        activelySpectating: false,
      }),
    ]);

    if (user) {
      const payload = {
        gameId,
        change: 'spectatorLeft',
        username: user.username,
      };
      sails.sockets.broadcast(`game_${gameId}_p0`, 'game', payload);
      sails.sockets.broadcast(`game_${gameId}_p1`, 'game', payload);
      sails.sockets.broadcast(`game_${gameId}_spectator`, 'game', payload);
    }

    Game.unsubscribe(req, [ gameId ]);

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
