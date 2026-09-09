const TargetType = require('../../../utils/TargetType.json');

module.exports = {
  friendlyName: 'Validate nine targets',

  description:
    'Checks whether a nine one-off requests a legal pair of targets. Returns null when the request is legal, ' +
    'or the error message (usually an i18n key) explaining why it is not. Shared by the one-off and ' +
    'seven-one-off validators so the rules for nines only live in one place.',

  inputs: {
    /**
     * @param { Object } requestedMove - the move being requested
     * @param { String } requestedMove.targetId - first target's card id
     * @param { 'point' | 'faceCard' | 'jack' } requestedMove.targetType - where the first target lives
     * @param { String } requestedMove.targetIdTwo - second target's card id
     * @param { 'point' | 'faceCard' | 'jack' } requestedMove.targetTypeTwo - where the second target lives
     */
    requestedMove: {
      type: 'ref',
      description: 'Object containing data needed for the current move',
      required: true,
    },
    /**
     * @param { Player } opponent - the player whose board holds both targets
     */
    opponent: {
      type: 'ref',
      description: 'Player object whose board should contain both targets',
      required: true,
    },
  },
  sync: true,
  fn: ({ requestedMove, opponent }, exits) => {
    const { targetId, targetType, targetIdTwo, targetTypeTwo } = requestedMove;

    // A queen protects every other card its controller has, leaving itself the only legal
    // target. A nine needs two, so any queen at all blocks the one-off outright.
    if (opponent.faceCards.some(({ rank }) => rank === 12)) {
      return exits.success('game.snackbar.oneOffs.nine.blockedByAnyQueen');
    }

    // Only the top jack of each stack can be targeted, so each point card offers at most one
    const targetableJackCount = opponent.points.filter(({ attachments }) => attachments.length).length;
    const legalTargetCount = opponent.points.length + opponent.faceCards.length + targetableJackCount;
    if (legalTargetCount < 2) {
      return exits.success('game.snackbar.oneOffs.nine.needTwoTargets');
    }

    const targetTypes = Object.values(TargetType);
    if (!targetId || !targetIdTwo || !targetTypes.includes(targetType) || !targetTypes.includes(targetTypeTwo)) {
      return exits.success('game.snackbar.oneOffs.nine.mustSelectTwoTargets');
    }

    if (targetId === targetIdTwo) {
      return exits.success('game.snackbar.oneOffs.nine.duplicateTarget');
    }

    const { findTargetCard } = sails.helpers.gameStates;
    for (const [ id, type ] of [ [ targetId, targetType ], [ targetIdTwo, targetTypeTwo ] ]) {
      if (!findTargetCard(id, type, opponent)) {
        return exits.success(`Can't find the ${id} on opponent's board`);
      }

      // Jacks buried under another jack aren't targetable; only the top of the stack is
      if (type === TargetType.jack && !sails.helpers.gameStates.isTopJack(id, opponent)) {
        return exits.success('game.snackbar.oneOffs.onlyTopJack');
      }
    }

    return exits.success(null);
  },
};
