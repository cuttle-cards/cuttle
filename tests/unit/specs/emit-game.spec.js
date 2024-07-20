import { describe, expect, it } from 'vitest';
import { resolveThreeGame } from '../fixtures/gameData';
import { resolveThree } from '../fixtures/gameSocketEvent';

describe('Emiting socket events', () => {
  it('should correctly emit resolve-three', async () => {
    const socketEvent = await sails.helpers.game.emitGameState(
      resolveThreeGame.game,
      resolveThreeGame.gameState,
    );
    expect(socketEvent).toEqual(resolveThree.game);
  });
});
