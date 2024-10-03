module.exports = {
  /*
   **Find Card by id
   *****options = {cardId: integer}
   */
  findCard: function (options) {
    return new Promise(function (resolve, reject) {
      if (Object.hasOwnProperty.call(options, 'cardId') && typeof options.cardId === 'number') {
        return Card.findOne(options.cardId)
          .populate('attachments')
          .exec(function (err, card) {
            if (err) {
              return reject(err);
            } else if (!card) {
              return reject({ message: "Can't find card " + options.cardId });
            }
            return resolve(card);
          });
      }
      return Promise.reject({ message: 'Invalid arguments for findCard' });
    });
  },

  /*
   **Create Card from suit, rank, and gameId
   *****options = {suit: integer, rank: integer, gameId: integer}
   */
  createCard: function (options) {
    return new Promise(function (resolve, reject) {
      const validArgs =
        options.suit >= 0 && options.suit <= 3 && options.rank >= 1 && options.rank <= 13 && options.gameId;
      if (!validArgs) {
        return reject({ message: 'Invalid Arguments for createCard service' });
      }

      const { gameId, suit, rank } = options;
      // Create card record
      return Card.create({
        suit: suit,
        rank: rank,
        deck: gameId,
      })
        .fetch()
        .then((card) => {
          return resolve(card);
        })
        .catch((err) => {
          if (err) {
            return reject(err);
          }
          return reject({ message: `Error creating card` });
        });
    });
  },

  /*
   **Find all points in player's hand from player id
   *****options = {userId: integer}
   */
  findPoints: function (options) {
    return new Promise(function (resolve, reject) {
      if (!options.userId) {
        return reject({ message: "Don't have userId to find cards in user's points" });
      }
      Card.find({ points: options.userId })
        .populate('attachments', { sort: 'index' })
        .then(function (cards) {
          if (!cards) {
            return reject({ message: "Can't find cards in points" });
          }
          return resolve(cards);
        })
        .catch((err) => {
          return reject(err);
        }); // End find()
    }); // End returned Promise
  },
};
