import { describe, it, expect, beforeAll } from 'vitest';
import { Card } from '../../fixtures/Card';
import GamePhase from '../../../../utils/GamePhase.json';
import MoveType from '../../../../utils/MoveType.json';

// p0 plays a four on turn 0 against p1's hand
function fourState(victimHand, overrides = {}) {
  return {
    p0: { hand: [ Card.ACE_OF_CLUBS ], points: [], faceCards: [] },
    p1: { hand: victimHand, points: [], faceCards: [] },
    deck: [ Card.TWO_OF_CLUBS ],
    scrap: [],
    twos: [],
    discardedCards: [],
    revealedCards: [],
    oneOff: Card.FOUR_OF_CLUBS,
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

const fourCardHand = [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES ];

describe('Four one-off', () => {
  let moves;
  beforeAll(() => {
    ({ moves } = sails.helpers.gameStates);
  });

  describe('Resolving', () => {
    const resolve = (state) => moves.resolve.execute(state, { moveType: MoveType.RESOLVE }, 1, []);

    it('Awaits the victim\'s reveal when they hold more than three cards', () => {
      const result = resolve(fourState(fourCardHand));
      expect(result.phase).to.eq(GamePhase.RESOLVING_FOUR_REVEAL);
      expect(result.turn).to.eq(0);
      expect(result.oneOff).to.deep.eq(Card.FOUR_OF_CLUBS);
      expect(result.p1.hand).to.have.length(4);
      expect(result.revealedCards).to.deep.eq([]);
    });

    it('Reveals the victim\'s whole hand when they hold exactly three cards', () => {
      const hand = fourCardHand.slice(0, 3);
      const result = resolve(fourState(hand));
      expect(result.phase).to.eq(GamePhase.RESOLVING_FOUR_DISCARD);
      expect(result.revealedCards).to.deep.eq(hand);
      expect(result.p1.hand).to.deep.eq(hand);
    });

    it('Discards the victim\'s whole hand when they hold two or fewer cards', () => {
      const hand = fourCardHand.slice(0, 2);
      const result = resolve(fourState(hand));
      expect(result.phase).to.eq(GamePhase.MAIN);
      expect(result.turn).to.eq(1);
      expect(result.p1.hand).to.deep.eq([]);
      expect(result.discardedCards).to.deep.eq(hand);
      expect(result.scrap).to.deep.include.members([ ...hand, Card.FOUR_OF_CLUBS ]);
      expect(result.oneOff).to.eq(null);
    });
  });

  describe('Revealing', () => {
    const state = fourState(fourCardHand, { phase: GamePhase.RESOLVING_FOUR_REVEAL, moveType: MoveType.RESOLVE });
    const validReveal = { moveType: MoveType.REVEAL_FOUR, revealedCards: [ 'AH', 'TH', 'KS' ] };

    it('Records the revealed cards, leaving them in hand', () => {
      moves.revealFour.validate(state, validReveal, 1, []);
      const result = moves.revealFour.execute(state, validReveal, 1, []);
      expect(result.phase).to.eq(GamePhase.RESOLVING_FOUR_DISCARD);
      expect(result.revealedCards).to.deep.eq([ Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES ]);
      expect(result.p1.hand).to.deep.eq(fourCardHand);
      expect(result.turn).to.eq(0);
    });

    it.each([
      [ 'the four\'s player', validReveal, 0, 'game.snackbar.global.notYourTurn' ],
      [ 'two cards', { ...validReveal, revealedCards: [ 'AH', 'TH' ] }, 1, 'game.snackbar.oneOffs.four.mustRevealThree' ],
      [ 'a repeated card', { ...validReveal, revealedCards: [ 'AH', 'AH', 'TH' ] }, 1, 'game.snackbar.oneOffs.four.mustRevealThree' ],
      [ 'a card not in hand', { ...validReveal, revealedCards: [ 'AH', 'TH', 'QS' ] }, 1, 'game.snackbar.oneOffs.four.mustRevealThree' ],
    ])('Rejects revealing by/with %s', (_description, move, playedBy, message) => {
      expect(() => moves.revealFour.validate(state, move, playedBy, [])).to.throw(message);
    });

    it('Rejects revealing outside the reveal phase', () => {
      expect(() => moves.revealFour.validate({ ...state, phase: GamePhase.MAIN }, validReveal, 1, []))
        .to.throw('game.snackbar.oneOffs.four.notRevealingPhase');
    });
  });

  describe('Choosing discards', () => {
    const revealedCards = [ Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES ];
    const state = fourState(fourCardHand, {
      phase: GamePhase.RESOLVING_FOUR_DISCARD,
      moveType: MoveType.REVEAL_FOUR,
      playedBy: 1,
      revealedCards,
    });
    const validDiscard = { moveType: MoveType.DISCARD_FOUR, discardedCards: [ 'AH', 'KS' ] };

    it('Discards the chosen cards and completes the four', () => {
      moves.discardFour.validate(state, validDiscard, 0, []);
      const result = moves.discardFour.execute(state, validDiscard, 0, []);
      expect(result.phase).to.eq(GamePhase.MAIN);
      expect(result.turn).to.eq(1);
      expect(result.p1.hand).to.deep.eq([ Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS ]);
      expect(result.discardedCards).to.deep.eq([ Card.ACE_OF_HEARTS, Card.KING_OF_SPADES ]);
      expect(result.scrap).to.deep.eq([ Card.ACE_OF_HEARTS, Card.KING_OF_SPADES, Card.FOUR_OF_CLUBS ]);
      expect(result.revealedCards).to.deep.eq([]);
      expect(result.oneOff).to.eq(null);
      expect(result.resolved).to.deep.eq(Card.FOUR_OF_CLUBS);
    });

    it.each([
      [ 'the four\'s victim', validDiscard, 1, 'game.snackbar.global.notYourTurn' ],
      [ 'one card', { ...validDiscard, discardedCards: [ 'AH' ] }, 0, 'game.snackbar.oneOffs.four.mustChooseTwoRevealed' ],
      [ 'a repeated card', { ...validDiscard, discardedCards: [ 'AH', 'AH' ] }, 0, 'game.snackbar.oneOffs.four.mustChooseTwoRevealed' ],
      [ 'an unrevealed card', { ...validDiscard, discardedCards: [ 'AH', 'AD' ] }, 0, 'game.snackbar.oneOffs.four.mustChooseTwoRevealed' ],
    ])('Rejects choosing by/with %s', (_description, move, playedBy, message) => {
      expect(() => moves.discardFour.validate(state, move, playedBy, [])).to.throw(message);
    });

    it('Rejects choosing outside the discard phase', () => {
      const revealingState = { ...state, phase: GamePhase.RESOLVING_FOUR_REVEAL };
      expect(() => moves.discardFour.validate(revealingState, validDiscard, 0, []))
        .to.throw('game.snackbar.oneOffs.four.notChoosingDiscardsPhase');
    });
  });

  describe('Active player', () => {
    it('Is the victim while revealing and the four\'s player while choosing', () => {
      const { getActivePlayerPNum } = sails.helpers.gameStates;
      expect(getActivePlayerPNum(fourState([], { phase: GamePhase.RESOLVING_FOUR_REVEAL }))).to.eq(1);
      expect(getActivePlayerPNum(fourState([], { phase: GamePhase.RESOLVING_FOUR_DISCARD }))).to.eq(0);
    });
  });

  describe('Log', () => {
    const row = (overrides) => ({
      playedBy: 1,
      playedCard: null,
      targetCard: null,
      resolved: '4C',
      deck: [],
      discardedCards: [],
      revealedCards: [],
      phase: GamePhase.MAIN,
      ...overrides,
    });
    const logFor = (gameStates, rulesVersion = '4.0.0') =>
      sails.helpers.gameStates.getLog({
        p0: { username: 'caster' },
        p1: { username: 'victim' },
        rulesVersion,
        gameStates,
      });

    it('Narrates each step of a four', () => {
      const log = logFor([
        row({ moveType: MoveType.RESOLVE, phase: GamePhase.RESOLVING_FOUR_REVEAL }),
        row({ moveType: MoveType.REVEAL_FOUR, phase: GamePhase.RESOLVING_FOUR_DISCARD, revealedCards: [ 'AH', 'TH', 'KS' ] }),
        row({ moveType: MoveType.DISCARD_FOUR, playedBy: 0, discardedCards: [ 'AH', 'KS' ] }),
      ]);
      expect(log).to.deep.eq([
        'The 4♣️ one-off resolves; victim must reveal three cards from their hand.',
        'victim revealed the A♥️, the 10♥️, and the K♠️.',
        'caster chose the A♥️ and the K♠️ for victim to discard.',
      ]);
    });

    it('Narrates a hand of three revealed as the four resolves', () => {
      const log = logFor([
        row({ moveType: MoveType.RESOLVE, phase: GamePhase.RESOLVING_FOUR_DISCARD, revealedCards: [ 'AH', 'TH', 'KS' ] }),
      ]);
      expect(log).to.deep.eq([
        'The 4♣️ one-off resolves, revealing victim\'s whole hand: the A♥️, the 10♥️, and the K♠️.',
      ]);
    });

    it('Narrates a short hand discarded as the four resolves, noting randomness only for rules 3.x', () => {
      const resolveRow = row({ moveType: MoveType.RESOLVE, discardedCards: [ 'AH', 'TH' ] });
      expect(logFor([ resolveRow ])).to.deep.eq([
        'The 4♣️ one-off resolves, discarding the A♥️ and the 10♥️ from victim\'s hand.',
      ]);
      expect(logFor([ resolveRow ], '3.0.0')).to.deep.eq([
        'The 4♣️ one-off resolves, discarding the A♥️ and the 10♥️ at random from victim\'s hand.',
      ]);
    });
  });
});
