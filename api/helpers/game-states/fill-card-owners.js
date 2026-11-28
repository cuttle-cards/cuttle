/**
 * Fill in the owner of a card in a player's hand, points or face cards
 *
 * @param { Card } card - card in the column, possibly carrying attachments
 * @param { Number } pNum - the player whose column holds the card
 * @param { Number } playerCount - number of players in the game
 */
function fillOwnersInColumn(card, pNum, playerCount) {
  const { attachments } = card;

  // Unstacked: the owner is the column
  if (!attachments.length) {
    card.owner ??= pNum;
    return;
  }

  // New format: the base records its owner, and the top stealer is the controller (the column)
  if (card.owner !== null && card.owner !== undefined) {
    const topStealer = attachments.at(-1);
    topStealer.owner ??= pNum;
    if (topStealer.owner !== pNum) {
      throw new Error(`${topStealer.id} is the top of ${card.id}'s stack in p${pNum}'s column, but is owned by p${topStealer.owner}`);
    }
    return;
  }

  // Legacy (or a hand-built state): ownership alternates down the stack from the column.
  // Parity can only express a flip between two players
  if (playerCount !== 2) {
    throw new Error(`Cannot reconstruct the owners of ${card.id}'s stack in a ${playerCount}-player game`);
  }
  const stackSize = attachments.length;
  attachments.forEach((stealer, index) => {
    stealer.owner ??= (pNum + stackSize - 1 - index) % 2;
  });
  card.owner = (pNum + stackSize) % 2;
}

module.exports = {
  friendlyName: 'Fill card owners',

  description: 'Returns a copy of the GameState with the owner of every card in a hand, on the field, and in the twos filled in from its position',

  extendedDescription:
    'Owners the column cannot recover (stacked cards and twos) are kept as given. ' +
    'Missing ones are reconstructed by two-player parity, which is exact for legacy rows since every legacy row is two-player. ' +
    'Cards in the deck, the scrap and the snapshot slots (targetCard, oneOffTarget, etc) are left as they are. ' +
    'Shared by unpack-gamestate and save-gamestate, so hand-built states are filled in the same way as stored ones.',

  inputs: {
    gameState: {
      type: 'ref',
      description: 'GameState whose card owners should be filled in',
      required: true,
    },
    playerCount: {
      type: 'number',
      description: 'Number of players in the game',
      defaultsTo: 2,
    },
  },
  sync: true,

  fn: ({ gameState, playerCount }, exits) => {
    try {
      const result = _.cloneDeep(gameState);

      for (let pNum = 0; pNum < playerCount; pNum++) {
        const player = result[`p${pNum}`];
        if (!player) {
          continue;
        }
        [ 'hand', 'points', 'faceCards' ].forEach((column) => {
          (player[column] ?? []).forEach((card) => fillOwnersInColumn(card, pNum, playerCount));
        });
      }

      // Legacy twos carry no owners: counters alternate starting with the caster's opponent
      (result.twos ?? []).forEach((two, index) => {
        if (two.owner !== null && two.owner !== undefined) {
          return;
        }
        if (playerCount !== 2) {
          throw new Error(`Cannot reconstruct the owner of ${two.id} in the twos in a ${playerCount}-player game`);
        }
        const casterPNum = result.turn % 2;
        two.owner = (casterPNum + index + 1) % 2;
      });

      return exits.success(result);
    } catch (err) {
      return exits.error(err.message);
    }
  },
};
