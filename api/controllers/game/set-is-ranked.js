module.exports = async function (req, res) {
  try {
    const { isRanked } = req.body;

    const game = await Game.findOne({ id: req.params.gameId });

    // Must be in this game
    const playerIds = [ game.p0, game.p1 ].filter((val) => !!val);
    if (!playerIds.includes(req.session.usr)) {
      return res.forbidden({ message: 'You are not a player in this game!' });
    }
  
    const gameUpdates = { isRanked };

    await Game.updateOne({ id: game.id }).set(gameUpdates);

    sails.sockets.blast('setIsRanked', { gameId: game.id, isRanked: isRanked });
    
    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};

