import { describe, it, expect, beforeEach } from 'vitest';
import { mainPhase } from '../../fixtures/gameStates/ai/mainPhase';
import MoveType from '../../../../utils/MoveType';


describe('getMoveBodiesForMoveType()', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Creates valid move bodies for POINTS', () => {
    const moveBodies = sails.helpers.gameStates.ai
      .getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.POINTS);

    expect(moveBodies).to.deep.eq(mainPhase.pointsMoveBodies);
  });
});
