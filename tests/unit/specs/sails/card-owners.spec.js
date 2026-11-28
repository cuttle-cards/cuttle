import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { Card } from '../../fixtures/Card';
import DeckIds from '../../../../utils/DeckIds.json';
import GamePhase from '../../../../utils/GamePhase.json';
import MoveType from '../../../../utils/MoveType.json';

const cardIdRegex = /[A2-9TJQKX][CDHSRB]/g;

// Builds a GameStateRow; every card not named in a column, the scrap, the twos or the one-off is
// put in the deck, after `deckTop`
function makeRow({ deckTop = [], ...overrides } = {}) {
  const row = {
    gameId: 1,
    playedBy: 0,
    moveType: MoveType.POINTS,
    turn: 0,
    phase: GamePhase.MAIN,
    p0Hand: [],
    p0Points: [],
    p0FaceCards: [],
    p1Hand: [],
    p1Points: [],
    p1FaceCards: [],
    scrap: [],
    twos: [],
    discardedCards: [],
    fourRevealedCards: [],
    revealedCards: [],
    playedCard: null,
    targetCard: null,
    oneOff: null,
    oneOffTarget: null,
    oneOffTargetType: null,
    resolved: null,
    ...overrides,
  };
  const { p0Hand, p0Points, p0FaceCards, p1Hand, p1Points, p1FaceCards, scrap, twos, oneOff } = row;
  const placed = [ p0Hand, p0Points, p0FaceCards, p1Hand, p1Points, p1FaceCards, scrap, twos, oneOff ?? [], deckTop ]
    .flat()
    .flatMap((str) => str.match(cardIdRegex));
  row.deck = [ ...deckTop, ...DeckIds.filter((id) => !placed.includes(id)) ];
  return row;
}

// Hand-built GameState whose cards carry no owners, as the e2e fixture loader and unit fixtures build them
function makeHandBuiltState({ p0 = {}, p1 = {} } = {}) {
  const player = ({ hand = [], points = [], faceCards = [] }) => ({ hand, points, faceCards });
  const state = {
    gameId: 1,
    playedBy: 0,
    moveType: MoveType.LOADFIXTURE,
    turn: 0,
    phase: GamePhase.MAIN,
    p0: player(p0),
    p1: player(p1),
    scrap: [],
    twos: [],
    discardedCards: [],
    fourRevealedCards: [],
    revealedCards: [],
    playedCard: null,
    targetCard: null,
    oneOff: null,
    oneOffTarget: null,
    oneOffTargetType: null,
    resolved: null,
  };
  const placed = [ state.p0, state.p1 ]
    .flatMap(({ hand, points, faceCards }) => [ ...hand, ...points, ...faceCards ])
    .flatMap((card) => [ card.id, ...card.attachments.map(({ id }) => id) ]);
  state.deck = DeckIds.filter((id) => !placed.includes(id))
    .map((id) => sails.helpers.gameStates.convertStrToCard(id));
  return state;
}

const ownersOf = (card) => ({ owner: card.owner, attachments: card.attachments.map(({ owner }) => owner) });

describe('Card owners', () => {
  let convertStrToCard, convertCardToStr, unpackGamestate, saveGamestate, validateGamestate, fillCardOwners, moves;
  beforeAll(() => {
    ({
      convertStrToCard,
      convertCardToStr,
      unpackGamestate,
      saveGamestate,
      validateGamestate,
      fillCardOwners,
      moves,
    } = sails.helpers.gameStates);
  });

  describe('Parsing card strings', () => {
    it('Parses an unstacked card with no owner', () => {
      expect(convertStrToCard('TH')).toEqual({ ...Card.TEN_OF_HEARTS, owner: null });
    });

    it('Parses a suffixed two', () => {
      expect(convertStrToCard('2H-p0')).toEqual({ ...Card.TWO_OF_HEARTS, owner: 0 });
    });

    it('Parses a stacked point card whose top stealer has no suffix', () => {
      const card = convertStrToCard('TH-p0(JH-p2,JC)');
      expect(card.id).toBe('TH');
      expect(card.attachments.map(({ id }) => id)).toEqual([ 'JH', 'JC' ]);
      expect(ownersOf(card)).toEqual({ owner: 0, attachments: [ 2, null ] });
    });

    it('Parses a stacked point card whose top stealer has a suffix', () => {
      expect(ownersOf(convertStrToCard('TH-p0(JH-p2,JC-p1)'))).toEqual({ owner: 0, attachments: [ 2, 1 ] });
    });

    it('Parses a stacked face card with a joker', () => {
      const card = convertStrToCard('KH-p0(XR)');
      expect(card).toEqual({
        ...Card.KING_OF_HEARTS,
        owner: 0,
        attachments: [ { id: 'XR', rank: 14, suit: 4, isFrozen: false, owner: null, attachments: [] } ],
      });
    });

    it('Parses both joker ids', () => {
      expect(convertStrToCard('XR')).toMatchObject({ id: 'XR', rank: 14, suit: 4 });
      expect(convertStrToCard('XB')).toMatchObject({ id: 'XB', rank: 14, suit: 5 });
    });

    it('Ignores the attachment suffixes of a legacy string', () => {
      expect(ownersOf(convertStrToCard('TH(JH-p0,JC-p1)'))).toEqual({ owner: null, attachments: [ null, null ] });
    });

    it('Parses a legacy string with an undefined suffix without validating it', () => {
      const card = convertStrToCard('TH(JH-undefined,JC-p0)');
      expect(card.attachments.map(({ id }) => id)).toEqual([ 'JH', 'JC' ]);
      expect(ownersOf(card)).toEqual({ owner: null, attachments: [ null, null ] });
    });

    it('Rejects malformed suffixes in the new format', () => {
      expect(() => convertStrToCard('TH-px')).toThrow(/Unrecognised owner suffix px/);
      expect(() => convertStrToCard('TH-p0(JH-undefined,JC)')).toThrow(/Unrecognised owner suffix undefined/);
    });
  });

  describe('Unpacking', () => {
    it('Fills in hand and field owners from the column, and leaves the deck and scrap ownerless', () => {
      const state = unpackGamestate(makeRow({
        p0Hand: [ 'AS' ],
        p0FaceCards: [ 'KS' ],
        p1Hand: [ 'AH' ],
        p1Points: [ 'TH' ],
        scrap: [ '6C' ],
      }));
      expect(state.p0.hand[0].owner).toBe(0);
      expect(state.p0.faceCards[0].owner).toBe(0);
      expect(state.p1.hand[0].owner).toBe(1);
      expect(state.p1.points[0].owner).toBe(1);
      expect(state.scrap[0].owner).toBeNull();
      expect(state.deck.every(({ owner }) => owner === null)).toBe(true);
    });

    describe('Legacy rows hydrate to the same object as the new format', () => {
      const jackIds = [ 'JH', 'JC', 'JD' ];
      [ 0, 1 ].forEach((pNum) => {
        [ 1, 2, 3 ].forEach((stackSize) => {
          it(`${stackSize} jack(s) in p${pNum}Points`, () => {
            // Owners alternate down from the controller (the column) at two players
            const stealerOwners = jackIds.slice(0, stackSize).map((_, i) => (pNum + stackSize - 1 - i) % 2);
            const baseOwner = (pNum + stackSize) % 2;

            const stack = {
              ...Card.TEN_OF_HEARTS,
              attachments: jackIds.slice(0, stackSize).map((id) => convertStrToCard(id)),
            };
            // The legacy writer, which is still the one in use
            const legacyStr = convertCardToStr(stack, `p${pNum}`);
            const newStr = `TH-p${baseOwner}(${jackIds
              .slice(0, stackSize)
              .map((id, i) => (i === stackSize - 1 ? id : `${id}-p${stealerOwners[i]}`))
              .join(',')})`;

            const legacy = unpackGamestate(makeRow({ [`p${pNum}Points`]: [ legacyStr ] }));
            const current = unpackGamestate(makeRow({ [`p${pNum}Points`]: [ newStr ] }));

            expect(legacy).toEqual(current);
            expect(ownersOf(legacy[`p${pNum}`].points[0])).toEqual({ owner: baseOwner, attachments: stealerOwners });
          });
        });
      });
    });

    it('Reconstructs the owners of legacy twos by alternation from the caster', () => {
      const state = unpackGamestate(makeRow({
        turn: 1,
        phase: GamePhase.COUNTERING,
        moveType: MoveType.COUNTER,
        oneOff: 'AC',
        twos: [ '2H', '2D' ],
      }));
      expect(state.twos.map(({ owner }) => owner)).toEqual([ 0, 1 ]);
    });

    it('Keeps the owners of suffixed twos', () => {
      const state = unpackGamestate(makeRow({
        turn: 1,
        phase: GamePhase.COUNTERING,
        moveType: MoveType.COUNTER,
        oneOff: 'AC',
        twos: [ '2H-p1' ],
      }));
      expect(state.twos[0].owner).toBe(1);
    });

    it('Rejects a top stealer whose suffix disagrees with its column', () => {
      expect(() => unpackGamestate(makeRow({ p1Points: [ 'TH-p1(JH-p0)' ] })))
        .toThrow(/JH is the top of TH.{0,2}s stack in p1.{0,2}s column, but is owned by p0/);
    });

    it('Replays a legacy row whose targetCard has an undefined suffix', () => {
      const state = unpackGamestate(makeRow({
        playedBy: 0,
        moveType: MoveType.JACK,
        turn: 3,
        p0Points: [ 'TH(JH-p1,JC-p0)' ],
        playedCard: 'JC',
        targetCard: 'TH(JH-undefined,JC-p0)',
      }));
      expect(ownersOf(state.p0.points[0])).toEqual({ owner: 0, attachments: [ 1, 0 ] });
      expect(ownersOf(state.targetCard)).toEqual({ owner: null, attachments: [ null, null ] });
    });
  });

  describe('Filling owners', () => {
    it('Rejects an ownerless stack in a three-player state', () => {
      const state = {
        p0: { hand: [], points: [], faceCards: [] },
        p1: { hand: [], points: [], faceCards: [] },
        p2: { hand: [], points: [ { ...Card.TEN_OF_HEARTS, attachments: [ Card.JACK_OF_HEARTS ] } ], faceCards: [] },
        twos: [],
        turn: 0,
      };
      expect(() => fillCardOwners(state, 3)).toThrow(/Cannot reconstruct the owners of TH's stack in a 3-player game/);
    });

    it('Fills in the top stealer of a three-player stack whose other owners are given', () => {
      const state = {
        p0: { hand: [], points: [], faceCards: [] },
        p1: { hand: [], points: [], faceCards: [] },
        p2: {
          hand: [],
          points: [ {
            ...Card.TEN_OF_HEARTS,
            owner: 0,
            attachments: [ { ...Card.JACK_OF_HEARTS, owner: 1 }, Card.JACK_OF_CLUBS ],
          } ],
          faceCards: [],
        },
        twos: [],
        turn: 0,
      };
      expect(ownersOf(fillCardOwners(state, 3).p2.points[0])).toEqual({ owner: 0, attachments: [ 1, 2 ] });
    });
  });

  describe('Field owner invariant', () => {
    let state;
    beforeEach(() => {
      state = unpackGamestate(makeRow({ p0Points: [ 'AS', 'TH(JH-p1,JC-p0)' ] }));
    });

    it('Accepts an unpacked state', () => {
      expect(() => validateGamestate(state)).not.toThrow();
    });

    it('Rejects a base with no owner', () => {
      state.p0.points[0].owner = null;
      expect(() => validateGamestate(state)).toThrow(/AS in p0's field has no owner/);
    });

    it('Rejects an unstacked base owned by another player', () => {
      state.p0.points[0].owner = 1;
      expect(() => validateGamestate(state)).toThrow(/AS in p0's field is unstacked, but is owned by p1/);
    });

    it('Rejects a buried stealer with no owner', () => {
      state.p0.points[1].attachments[0].owner = null;
      expect(() => validateGamestate(state)).toThrow(/JH attached to TH has no owner/);
    });

    it('Rejects a top stealer owned by someone other than its column', () => {
      state.p0.points[1].attachments[1].owner = 1;
      expect(() => validateGamestate(state)).toThrow(/JC controls TH in p0's field, but is owned by p1/);
    });
  });

  describe('Moves', () => {
    it('Plays a hand card to the field with its owner', () => {
      const state = unpackGamestate(makeRow({ p0Hand: [ 'TH' ] }));
      const result = moves.points.execute(state, { moveType: MoveType.POINTS, cardId: 'TH' }, 0, []);
      expect(result.p0.points[0].owner).toBe(0);
      expect(() => validateGamestate(result)).not.toThrow();
    });

    describe('Seven moves set the owner of the card played from the deck', () => {
      const sevenRow = (overrides) => makeRow({
        playedBy: 1,
        moveType: MoveType.RESOLVE,
        turn: 1,
        phase: GamePhase.RESOLVING_SEVEN,
        oneOff: '7C',
        ...overrides,
      });

      it('sevenPoints', () => {
        const state = unpackGamestate(sevenRow({ deckTop: [ 'TH', 'AS' ] }));
        const result = moves.sevenPoints.execute(state, { moveType: MoveType.SEVEN_POINTS, cardId: 'TH' }, 1, []);
        expect(result.p1.points[0].owner).toBe(1);
        expect(() => validateGamestate(result)).not.toThrow();
      });

      it('sevenFaceCard', () => {
        const state = unpackGamestate(sevenRow({ deckTop: [ 'KH', 'AS' ] }));
        const result = moves.sevenFaceCard.execute(state, { moveType: MoveType.SEVEN_FACE_CARD, cardId: 'KH' }, 1, []);
        expect(result.p1.faceCards[0].owner).toBe(1);
        expect(() => validateGamestate(result)).not.toThrow();
      });

      it('sevenJack', () => {
        const state = unpackGamestate(sevenRow({ p0Points: [ 'TH' ], deckTop: [ 'JH', 'AS' ] }));
        const result = moves.sevenJack.execute(
          state,
          { moveType: MoveType.SEVEN_JACK, cardId: 'JH', targetId: 'TH' },
          1,
          [],
        );
        expect(ownersOf(result.p1.points[0])).toEqual({ owner: 0, attachments: [ 1 ] });
        expect(() => validateGamestate(result)).not.toThrow();
      });
    });
  });

  describe('Saving', () => {
    beforeEach(async () => {
      await sails.helpers.wipeDatabase();
    });

    it('Saves a hand-built jacked point card unchanged, without mutating it', async () => {
      const state = makeHandBuiltState({
        p0: { points: [ { ...Card.TEN_OF_HEARTS, attachments: [ Card.JACK_OF_CLUBS ] } ] },
      });
      const row = await saveGamestate(state);
      // The legacy writer is untouched
      expect(row.p0Points).toEqual([ 'TH(JC-p1)' ]);
      expect(state.p0.points[0].attachments[0].owner).toBeNull();
    });

    it('Continues a game from a legacy row holding a jacked point card', async () => {
      const state = unpackGamestate(makeRow({ p1Points: [ 'TH(JH-p0)' ], p0Hand: [ 'JC' ] }));
      expect(ownersOf(state.p1.points[0])).toEqual({ owner: 0, attachments: [ 1 ] });

      const result = moves.jack.execute(state, { moveType: MoveType.JACK, cardId: 'JC', targetId: 'TH' }, 0, []);
      expect(ownersOf(result.p0.points[0])).toEqual({ owner: 0, attachments: [ 1, 0 ] });

      const row = await saveGamestate(result);
      expect(row.p0Points).toEqual([ 'TH(JH-p0,JC-p1)' ]);
    });
  });
});
