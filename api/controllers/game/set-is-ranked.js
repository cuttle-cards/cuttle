module.exports = async function (req, res) {
  try {
    const { isRanked } = req.body;

    const game = await gameService.findGame({ gameId: req.session.game });
  
    const gameUpdates = { isRanked };

    await Game.updateOne({ id: game.id }).set(gameUpdates);
    
    sails.sockets.blast('setIsRanked', { gameId: game.id, isRanked: isRanked });
    
    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};

