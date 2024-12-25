const MoveType = require('../../../utils/MoveType.json');
const GamePhase = require('../../../utils/GamePhase.json');
const DeckIds = require('../../../utils/DeckIds.json');

module.exports = async function (req, res) {
  try {
    const game = await Game.findOne({ id: req.params.gameId })
      .populate('gameStates')
      .populate('p0')
      .populate('p1');

    const { createSocketEvent, saveGamestate, convertStrToCard } = sails.helpers.gameStates;

    const {
      p0Hand,
      p0Points,
      p0FaceCards,
      p1Hand,
      p1Points,
      p1FaceCards,
      topCard = null,
      secondCard = null,
      scrap = [],
      deck,
    } = req.body;

    const allFixtureCards = new Set(Object.values(req.body).flat()
      .map(({ id }) => id));

    const unusedCards = _.shuffle(
      DeckIds.filter((id) => !allFixtureCards.has(id)).map((id) =>
        convertStrToCard(id),
      )
    );

    const populatedDeck = deck ?? unusedCards ;
    const populatedScrap = deck ? [ ...scrap , ...unusedCards ] : scrap;

    if (secondCard) {
      populatedDeck.unshift(secondCard);
    }
    if (topCard) {
      populatedDeck.unshift(topCard);
    }

    const gameState = {
      p0: {
        hand: p0Hand,
        points: p0Points,
        faceCards: p0FaceCards,
      },
      p1: {
        hand: p1Hand,
        points: p1Points,
        faceCards: p1FaceCards,
      },
      deck: populatedDeck,
      scrap: populatedScrap,
      twos: [],
      discardedCards: [],
      oneOff: null,
      oneOffTarget: null,
      resolved: null,
      playedCard: null,
      gameId: game.id,
      playedBy: 0,
      moveType: MoveType.LOADFIXTURE,
      turn: 0,
      phase: GamePhase.MAIN,
      targetCard: null,
    };

    const gameStateRow = await saveGamestate(gameState);
    // add newest GameStateRow to game in memory instead of re-querying
    game.gameStates.push(gameStateRow);
    const socketEvent = await createSocketEvent(game, gameState);
    Game.publish([ game.id ], socketEvent);

    return res.ok(gameState);
  } catch (err) {
    return res.badRequest(err);
  }
};
