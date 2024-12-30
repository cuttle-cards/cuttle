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
      Game.publish([ gameId ], {
        gameId,
        change: 'spectatorLeft',
        username: user.username,
      });
    }

    Game.unsubscribe(req, [ gameId ]);

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
