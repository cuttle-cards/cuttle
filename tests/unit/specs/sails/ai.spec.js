import { describe, it, expect, beforeEach } from 'vitest';
import { mainPhase } from '../../fixtures/gameStates/ai/mainPhase';
import MoveType from '../../../../utils/MoveType';

let getMoveBodiesForMoveType;
describe('getMoveBodiesForMoveType()', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
    ({ getMoveBodiesForMoveType } = sails.helpers.gameStates.ai);
  });

  it('Creates valid move bodies for PASS', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.PASS);
    expect(moveBodies).to.deep.eq(mainPhase.passMoveBodies);
  });

  it('Creates valid move bodies for DRAW', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.DRAW);
    expect(moveBodies).to.deep.eq(mainPhase.drawMoveBodies);
  });

  it('Creates valid move bodies for POINTS', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.POINTS);
    expect(moveBodies).to.deep.eq(mainPhase.pointsMoveBodies);
  });

  it('Creates valid move bodies for FACE_CARD', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.FACE_CARD);
    expect(moveBodies).to.deep.eq(mainPhase.faceCardMoveBodies);
  });

  it('Creates valid move bodies for SCUTTLE', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.SCUTTLE);
    expect(moveBodies).to.deep.eq(mainPhase.scuttleMoveBodies);
  });

  it('Creates valid move bodies for JACK', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.JACK);
    expect(moveBodies).to.deep.eq(mainPhase.jackMoveBodies);
  });

  it('Creates valid move bodies for ONE_OFF', () => {
    const moveBodies = getMoveBodiesForMoveType(mainPhase.gameState, 0, MoveType.ONE_OFF);
    expect(moveBodies).to.deep.eq(mainPhase.oneOffMoveBodies);
  });

});
