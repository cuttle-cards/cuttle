const MoveType = require('../../../utils/MoveType.json');
const GamePhase = require('../../../utils/GamePhase.json');
const DeckIds = require('../../../utils/DeckIds.json');

module.exports = async function (req, res) {
  try {
    const game = await Game.findOne({ id: req.session.game })
      .populate('gameStates')
      .populate('p0')
      .populate('p1');

    const { publishGameState, saveGamestate, convertStrToCard } = sails.helpers.gamestate;

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

    const allFixtureCards = Object.values(req.body).flat();

    //Populate deck with all cards except the cards in the fixture
    const populatedDeck =
      deck ??
      _.shuffle(
        DeckIds.filter((id) => !allFixtureCards.some((card) => card?.id === id)).map((id) =>
          convertStrToCard(id),
        ),
      );

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
      scrap: scrap,
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
    game.gameStates.push(gameStateRow);
    await publishGameState(game, gameState);

    return res.ok(gameState);
  } catch (err) {
    return res.badRequest(err);
  }
};
