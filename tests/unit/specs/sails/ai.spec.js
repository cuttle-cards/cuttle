import { describe, it, expect, beforeEach } from 'vitest';
import { pointsForAiMoves } from '../../fixtures/gameStates/ai/points';
import MoveType from '../../../../utils/MoveType';


describe('getMoveBodiesForMoveType()', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Creates valid move bodies for POINTS', () => {
    const moveBodies = sails.helpers.gameStates.ai
      .getMoveBodiesForMoveType(pointsForAiMoves.gameState, 0, MoveType.POINTS);

    expect(moveBodies).to.deep.eq(pointsForAiMoves.moveBodies);
  });
});
