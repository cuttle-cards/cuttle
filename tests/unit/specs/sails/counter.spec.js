import { describe, it, expect, beforeAll } from 'vitest';
import { Card } from '../../fixtures/Card';
import GamePhase from '../../../../utils/GamePhase.json';
import MoveType from '../../../../utils/MoveType.json';

// p0 plays an ace one-off on turn 0, entering the countering phase
function counterState(overrides = {}) {
  return {
    p0: { hand: [ Card.THREE_OF_CLUBS ], points: [], faceCards: [] },
    p1: { hand: [ Card.ACE_OF_HEARTS, Card.TWO_OF_HEARTS ], points: [], faceCards: [] },
    deck: [ Card.FIVE_OF_CLUBS ],
    scrap: [],
    twos: [],
    discardedCards: [],
    fourRevealedCards: [],
    oneOff: Card.ACE_OF_CLUBS,
    oneOffTarget: null,
    oneOffTargetType: null,
    resolved: null,
    playedCard: null,
    targetCard: null,
    gameId: 1,
    playedBy: 0,
    moveType: MoveType.ONE_OFF,
    turn: 0,
    phase: GamePhase.COUNTERING,
    ...overrides,
  };
}

describe('Countering one-offs', () => {
  let moves;
  beforeAll(() => {
    ({ moves } = sails.helpers.gameStates);
  });

  it('Rejects countering with a non-Two card in hand', () => {
    const state = counterState();
    const move = { moveType: MoveType.COUNTER, cardId: Card.ACE_OF_HEARTS.id };
    expect(() => moves.counter.validate(state, move, 1, []))
      .to.throw('Can only counter with a Two');
  });

  it('Accepts countering with a Two in hand', () => {
    const state = counterState();
    const move = { moveType: MoveType.COUNTER, cardId: Card.TWO_OF_HEARTS.id };
    expect(() => moves.counter.validate(state, move, 1, [])).not.to.throw();
  });

  it('Rejects countering with a non-Two on top of a Two already on the stack', () => {
    const state = counterState({
      p1: { hand: [ Card.ACE_OF_HEARTS ], points: [], faceCards: [] },
      twos: [ Card.TWO_OF_HEARTS ],
      playedBy: 1,
      moveType: MoveType.COUNTER,
      playedCard: Card.TWO_OF_HEARTS,
      targetCard: Card.ACE_OF_CLUBS,
    });
    const move = { moveType: MoveType.COUNTER, cardId: Card.THREE_OF_CLUBS.id };
    expect(() => moves.counter.validate(state, move, 0, []))
      .to.throw('Can only counter with a Two');
  });
});
