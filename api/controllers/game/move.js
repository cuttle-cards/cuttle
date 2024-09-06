// Request to make a move
module.exports = async function (req, res) {
  let game;
  try {
    const { saveGamestate, publishGameState, unpackGamestate } = sails.helpers.gamestate;
    const { execute, validate } = sails.helpers.gamestate.moves[req.body.moveType];
    game = await sails.helpers.lockGame(req.params.gameId);
    //Check player exist, and is in game
    let playedBy;
    switch (req.session.usr) {
      case game.p0.id:
        playedBy = 0;
        break;
      case game.p1.id:
        playedBy = 1;
        break;
      default:
        throw new Error('You are not a player in this game!');
    }
    const gameState = unpackGamestate(game.gameStates.at(-1));
    validate(req.body, gameState, playedBy);
    const updatedState = execute(gameState, req.body, playedBy);
    const gameStateRow = await saveGamestate(updatedState);
    game.gameStates.push(gameStateRow);
    await publishGameState(game, updatedState);
    await sails.helpers.unlockGame(game.lock);

    return res.ok();
  } catch (err) {
    if (game?.lock) {
      await sails.helpers.unlockGame(game.lock);
    }
    return res.badRequest({ message: err.message });
  }
};
