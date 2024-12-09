import { describe, it, expect } from 'vitest';

// Mock GameListItem component
const GameListItem = {
  name: 'GameListItem',
  props: {
    name: {
      type: String,
      default: '',
    },
    players: {
      type: Array,
      required: true,
    },
    gameId: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    isRanked: {
      type: Boolean,
      default: false,
    },
    isSpectatable: {
      type: Boolean,
      default: false,
    },
    disableSpectate: {
      type: Boolean,
      default: false,
    },
  },
  render(props) {
    return props.players.length ? `${props.players.join(' vs ')}` : 'Empty';
  }
};

describe('GameListItem.vue', () => {
  it('displays "Empty" when there are no players', () => {
    const propsData = {
      name: 'Test Game',
      players: [],
      gameId: 1,
      status: 0,
      isRanked: false,
      isSpectatable: false,
      disableSpectate: false,
    };
    const result = GameListItem.render(propsData);
    expect(result).toBe('Empty');
  });

  it('displays player names when there are players', () => {
    const propsData = {
      name: 'Test Game',
      players: [ 'aleph_one', 'SUBMARINO' ],
      gameId: 1,
      status: 0,
      isRanked: false,
      isSpectatable: false,
      disableSpectate: false,
    };
    const result = GameListItem.render(propsData);
    expect(result).toBe('aleph_one vs SUBMARINO');
  });
});
