import { describe, it, expect, beforeEach } from 'vitest';
import { points } from '../../fixtures/gameStates/points';
import { resolveThree } from '../../fixtures/gameStates/resolveThree';
import { resolveNine } from '../../fixtures/gameStates/resolveNine';
import { duplicateCard, missingCard, scrapAttachments, invalidCard } from '../../fixtures/gameStates/cardValidationErrors';
import { cloneDeep } from 'lodash';
import { Card } from '../../fixtures/Card';
import MoveType from '../../../../utils/MoveType.json';
import TargetType from '../../../../utils/TargetType.json';
import GamePhase from '../../../../utils/GamePhase.json';

// remove attributes added while creating the entry in the database
function stripDbAttributes(obj) {
  const attributesToRemove = [ 'createdAt', 'id', 'updatedAt' ];
  attributesToRemove.forEach((attr) => delete obj[attr]);
}

describe('Converting GameState\'s and GameStateRow\'s and emitting sockets for Points', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gameStates.saveGamestate(points.gameState);

    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(points.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId: gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [ savedRow ] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(points.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', () => {
    const gameState = sails.helpers.gameStates.unpackGamestate(points.gameStateRow);
    expect(points.gameState).toEqual(gameState);
  });

  it('Creates and Publishes socket event', async () => {
    const { spectatorState: socketEvent } = 
      await sails.helpers.gameStates.createSocketEvents(points.game, points.gameState);
    stripDbAttributes(socketEvent.game);
    delete socketEvent.game.match.startTime;
    delete socketEvent.victory.currentMatch.startTime;
    socketEvent.victory.currentMatch.games.forEach((game) => stripDbAttributes(game));
    expect(socketEvent).toEqual(points.socket);
  });
});

describe('Converting GameState, and GameStateRow, and Publishing Socket for Resolve Three', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gameStates.saveGamestate(resolveThree.gameState);
    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(resolveThree.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId: gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [ savedRow ] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(resolveThree.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', async () => {
    const gameState = await sails.helpers.gameStates.unpackGamestate(resolveThree.gameStateRow);
    stripDbAttributes(gameState);
    expect(gameState).toEqual(resolveThree.gameState);
  });

  it('Creates and Publishes socket event', async () => {
    const { spectatorState: socketEvent } = await sails.helpers.gameStates.createSocketEvents(
      resolveThree.game,
      resolveThree.gameState,
    );
    stripDbAttributes(socketEvent.game);
    expect(socketEvent).toEqual(resolveThree.socket);
  });
});

describe('Converting GameState, and GameStateRow, and Publishing Socket for Resolve Nine on Jack', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Converts GameState to GameStateRow (packing)', async () => {
    const gameStateRow = await sails.helpers.gameStates.saveGamestate(resolveNine.gameState);
    stripDbAttributes(gameStateRow);
    expect(gameStateRow).toEqual(resolveNine.gameStateRow);

    const dbGameStateRows = await GameStateRow.find({ gameId: gameStateRow.gameId });
    expect(dbGameStateRows.length).toEqual(1);

    const [ savedRow ] = dbGameStateRows;
    stripDbAttributes(savedRow);
    expect(savedRow).toEqual(resolveNine.gameStateRow);
  });

  it('Converts GameStateRow to GameState (unpacking)', async () => {
    const gameState = await sails.helpers.gameStates.unpackGamestate(resolveNine.gameStateRow);
    stripDbAttributes(gameState);
    expect(gameState).toEqual(resolveNine.gameState);
  });

  it('Creates and Publishes socket event', async () => {
    const { spectatorState: socketEvent } = await sails.helpers.gameStates.createSocketEvents(
      resolveNine.game,
      resolveNine.gameState,
    );

    stripDbAttributes(socketEvent.game);
    expect(socketEvent).toEqual(resolveNine.socket);
  });
});

describe('Throwing Errors on card validations',() => {
  it('throws an error when a duplicate card is found', () => {
    expect(() => sails.helpers.gameStates.validateAllCards(duplicateCard))
      .toThrowError(/^Duplicate Card 7S$/);
  });

  it('throws an error when a invalid card is found', () => {
    expect(() => sails.helpers.gameStates.validateAllCards(invalidCard))
      .toThrowError(/^Invalid Card id HA$/);
  });

  it('throws an error when a card is missing', () => {
    expect(() => sails.helpers.gameStates.validateAllCards(missingCard))
      .toThrowError(/^Missing Cards AC$/);
  });

  it('throws an error when a card in the scrap has an attachment', () => {
    expect(() => sails.helpers.gameStates.validateAllCards(scrapAttachments))
      .toThrowError(/^6C is not a point card, and cannot have attachments$/);
  });
});

describe('Labelling the jacks on a point card with the players who played them', () => {
  const tenWithJacks = (...jacks) => ({ ...cloneDeep(Card.TEN_OF_SPADES), attachments: cloneDeep(jacks) });

  it('labels the last jack with the player who controls the card, for odd and even counts', () => {
    const { convertCardToStr } = sails.helpers.gameStates;
    const one = tenWithJacks(Card.JACK_OF_DIAMONDS);
    const two = tenWithJacks(Card.JACK_OF_DIAMONDS, Card.JACK_OF_HEARTS);
    const three = tenWithJacks(Card.JACK_OF_DIAMONDS, Card.JACK_OF_HEARTS, Card.JACK_OF_CLUBS);

    expect(convertCardToStr(one, 'p1')).toBe('TS(JD-p1)');
    expect(convertCardToStr(two, 'p0')).toBe('TS(JD-p1,JH-p0)');
    expect(convertCardToStr(three, 'p1')).toBe('TS(JD-p1,JH-p0,JC-p1)');
  });

  it('throws when a card with jacks has no controller', () => {
    expect(() => sails.helpers.gameStates.convertCardToStr(tenWithJacks(Card.JACK_OF_DIAMONDS)))
      .toThrowError(/Missing the player who controls TS/);
  });

  describe('through a game of jacks and a nine', () => {
    let state;

    beforeEach(() => {
      state = {
        p0: { hand: cloneDeep([ Card.JACK_OF_HEARTS ]), points: cloneDeep([ Card.TEN_OF_SPADES ]), faceCards: [] },
        p1: { hand: cloneDeep([ Card.JACK_OF_DIAMONDS, Card.NINE_OF_CLUBS ]), points: [], faceCards: [] },
        deck: cloneDeep([ Card.ACE_OF_CLUBS ]),
        scrap: [], twos: [], discardedCards: [], fourRevealedCards: [], revealedCards: [],
        playedCard: null, targetCard: null, oneOff: null, oneOffTarget: null, oneOffTargetType: null,
        resolved: null, gameId: 1, playedBy: 0, moveType: MoveType.POINTS, turn: 1, phase: GamePhase.MAIN,
      };
    });

    const play = (move, requestedMove, playedBy) => {
      state = sails.helpers.gameStates.moves[move].execute(state, requestedMove, playedBy, []);
      return sails.helpers.gameStates.packGamestate(state);
    };

    it('labels a jacked card and a card jacked back', () => {
      let row = play('jack', { moveType: MoveType.JACK, cardId: 'JD', targetId: 'TS' }, 1);
      expect(row.p1Points).toEqual([ 'TS(JD-p1)' ]);
      expect(row.targetCard).toBe('TS(JD-p1)');

      row = play('jack', { moveType: MoveType.JACK, cardId: 'JH', targetId: 'TS' }, 0);
      expect(row.p0Points).toEqual([ 'TS(JD-p1,JH-p0)' ]);
      expect(row.targetCard).toBe('TS(JD-p1,JH-p0)');
    });

    it('keeps the controller when a nine targets a card with two jacks, and when it resolves', () => {
      play('jack', { moveType: MoveType.JACK, cardId: 'JD', targetId: 'TS' }, 1);
      play('jack', { moveType: MoveType.JACK, cardId: 'JH', targetId: 'TS' }, 0);

      let row = play('oneOff', { moveType: MoveType.ONE_OFF, cardId: '9C', targetId: 'TS', targetType: TargetType.point }, 1);
      expect(row.oneOffTarget).toBe('TS(JD-p1,JH-p0)');

      // The nine sends TS back to the deck, but the row still records who controlled it
      row = play('resolve', { moveType: MoveType.RESOLVE }, 0);
      expect(row.deck[0]).toBe('TS');
      expect(row.targetCard).toBe('TS(JD-p1,JH-p0)');
    });
  });
});
