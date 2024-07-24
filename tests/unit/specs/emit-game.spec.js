import { describe, expect, it } from 'vitest';
import { resolveThreeData, resolveThreeSocket } from '../fixtures/gameSocketEvent';

describe('Emiting socket events', () => {
  it('Correctly emits resolve-three', async () => {
    const socketEvent = await sails.helpers.gamestate.emitGameState(
      resolveThreeData.game,
      resolveThreeData.gameState,
    );
    expect(socketEvent).toEqual(resolveThreeSocket);
  });
});
