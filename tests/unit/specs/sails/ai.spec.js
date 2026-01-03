import { describe, it, expect, beforeEach } from 'vitest';
import { points } from '../../fixtures/gameStates/points';
import MoveType from '../../../../utils/MoveType';


describe('getMoveBodiesForMoveType()', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Creates valid move bodies for POINTS', () => {
    const moveBodies = sails.helpers.gameStates.ai.getMoveBodiesForMoveType(points.gameState, 0, MoveType.POINTS);
    expect(moveBodies.length).to.eq(1);
    expect(moveBodies).to.deep.eq([ { moveType: MoveType.POINTS, playedBy: 0, cardId: 'AS' } ]);
  });
});
