import { beforeEach, describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import GameStatus from '../../../../utils/GameStatus.json';

dayjs.extend(utc);

async function createPlayers() {
  const player1 = await User.create({ username: 'player1', encryptedPassword: 'xyz123ABCABK7KAL' }).fetch();
  const player2 = await User.create({ username: 'player2', encryptedPassword: 'xyz123ABCABK7KAL' }).fetch();
  return [ player1, player2 ];
}

/**
 * Creates a chain of casual games linked by rematchGame, oldest first.
 * Seats swap between games, mirroring api/controllers/game/rematch.js
 */
async function createRematchChain(player1, player2, statuses) {
  const games = [];
  for (const [ index, status ] of statuses.entries()) {
    const seatsAreSwapped = index % 2 === 1;
    const game = await Game.create({
      name: `Casual game ${index + 1}`,
      status,
      p0: seatsAreSwapped ? player2.id : player1.id,
      p1: seatsAreSwapped ? player1.id : player2.id,
    }).fetch();
    games.push(game);
  }

  // Link each game to its successor
  for (let i = 0; i < games.length - 1; i++) {
    await Game.updateOne({ id: games[i].id }).set({ rematchGame: games[i + 1].id });
    games[i].rematchGame = games[i + 1].id;
  }

  return games;
}

describe('getMatchGames helper', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  describe('Ranked games', () => {
    it('Returns every game in the match, including games played after the specified one', async () => {
      const [ player1, player2 ] = await createPlayers();
      const match = await Match.create({
        player1: player1.id,
        player2: player2.id,
        startTime: dayjs.utc().toDate(),
      }).fetch();

      const games = [];
      for (let i = 0; i < 3; i++) {
        const game = await Game.create({
          name: `Ranked game ${i + 1}`,
          status: GameStatus.FINISHED,
          isRanked: true,
          match: match.id,
          p0: player1.id,
          p1: player2.id,
          winner: player1.id,
        }).fetch();
        games.push(game);
      }

      // Ask about the FIRST game -- addGameToMatch would truncate to just that one
      const [ firstGame ] = games;
      const matchGames = await sails.helpers.getMatchGames(firstGame);

      expect(matchGames.map(({ id }) => id)).toEqual(games.map(({ id }) => id));
    });

    it('Resolves through the rematch chain when the game has no match yet', async () => {
      const [ player1, player2 ] = await createPlayers();
      const games = await createRematchChain(player1, player2, [
        GameStatus.FINISHED,
        GameStatus.STARTED,
      ]);

      const matchGames = await sails.helpers.getMatchGames(games[0]);

      expect(matchGames.map(({ id }) => id)).toEqual(games.map(({ id }) => id));
    });
  });

  describe('Casual games', () => {
    it('Returns the whole rematch chain when given the middle game', async () => {
      const [ player1, player2 ] = await createPlayers();
      const games = await createRematchChain(player1, player2, [
        GameStatus.FINISHED,
        GameStatus.FINISHED,
        GameStatus.FINISHED,
      ]);

      const [ , middleGame ] = games;
      const matchGames = await sails.helpers.getMatchGames(middleGame);

      expect(matchGames.map(({ id }) => id)).toEqual(games.map(({ id }) => id));
    });

    it('Reports the seats each game was played in, which swap between games', async () => {
      const [ player1, player2 ] = await createPlayers();
      const games = await createRematchChain(player1, player2, [
        GameStatus.FINISHED,
        GameStatus.FINISHED,
      ]);

      const matchGames = await sails.helpers.getMatchGames(games[0]);

      expect(matchGames[0].p0).toBe(player1.id);
      expect(matchGames[0].p1).toBe(player2.id);
      expect(matchGames[1].p0).toBe(player2.id);
      expect(matchGames[1].p1).toBe(player1.id);
    });

    it('Excludes a rematch game that was created but never started', async () => {
      const [ player1, player2 ] = await createPlayers();
      const games = await createRematchChain(player1, player2, [
        GameStatus.FINISHED,
        GameStatus.CREATED,
      ]);

      const matchGames = await sails.helpers.getMatchGames(games[0]);

      expect(matchGames.map(({ id }) => id)).toEqual([ games[0].id ]);
    });

    it('Terminates when rematchGame points back into the chain', async () => {
      const [ player1, player2 ] = await createPlayers();
      const games = await createRematchChain(player1, player2, [
        GameStatus.FINISHED,
        GameStatus.FINISHED,
      ]);

      // Close the loop: the second game points back at the first
      await Game.updateOne({ id: games[1].id }).set({ rematchGame: games[0].id });

      const matchGames = await sails.helpers.getMatchGames(games[0]);

      expect(matchGames.map(({ id }) => id)).toEqual(games.map(({ id }) => id));
    });

    it('Returns a single game when it was never rematched', async () => {
      const [ player1, player2 ] = await createPlayers();
      const [ game ] = await createRematchChain(player1, player2, [ GameStatus.FINISHED ]);

      const matchGames = await sails.helpers.getMatchGames(game);

      expect(matchGames.map(({ id }) => id)).toEqual([ game.id ]);
    });
  });
});
