module.exports = async function (req, res) {
  try {
    const { isRanked } = req.body;

    const game = await gameService.findGame({ gameId: req.session.game });
  
    const gameUpdates = { isRanked };

    Game.publish([game.id], {
      change:'setIsRanked',
      userId: req.session.usr,
      pNum: req.session.pNum,
      gameId: game.id,
      isRanked: isRanked,
    });
    await Game.updateOne({ id: game.id }).set(gameUpdates);

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};

