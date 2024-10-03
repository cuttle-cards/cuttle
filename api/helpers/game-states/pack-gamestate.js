module.exports = {
  friendlyName: 'pack GameState',

  description:
    'Transforms a GameState into a GameStateRow. Converts the object representations of cards to the strings, and separates the p0 and p1 Player objects into the p0Hand, p0Points, and p0FaceCards attributes (doing the same for p1).',

  inputs: {
    gameState: {
      type: 'ref',
      description: 'gameState to be converted to a row',
      required: true,
    },
  },
  sync: true,

  fn: ({ gameState }, exits) => {
    try {
      const convertedData = {};

      const attributesToConvert = [
        'deck',
        'scrap',
        'playedCard',
        'targetCard',
        'oneOff',
        'oneOffTarget',
        'twos',
        'resolved',
        'discardedCards',
      ];

      attributesToConvert.forEach((attribute) => {
        const value = gameState[attribute];
        if (value) {
          const { convertCardToStr } = sails.helpers.gameStates;
          convertedData[attribute] = Array.isArray(value)
            ? value.map((card) => convertCardToStr(card))
            : convertCardToStr(value);
        } else {
          convertedData[attribute] = null; // Handle null or undefined attributes
        }
      });

      // Correspondance of attribute name in GameStateRow to attribute name in GameState + player
      const playerAttToConvert = [
        { rowName: 'p0Hand', gamestateName: 'hand', player: 'p0' },
        { rowName: 'p1Hand', gamestateName: 'hand', player: 'p1' },
        { rowName: 'p0Points', gamestateName: 'points', player: 'p0' },
        { rowName: 'p1Points', gamestateName: 'points', player: 'p1' },
        { rowName: 'p0FaceCards', gamestateName: 'faceCards', player: 'p0' },
        { rowName: 'p1FaceCards', gamestateName: 'faceCards', player: 'p1' },
      ];

      playerAttToConvert.forEach((attribute) => {
        // ex GameState format for p0Hand: gamestate.p0.hand
        const value = gameState[attribute.player][attribute.gamestateName];

        if (value) {
          // For the points attribute, the cards owner is needed to convert attachement induced by Jacks
          // => 8D(JH-p0,JC-p1,JD-p0)
          if (attribute.gamestateName === 'points') {
            convertedData[attribute.rowName] = value.map((card) =>
              sails.helpers.gameStates.convertCardToStr(card, attribute.player),
            );
          } else {
            convertedData[attribute.rowName] = value.map((card) =>
              sails.helpers.gameStates.convertCardToStr(card),
            );
          }
        } else {
          convertedData[attribute.rowName] = [];
        }
      });

      const combinedData = { ...gameState, ...convertedData };

      return exits.success(combinedData);
    } catch (err) {
      return exits.error(err.message);
    }
  },
};
