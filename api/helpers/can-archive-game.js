const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const GameStatus = require('../../utils/GameStatus.json');
const { RECENT_ACTIVITY_MINUTES } = require('../../utils/gameActivity.json');

module.exports = {
  friendlyName: 'Can Archive Game',

  description: 'Determines whether a player is permitted to archive the specified game',

  extendedDescription: `
    Shared by findCurrentGamesForUser (which uses it to disable the Archive button) and the
    game/archive action (which uses it to 403), so the two can never disagree.

    A game is archivable when it is dormant and is not a ranked game belonging to the currently
    running week of the active season — those still have a bearing on this week's match.

    Dormancy is measured off Game.updatedAt, which is a reliable proxy for real activity because
    lockGame/unlockGame write the Game row around every move. It uses the same threshold as
    findSpectatableGames deliberately: a game becomes archivable precisely when it drops off the
    spectate list, so a game can never be pulled out from under an opponent who is still playing.
  `,

  sync: true,

  inputs: {
    game: {
      type: 'ref',
      description: 'The game record to test',
      required: true,
    },
    currentWeek: {
      type: 'ref',
      description:
        'The running season plus its current week\'s start and end times, from sails.helpers.getCurrentSeasonWeek() — used to block archiving a ranked game created in that week. Undefined when no season is running. Passed in so callers mapping many games resolve it once.',
    },
  },

  fn: ({ game, currentWeek }, exits) => {
    // Only in-progress games can be archived; lobbies are left for leave-lobby
    if (game.status !== GameStatus.STARTED) {
      return exits.success(false);
    }

    // Never archive a game someone may still be playing
    const dormantThreshold = dayjs.utc().subtract(RECENT_ACTIVITY_MINUTES, 'minute');
    if (dayjs.utc(game.updatedAt).isAfter(dormantThreshold)) {
      return exits.success(false);
    }

    if (!game.isRanked || !currentWeek) {
      return exits.success(true);
    }

    const createdAt = dayjs.utc(game.createdAt);
    const createdThisWeek =
      !createdAt.isBefore(dayjs.utc(currentWeek.weekStartTime)) &&
      !createdAt.isAfter(dayjs.utc(currentWeek.weekEndTime));

    return exits.success(!createdThisWeek);
  },
};
