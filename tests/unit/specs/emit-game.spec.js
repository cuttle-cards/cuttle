import { describe, expect, it } from 'vitest';

describe('Emiting socket events', () => {
  it('should correctly emit resolve-three', async () => {
    const socketEvent = await sails.helpers.game.emitGameState({ game: null });
    expect(socketEvent.toEqual({ game: null }));
  });
});
