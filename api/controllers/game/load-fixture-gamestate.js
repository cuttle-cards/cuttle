const MoveType = require('../../../utils/MoveType.json');
const GamePhase = require('../../../utils/GamePhase.json');
const DeckIds = require('../../../utils/DeckIds.json');

module.exports = async function (req, res) {
  try {
    const game = await Game.findOne({ id: req.session.game }).populate('gameStates');
    const { addCardId, publishGameState, saveGamestate, convertStrToCard } = sails.helpers.gamestate;
    const p0Hand = req.body.p0Hand?.map((card) => addCardId(card)) ?? [];
    const p0Points = req.body.p0Points?.map((card) => addCardId(card)) ?? [];
    const p0FaceCards = req.body.p0FaceCards?.map((card) => addCardId(card)) ?? [];
    const p1Hand = req.body.p1Hand?.map((card) => addCardId(card)) ?? [];
    const p1Points = req.body.p1Points?.map((card) => addCardId(card)) ?? [];
    const p1FaceCards = req.body.p1FaceCards?.map((card) => addCardId(card)) ?? [];
    const topCard = req.body.topCard ? addCardId(req.body.topCard) : null;
    const secondCard = req.body.secondCard ? addCardId(req.body.topCard) : null;
    const scrap = req.body.scrapCards?.map((card) => addCardId(card)) ?? [];

    const allFixtureCards = [
      p0Hand,
      p0FaceCards,
      p0Points,
      p1Hand,
      p1FaceCards,
      p1Points,
      topCard,
      secondCard,
      scrap,
    ].flat();

    //Populate deck with all cards except the cards in the fixture
    const populatedDeck = req.body.deck
      ? req.body.deck.map((card) => addCardId(card))
      : _.shuffle(
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
