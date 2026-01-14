import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { orderBy } from 'lodash';
import { mainPhase } from '../../fixtures/gameStates/ai/mainPhase';
import { resolvingSevenPhase1 } from '../../fixtures/gameStates/ai/resolvingSevenPhase1';
import { resolvingSevenPhase2 } from '../../fixtures/gameStates/ai/resolvingSevenPhase2';
import { resolvingSevenPhase3 } from '../../fixtures/gameStates/ai/resolvingSevenPhase3DoubleJack';
import { resolvingFourPhase1CanDiscardTwoCards } from '../../fixtures/gameStates/ai/resolvingFour1CanDiscardTwoCards';
import { resolvingFourPhase2HasOnlyTwoCards } from '../../fixtures/gameStates/ai/resolvingFour2HasOnlyTwoCards';
import { resolvingFourPhase3HasOnlyOneCard } from '../../fixtures/gameStates/ai/resolvingFourPhase3HasOnlyOneCard';
import { resolvingFivePhase1HasMultipleCardsInHand } from '../../fixtures/gameStates/ai/resolvingFivePhase1HasMultipleCardsInHand';
import { resolvingFivePhase2HasOneCardInHand } from '../../fixtures/gameStates/ai/resolvingFivePhase2HasOneCardInHand';
import { resolvingFivePhase3HasNoCardsInHand } from '../../fixtures/gameStates/ai/resolvingFivePhase3HasNoCardsInHand';

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
];

let getMoveBodiesForMoveType;
let getLegalMoves;
describe('AI Move Validation', () => {
  beforeAll(() => {
    ({ getMoveBodiesForMoveType } = sails.helpers.gameStates.ai);
    ({ getLegalMoves } = sails.helpers.gameStates.ai);
  });

  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  for (let fixture of fixtures) {
    describe(`AI moves in ${fixture.name}`, () => {
      describe(`getMoveBodiesForMoveType() for ${fixture.name}`, () => {
        for (let testCase of fixture.moveBodiesByType) {
          it(`Creates move bodies for ${testCase.moveType}`, () => {
            const moveBodies = getMoveBodiesForMoveType(fixture.gameState, fixture.playedBy, testCase.moveType);
            expect(moveBodies).to.deep.eq(testCase.moves);
          });
        }
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
  }
});
