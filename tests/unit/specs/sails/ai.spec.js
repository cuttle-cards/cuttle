import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { orderBy } from 'lodash';
import { mainPhase } from '../../fixtures/gameStates/ai/mainPhase';
import { mainPhase2MinimaxPenalties } from '../../fixtures/gameStates/ai/minimax/mainPhase2MinimaxPenalties';
import { resolvingSevenPhase1 } from '../../fixtures/gameStates/ai/resolvingSevenPhase1';
import { resolvingSevenPhase2 } from '../../fixtures/gameStates/ai/resolvingSevenPhase2';
import { resolvingSevenPhase3 } from '../../fixtures/gameStates/ai/resolvingSevenPhase3DoubleJack';
import { resolvingFourPhase1CanDiscardTwoCards } from '../../fixtures/gameStates/ai/resolvingFour1CanDiscardTwoCards';
import { resolvingFourPhase2HasOnlyTwoCards } from '../../fixtures/gameStates/ai/resolvingFour2HasOnlyTwoCards';
import { resolvingFourPhase3HasOnlyOneCard } from '../../fixtures/gameStates/ai/resolvingFourPhase3HasOnlyOneCard';
import { resolvingFivePhase1HasMultipleCardsInHand } from '../../fixtures/gameStates/ai/resolvingFivePhase1HasMultipleCardsInHand';
import { resolvingFivePhase2HasOneCardInHand } from '../../fixtures/gameStates/ai/resolvingFivePhase2HasOneCardInHand';
import { resolvingFivePhase3HasNoCardsInHand } from '../../fixtures/gameStates/ai/resolvingFivePhase3HasNoCardsInHand';
import { counteringPhase1AbleToCounter } from '../../fixtures/gameStates/ai/counteringPhase1AbleToCounter';
import { counteringPhase2CannotCounter } from '../../fixtures/gameStates/ai/counteringPhase2CannotCounter';

const fixtures = [
  mainPhase,
  resolvingSevenPhase1,
  resolvingSevenPhase2,
  resolvingSevenPhase3,
  resolvingFourPhase1CanDiscardTwoCards,
  resolvingFourPhase2HasOnlyTwoCards,
  resolvingFourPhase3HasOnlyOneCard,
  resolvingFivePhase1HasMultipleCardsInHand,
  resolvingFivePhase2HasOneCardInHand,
  resolvingFivePhase3HasNoCardsInHand,
  counteringPhase1AbleToCounter,
  counteringPhase2CannotCounter,
];

let getMoveBodiesForMoveType;
let getLegalMoves;
let scoreGameState;
let getMinimaxScore;
describe('AI Move Validation', () => {
  beforeAll(() => {
    ({ getMoveBodiesForMoveType } = sails.helpers.gameStates.ai);
    ({ getLegalMoves } = sails.helpers.gameStates.ai);
    ({ scoreGameState } = sails.helpers.gameStates.ai.minimax);
    ({ getMinimaxScore } = sails.helpers.gameStates.ai.minimax);
  });

  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  describe('Minimax', () => {
    describe('scoreGameState()', ()=> {
      it('Evaluates score for main phase state for p0', () => {
        const score = scoreGameState(mainPhase.gameState, 0);
        expect(score).to.eq(mainPhase.minimaxScore);
      });

      it('Evaluates score for main phase 2 for p0', () => {
        const score = scoreGameState(mainPhase2MinimaxPenalties.gameState, 0);
        expect(score).to.eq(mainPhase2MinimaxPenalties.minimaxScore);
      });

      it('Penalizes two redundant point cards summing to <= 10', () => {
        const { execute } = sails.helpers.gameStates.moves.points;
        const redundantPointState = execute(
          mainPhase2MinimaxPenalties.gameState,
          mainPhase2MinimaxPenalties.moveWithRedundantPointsPenalty,
          0,
          [ mainPhase2MinimaxPenalties.gameState ]
        );
        const score = scoreGameState(redundantPointState, 0);
        expect(score).to.eq(1.5);
      });

      it('Penalizes redundant third queen', () => {
        const { execute } = sails.helpers.gameStates.moves.faceCard;
        const redundantQueenState = execute(
          mainPhase2MinimaxPenalties.gameState,
          mainPhase2MinimaxPenalties.moveWithRedundantQueenPenalty,
          0,
          [ mainPhase2MinimaxPenalties.gameState ]
        );
        const score = scoreGameState(redundantQueenState, 0);
        expect(score).to.eq(1.5);
      });
    });

    describe('getMinimaxScore()', () => {
      it('Gets minimax score at depth 0 for main phase state for p0', () => {
        const score = getMinimaxScore(mainPhase.gameState, 0, 0, []);
        expect(score).to.eq(mainPhase.minimaxScore);
      });

    });
  });

  describe.each(fixtures)('AI moves in $name', (fixture) => {
    describe(`getMoveBodiesForMoveType() for ${fixture.name}`, () => {
      it.each(fixture.moveBodiesByType)('creates move bodies for $moveType', (testCase) => {
        const moveBodies = getMoveBodiesForMoveType(fixture.gameState, fixture.playedBy, testCase.moveType);
        expect(moveBodies).to.deep.eq(testCase.moves);
      });
    });

    describe(`getLegalMoves() for ${fixture.name}`, () => {
      it(`getLegalMoves() for ${fixture.name}`, () => {
        const legalMoves = orderBy(
          getLegalMoves(fixture.gameState, fixture.playedBy, [ fixture.gameState ]), [ 'moveType', 'cardId', 'targetId' ]
        );

        const expectedLegalMoves = orderBy(fixture.validMoveBodies.map((moveBody) => {
          const { execute } = sails.helpers.gameStates.moves[moveBody.moveType];
          return execute(fixture.gameState, moveBody, fixture.playedBy, [ fixture.gameState ]);
        }), [ 'moveType', 'cardId', 'targetId' ]);

        expect(legalMoves).to.deep.eq(expectedLegalMoves);
      });
    });
  });
});
