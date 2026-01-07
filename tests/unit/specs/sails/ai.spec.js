import { describe, it, expect, beforeEach } from 'vitest';
import { orderBy } from 'lodash';
import { mainPhase } from '../../fixtures/gameStates/ai/mainPhase';
import { resolvingSevenPhase1 } from '../../fixtures/gameStates/ai/resolvingSevenPhase1';
import { resolvingSevenPhase2 } from '../../fixtures/gameStates/ai/resolvingSevenPhase2';
import { resolvingSevenPhase3 } from '../../fixtures/gameStates/ai/resolvingSevenPhase3DoubleJack';
import MoveType from '../../../../utils/MoveType';

let getMoveBodiesForMoveType;

describe('getMoveBodiesForMoveType()', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
    ({ getMoveBodiesForMoveType } = sails.helpers.gameStates.ai);
  });

  describe('Main Phase move bodies', () => {


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
  }); // End main phase getMoveBodiesForMoveType()

  describe('resolvingSeven move bodies', () => {
    it('Creates valid move bodies for SEVEN_POINTS', () => {
      const moveBodies = getMoveBodiesForMoveType(resolvingSevenPhase1.gameState, 0, MoveType.SEVEN_POINTS);
      expect(moveBodies).to.deep.eq(resolvingSevenPhase1.sevenPointsMoveBodies);
    });

    it('Creates valid move bodies for SEVEN_SCUTTLE', () => {
      const moveBodies = getMoveBodiesForMoveType(resolvingSevenPhase1.gameState, 0, MoveType.SEVEN_SCUTTLE);
      expect(moveBodies).to.deep.eq(resolvingSevenPhase1.sevenScuttleMoveBodies);
    });

    it('Skips SEVEN_FACE_CARD move bodies when there are no face cards in top two cards', () => {
      const moveBodies = getMoveBodiesForMoveType(resolvingSevenPhase1.gameState, 0, MoveType.SEVEN_FACE_CARD);
      expect(moveBodies).to.deep.eq(resolvingSevenPhase1.sevenFaceCardMoveBodies);
    });

    it('Creates valid move bodies for SEVEN_JACK', () => {
      const moveBodies = getMoveBodiesForMoveType(resolvingSevenPhase1.gameState, 0, MoveType.SEVEN_JACK);
      expect(moveBodies).to.deep.eq(resolvingSevenPhase1.sevenJackMoveBodies);
    });

    it('Creates valid move bodies for SEVEN_DISCARD', () => {
      const moveBodies = getMoveBodiesForMoveType(resolvingSevenPhase1.gameState, 0, MoveType.SEVEN_DISCARD);
      expect(moveBodies).to.deep.eq(resolvingSevenPhase1.sevenDiscardMoveBodies);
    });

    it('Creates valid move bodies for targeted SEVEN_ONE_OFF', () => {
      const moveBodies = getMoveBodiesForMoveType(resolvingSevenPhase1.gameState, 0, MoveType.SEVEN_ONE_OFF);
      expect(moveBodies).to.deep.eq(resolvingSevenPhase1.sevenOneOffMoveBodies);
    });

    it('Creates valid move bodies for untargeted SEVEN_ONE_OFF', () => {
      const moveBodies = getMoveBodiesForMoveType(resolvingSevenPhase2.gameState, 0, MoveType.SEVEN_ONE_OFF);
      expect(moveBodies).to.deep.eq(resolvingSevenPhase2.sevenOneOffMoveBodies);
    });

    it('Creates valid move bodies for SEVEN_DISCARD', () => {
      const moveBodies = getMoveBodiesForMoveType(resolvingSevenPhase3.gameState, 0, MoveType.SEVEN_DISCARD);
      expect(moveBodies).to.deep.eq(resolvingSevenPhase3.sevenDiscardMoveBodies);
    });
  });
});

describe('getLegalMoves()', () => {
  let getLegalMoves;
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
    ({ getLegalMoves } = sails.helpers.gameStates.ai);
  });

  it('Gets legal moves for main phase', () => {
    const legalMoves = orderBy(
      getLegalMoves(mainPhase.gameState, 0, [ mainPhase.gameState ]), [ 'moveType', 'cardId', 'targetId' ]
    );

    const expectedLegalMoves = orderBy(mainPhase.validMoveBodies.map((moveBody) => {
      const { execute } = sails.helpers.gameStates.moves[moveBody.moveType];
      return execute(mainPhase.gameState, moveBody, 0, [ mainPhase.gameState ]);
    }), [ 'moveType', 'cardId', 'targetId' ]);

    expect(legalMoves).to.deep.eq(expectedLegalMoves);
  });

  it('Gets legal moves for RESOLVING_SEVEN phase with two and jack on top', () => {
    const legalMoves = orderBy(
      getLegalMoves(resolvingSevenPhase1.gameState, 0, [ resolvingSevenPhase1.gameState ]), [ 'moveType', 'cardId', 'targetId' ]
    );

    const expectedLegalMoves = orderBy(resolvingSevenPhase1.validMoveBodies.map((moveBody) => {
      const { execute } = sails.helpers.gameStates.moves[moveBody.moveType];
      return execute(resolvingSevenPhase1.gameState, moveBody, 0, [ resolvingSevenPhase1.gameState ]);
    }), [ 'moveType', 'cardId', 'targetId' ]);

    expect(legalMoves).to.deep.eq(expectedLegalMoves);
  });
});
