module.exports = {
  /*
   **Find Card by id
   *****options = {cardId: integer}
   */
  findCard: function (options) {
    return new Promise(function (resolve, reject) {
      if (options.hasOwnProperty('cardId') && typeof options.cardId === 'number') {
        Card.findOne(options.cardId)
          .populate('attachments')
          .exec(function (err, card) {
            if (err) {
              return reject(err);
            } else if (!card) {
              return reject({ message: "Can't find card " + options.cardId });
            }
            return resolve(card);
          });
      } else {
        return Promise.reject({ message: 'Invalid arguments for findCard' });
      }
    });
  },

  /*
   **Create Card from suit, rank, and gameId
   *****options = {suit: integer, rank: integer, gameId: integer}
   */
  createCard: function (options) {
    return new Promise(function (resolve, reject) {
      const validArgs =
        options.suit >= 0 &&
        options.suit <= 3 &&
        options.rank >= 1 &&
        options.rank <= 13 &&
        options.gameId;
      if (!validArgs) {
        return reject({ message: 'Invalid Arguments for createCard service' });
      }

      const { gameId, suit, rank } = options;
      // Stringify Rank
      const str_rank =
        {
          1: 'Ace',
          11: 'Jack',
          12: 'Queen',
          13: 'King',
        }[rank] ?? rank;
      /*
      So, a slight aside: || would work above instead of the nullish coalescing
      operator (??) since the options that the first operation (the {...}[rank]
      bit) could return are not falsey (i.e. not an empty string).  But, in
      principle, we're coalescing nulls instead of falsey things.

      If you're not familiar, ?? is like ||, but it picks the second
      argument iff the first argument is null or undefined

      1    || 'a' -> 1
      null || 'a' -> 'a'
      0    || 'a' -> 'a'

      1    ?? 'a' -> 1
      null ?? 'a' -> 'a'
      0    ?? 'a' -> 0
       */

      // Stringify Suit
      const str_suit = ['♣️', '♦️', '♥️', '♠️'][suit];

      const str_name = str_rank + str_suit;

      const ruleText = [
        null,
        'Scrap all points',
        'Scrap target Royal or Glasses eight',
        'Choose 1 card in the Scrap and put it to your hand',
        'Your opponent discards two cards of their choice from their hand',
        'Draw two cards from the deck',
        'Scrap all Royals and Glasses eights',
        'Play one of the top two cards of the deck and put the other back (both are revealed)',
        'Your opponent plays with an open hand (their cards are revealed to you)',
        "Return target card to its controller's hand. They can't play it next turn",
        'No effect',
        'Play on top of target point card to steal it',
        'Your other cards may only be targeted by scuttles',
        'Reduces the points you need to win. (1K: 14pts, 2K: 10pts, 3K: 7pts, 4K: 5pts)',
      ][rank];

      // Create card record
      return Card.create({
        suit: suit,
        rank: rank,
        name: str_name,
        ruleText: ruleText,
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
          return reject({ message: `Error creating card: ${str_name}` });
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
        }); //End find()
    }); //End returned Promise
  },

  /*
   **Saves a card and returns it as a Promise
   ****options = {card: CardRecord}
   */
  saveCard: function (options) {
    return new Promise(function (resolve, reject) {
      if (!options.card) {
        return reject({ message: "Can't save card without card record" });
      }
      options.card.save(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve(options.card);
      });
    });
  },
};
