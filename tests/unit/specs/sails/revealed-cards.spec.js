import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { Card } from '../../fixtures/Card';
import { points } from '../../fixtures/gameStates/points';
import GamePhase from '../../../../utils/GamePhase.json';
import MoveType from '../../../../utils/MoveType.json';

// A main-phase state on turn 0 (p0's turn) with nothing revealed yet
function baseState(overrides = {}) {
  return {
    p0: { hand: [ Card.ACE_OF_CLUBS ], points: [], faceCards: [] },
    p1: { hand: [ Card.ACE_OF_HEARTS ], points: [], faceCards: [] },
    deck: [ Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS ],
    scrap: [],
    twos: [],
    discardedCards: [],
    fourRevealedCards: [],
    revealedCards: [],
    oneOff: null,
    oneOffTarget: null,
    oneOffTargetType: null,
    resolved: null,
    playedCard: null,
    targetCard: null,
    gameId: 1,
    playedBy: 1,
    moveType: MoveType.DRAW,
    turn: 0,
    phase: GamePhase.MAIN,
    ...overrides,
  };
}

const ids = (cards) => cards.map(({ id }) => id);

describe('Revealed cards', () => {
  let moves;
  let updateRevealedCards;
  beforeAll(() => {
    ({ moves, updateRevealedCards } = sails.helpers.gameStates);
  });

  // Runs a move's execute() and the reveal tracking on its result, as the move controller does
  const play = (state, move, playedBy) =>
    updateRevealedCards(state, moves[move.moveType].execute(state, move, playedBy, []));

  describe('Revealing cards', () => {
    it('Reveals the card a three picks from the scrap', () => {
      const state = baseState({
        scrap: [ Card.KING_OF_SPADES ],
        oneOff: Card.THREE_OF_HEARTS,
        phase: GamePhase.RESOLVING_THREE,
        moveType: MoveType.RESOLVE,
      });
      const result = play(state, { moveType: MoveType.RESOLVE_THREE, cardId: 'KS' }, 0);
      expect(ids(result.p0.hand)).to.include('KS');
      expect(ids(result.revealedCards)).to.deep.eq([ 'KS' ]);
    });

    it('Reveals the point card a nine returns to the deck', () => {
      const state = baseState({
        p1: { hand: [ Card.ACE_OF_HEARTS ], points: [ Card.TEN_OF_SPADES ], faceCards: [] },
        oneOff: Card.NINE_OF_CLUBS,
        oneOffTarget: Card.TEN_OF_SPADES,
        oneOffTargetType: 'point',
        phase: GamePhase.COUNTERING,
        moveType: MoveType.ONE_OFF,
        playedBy: 0,
      });
      // The nine's target resolves it
      const result = play(state, { moveType: MoveType.RESOLVE }, 1);
      expect(result.deck[0].id).to.eq('TS');
      expect(ids(result.revealedCards)).to.deep.eq([ 'TS' ]);
    });

    it('Reveals the jack a nine returns to the deck', () => {
      const state = baseState({
        p1: {
          hand: [ Card.ACE_OF_HEARTS ],
          points: [ { ...Card.TEN_OF_SPADES, attachments: [ Card.JACK_OF_HEARTS ] } ],
          faceCards: [],
        },
        oneOff: Card.NINE_OF_CLUBS,
        oneOffTarget: Card.JACK_OF_HEARTS,
        oneOffTargetType: 'jack',
        phase: GamePhase.COUNTERING,
        moveType: MoveType.ONE_OFF,
        playedBy: 0,
      });
      const result = play(state, { moveType: MoveType.RESOLVE }, 1);
      expect(result.deck[0].id).to.eq('JH');
      // The ten of spades returns to the field, which is public anyway
      expect(ids(result.revealedCards)).to.deep.eq([ 'JH' ]);
    });

    it('Reveals the top two cards of the deck while resolving a seven', () => {
      const state = baseState({
        oneOff: Card.SEVEN_OF_HEARTS,
        phase: GamePhase.COUNTERING,
        moveType: MoveType.ONE_OFF,
        playedBy: 0,
      });
      const result = play(state, { moveType: MoveType.RESOLVE }, 1);
      expect(result.phase).to.eq(GamePhase.RESOLVING_SEVEN);
      expect(ids(result.revealedCards)).to.deep.eq([ '2C', '3C' ]);
    });

    it('Keeps the card a seven left on the deck revealed', () => {
      const state = baseState({
        oneOff: Card.SEVEN_OF_HEARTS,
        phase: GamePhase.RESOLVING_SEVEN,
        moveType: MoveType.RESOLVE,
        revealedCards: [ Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS ],
      });
      const result = play(state, { moveType: MoveType.SEVEN_POINTS, cardId: '2C' }, 0);
      expect(ids(result.deck)).to.deep.eq([ '3C', '4C' ]);
      expect(ids(result.revealedCards)).to.deep.eq([ '3C' ]);
    });

    it('Reveals the cards a four\'s victim shows, and keeps the one they keep revealed', () => {
      const hand = [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES ];
      const state = baseState({
        p1: { hand, points: [], faceCards: [] },
        oneOff: Card.FOUR_OF_HEARTS,
        phase: GamePhase.RESOLVING_FOUR_REVEAL,
        moveType: MoveType.RESOLVE,
      });
      const revealed = play(state, { moveType: MoveType.REVEAL_FOUR, fourRevealedCards: [ 'AH', 'TH', 'KS' ] }, 1);
      expect(ids(revealed.revealedCards)).to.deep.eq([ 'AH', 'TH', 'KS' ]);

      const discarded = play(revealed, { moveType: MoveType.DISCARD_FOUR, discardedCards: [ 'AH', 'TH' ] }, 0);
      expect(ids(discarded.p1.hand)).to.deep.eq([ 'AD', 'KS' ]);
      expect(ids(discarded.revealedCards)).to.deep.eq([ 'KS' ]);
    });

    it('Reveals the whole hand of a four\'s victim who holds exactly three cards', () => {
      const hand = [ Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS, Card.KING_OF_SPADES ];
      const state = baseState({
        p1: { hand, points: [], faceCards: [] },
        oneOff: Card.FOUR_OF_HEARTS,
        phase: GamePhase.COUNTERING,
        moveType: MoveType.ONE_OFF,
        playedBy: 0,
      });
      const result = play(state, { moveType: MoveType.RESOLVE }, 1);
      expect(result.phase).to.eq(GamePhase.RESOLVING_FOUR_DISCARD);
      expect(ids(result.revealedCards)).to.deep.eq([ 'AH', 'TH', 'KS' ]);
    });

    it('Reveals the opponent\'s hand, but not the owner\'s, when glasses are played', () => {
      const state = baseState({
        p0: { hand: [ Card.ACE_OF_CLUBS, Card.EIGHT_OF_SPADES ], points: [], faceCards: [] },
        p1: { hand: [ Card.ACE_OF_HEARTS, Card.KING_OF_SPADES ], points: [], faceCards: [] },
      });
      const result = play(state, { moveType: MoveType.FACE_CARD, cardId: '8S' }, 0);
      expect(ids(result.revealedCards)).to.deep.eq([ 'AH', 'KS' ]);
    });

    it('Reveals a card drawn while the opponent has glasses, and keeps it revealed once they are gone', () => {
      const state = baseState({
        p0: { hand: [ Card.ACE_OF_CLUBS ], points: [], faceCards: [ Card.EIGHT_OF_SPADES ] },
        p1: { hand: [ Card.ACE_OF_HEARTS ], points: [], faceCards: [] },
        revealedCards: [ Card.ACE_OF_HEARTS ],
        turn: 1,
      });
      const drawn = play(state, { moveType: MoveType.DRAW }, 1);
      expect(ids(drawn.revealedCards)).to.deep.eq([ 'AH', '2C' ]);

      // Glasses leave play, e.g. to a two or a scuttle
      const withoutGlasses = { ...drawn, p0: { ...drawn.p0, faceCards: [] }, turn: 2 };
      const result = updateRevealedCards(withoutGlasses, withoutGlasses);
      expect(ids(result.revealedCards)).to.deep.eq([ 'AH', '2C' ]);
    });

    it('Reveals both hands when the deck runs out', () => {
      const state = baseState({ deck: [ Card.TWO_OF_CLUBS ], turn: 1 });
      const result = play(state, { moveType: MoveType.DRAW }, 1);
      expect(result.deck).to.deep.eq([]);
      expect(ids(result.revealedCards)).to.deep.eq([ 'AC', 'AH', '2C' ]);
    });
  });

  describe('Keeping cards hidden', () => {
    it('Reveals nothing on an ordinary draw', () => {
      const result = play(baseState(), { moveType: MoveType.DRAW }, 0);
      expect(result.revealedCards).to.deep.eq([]);
    });

    it('Drops a revealed card once it leaves the hand', () => {
      const state = baseState({
        p0: { hand: [ Card.ACE_OF_CLUBS, Card.TEN_OF_SPADES ], points: [], faceCards: [] },
        revealedCards: [ Card.TEN_OF_SPADES ],
      });
      const result = play(state, { moveType: MoveType.POINTS, cardId: 'TS' }, 0);
      expect(result.revealedCards).to.deep.eq([]);
    });

    it('Ignores revealedCards sent in the request body', () => {
      const result = play(baseState(), { moveType: MoveType.DRAW, revealedCards: [ Card.ACE_OF_HEARTS ] }, 0);
      expect(result.revealedCards).to.deep.eq([]);
    });

    it('Ignores fourRevealedCards sent in the request body outside a four', () => {
      const move = { moveType: MoveType.DRAW, fourRevealedCards: [ Card.ACE_OF_HEARTS, Card.THREE_OF_CLUBS ] };
      const result = play(baseState(), move, 0);
      expect(result.revealedCards).to.deep.eq([]);
    });
  });

  describe('Socket events', () => {
    beforeEach(async () => {
      await sails.helpers.wipeDatabase();
    });

    // In the points fixture p0 holds the ace of spades, p1 the aces of hearts and diamonds,
    // and the seven of spades is on top of the deck
    const revealedState = {
      ...points.gameState,
      revealedCards: [ Card.ACE_OF_HEARTS, Card.SEVEN_OF_SPADES ],
    };

    it('Shows revealed cards in the opponent\'s hand and on top of the deck face up', async () => {
      const { p0State } = await sails.helpers.gameStates.createSocketEvents(points.game, revealedState);
      const [ , opponent ] = p0State.game.players;
      expect(opponent.hand).to.deep.eq([ { ...Card.ACE_OF_HEARTS, isRevealed: true }, { isHidden: true } ]);
      expect(p0State.game.deck[0]).to.deep.eq({ ...Card.SEVEN_OF_SPADES, isRevealed: true });
      expect(p0State.game.deck.slice(1).every(({ isHidden }) => isHidden)).to.eq(true);
    });

    it('Flags revealed cards in the player\'s own hand', async () => {
      const { p1State } = await sails.helpers.gameStates.createSocketEvents(points.game, revealedState);
      const [ opponent, player ] = p1State.game.players;
      expect(player.hand).to.deep.eq([ { ...Card.ACE_OF_HEARTS, isRevealed: true }, Card.ACE_OF_DIAMONDS ]);
      expect(opponent.hand).to.deep.eq([ { isHidden: true } ]);
    });

    it('Flags revealed cards for spectators', async () => {
      const { spectatorState } = await sails.helpers.gameStates.createSocketEvents(points.game, revealedState);
      const [ , p1 ] = spectatorState.game.players;
      expect(p1.hand[0]).to.deep.eq({ ...Card.ACE_OF_HEARTS, isRevealed: true });
      expect(spectatorState.game.deck[0]).to.deep.eq({ ...Card.SEVEN_OF_SPADES, isRevealed: true });
    });
  });
});
