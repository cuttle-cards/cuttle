module.exports = function (req, res) {
  // Capture request data
  const p0HandCardIds = req.body.p0HandCardIds || [];
  const p0PointCardIds = req.body.p0PointCardIds || [];
  const p0FaceCardIds = req.body.p0FaceCardIds || [];
  const p1HandCardIds = req.body.p1HandCardIds || [];
  const p1PointCardIds = req.body.p1PointCardIds || [];
  const p1FaceCardIds = req.body.p1FaceCardIds || [];
  const scrapCardIds = req.body.scrapCardIds || [];
  const topCardId = req.body.topCardId || null;
  const secondCardId = req.body.secondCardId || null;
  // Aggregate list of all cards being requested
  const allRequestedCards = [
    ...p0HandCardIds,
    ...p0PointCardIds,
    ...p0FaceCardIds,
    ...p1HandCardIds,
    ...p1PointCardIds,
    ...p1FaceCardIds,
    ...scrapCardIds,
  ];
  if (topCardId) {
    allRequestedCards.push(topCardId);
  }
  if (secondCardId) {
    allRequestedCards.push(secondCardId);
  }

  // Find records
  const findGame = Game.findOne({ id: req.session.game }).populate('deck');
  const findP0 = User.findOne({ id: req.body.p0Id }).populateAll();
  const findP1 = User.findOne({ id: req.body.p1Id }).populateAll();

  return Promise.all([ findGame, findP0, findP1 ])
    .then(function resetGame(values) {
      // Put all cards back in deck
      const [ game, p0, p1 ] = values;

      const oldP0Hand = p0.hand.map((card) => card.id);
      const oldP0Points = p0.points.map((card) => card.id);
      const oldP0FaceCards = p0.faceCards.map((card) => card.id);
      const oldP1Hand = p1.hand.map((card) => card.id);
      const oldP1Points = p1.points.map((card) => card.id);
      const oldP1FaceCards = p1.faceCards.map((card) => card.id);
      const addToDeck = [
        game.topCard,
        game.secondCard,
        ...oldP0Hand,
        ...oldP0Points,
        ...oldP0FaceCards,
        ...oldP1Hand,
        ...oldP1Points,
        ...oldP1FaceCards,
      ];
      const updatePromises = [
        Game.addToCollection(game.id, 'deck').members(addToDeck),
        User.replaceCollection(p0.id, 'hand').members([]),
        User.replaceCollection(p0.id, 'points').members([]),
        User.replaceCollection(p0.id, 'faceCards').members([]),
        User.replaceCollection(p1.id, 'hand').members([]),
        User.replaceCollection(p1.id, 'points').members([]),
        User.replaceCollection(p1.id, 'faceCards').members([]),
      ];

      return Promise.all([ game, p0, p1, ...updatePromises ]);
    })
    .then(function placeCards(values) {
      // Load game according to fixture
      const [ game, p0, p1 ] = values;
      let topCard = null;
      let secondCard = null;
      // Take top card from fixture if specified
      if (topCardId) {
        topCard = topCardId;
      }
      // Otherwise select it randomly from remaining cards
      else {
        topCard = _.sample(game.deck).id;
        while (allRequestedCards.includes(topCard)) {
          topCard = _.sample(game.deck).id;
        }
        allRequestedCards.push(topCard);
      }
      // Take second card from fixture if specified
      if (secondCardId) {
        secondCard = secondCardId;
      }
      // Otherwise select it randomly from remaining cards
      else {
        secondCard = _.sample(game.deck).id;
        while (allRequestedCards.includes(secondCard)) {
          secondCard = _.sample(game.deck).id;
        }
        allRequestedCards.push(secondCard);
      }

      const gameUpdates = {
        topCard,
        secondCard,
      };
      const updatePromises = [
        Game.updateOne(game.id).set(gameUpdates),
        User.replaceCollection(p0.id, 'hand').members(p0HandCardIds),
        User.replaceCollection(p0.id, 'points').members(p0PointCardIds),
        User.replaceCollection(p0.id, 'faceCards').members(p0FaceCardIds),
        User.replaceCollection(p1.id, 'hand').members(p1HandCardIds),
        User.replaceCollection(p1.id, 'points').members(p1PointCardIds),
        User.replaceCollection(p1.id, 'faceCards').members(p1FaceCardIds),
        Game.replaceCollection(game.id, 'scrap').members(scrapCardIds),
        Game.removeFromCollection(game.id, 'deck').members(allRequestedCards),
      ];

      return Promise.all([ game, ...updatePromises ]);
    })
    .then(async function pushUnusedCardsToScrap(values) {
      const [ game ] = values; 
      // Get all Cards in deck, and move the unwanted ones to scrap
      const updatedGame = await Game.findOne({ id:game.id }).populate('deck');
      const { deck } = req.body;
      if (deck) {
        const cardsToScrap = updatedGame.deck.filter(card => !deck.some((id) => id === card.id))
          .map((card) => card.id);
        await Game.addToCollection(game.id, 'scrap').members(cardsToScrap);
        await Game.replaceCollection(game.id, 'deck').members(deck);

      }
      return updatedGame;
    })
    .then(function populateGame(game) {
      return gameService.populateGame({ gameId: game.id });
    })
    .then(function publishAndRespond(game) {
      // Announce update through socket
      Game.publish([ game.id ], {
        change: 'loadFixture',
        game,
      });
      // Respond 200 OK
      return res.ok(game);
    })
    .catch(function handleError(err) {
      return res.badRequest(err);
    });
};
