module.exports = function (req) {
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
};
