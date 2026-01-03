import { describe, it, expect, beforeEach } from 'vitest';
import { mainPhase } from '../../fixtures/gameStates/ai/mainPhase';
import MoveType from '../../../../utils/MoveType';


describe('getMoveBodiesForMoveType()', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  const { getMoveBodiesForMoveType } = sails.helpers.gameStates.ai;

  it('Creates valid move bodies for POINTS', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.POINTS);
    expect(moveBodies).to.deep.eq(mainPhase.pointsMoveBodies);
  });

  it('Creates valid move bodies for FACE_CARD', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.FACE_CARD);
    expect(moveBodies).to.deep.eq(mainPhase.faceCardMoveBodies);
  });
});
