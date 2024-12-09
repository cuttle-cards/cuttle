import { shallowMount } from '@vue/test-utils';
import GameListItem from '@/components/GameListItem.vue';

describe('GameListItem.vue', () => {
  it('displays "Empty" when there are no players', () => {
    const wrapper = shallowMount(GameListItem, {
      propsData: {
        name: 'Test Game',
        players: [],
        gameId: 1,
        status: 0,
        isRanked: false,
        isSpectatable: false,
        disableSpectate: false,
      },
    });
    expect(wrapper.find('.text-surface-1').text()).toBe('Empty');
  });

  it('displays "vs [player username]" when there is one player', () => {
    const wrapper = shallowMount(GameListItem, {
      propsData: {
        name: 'Test Game',
        players: [{ username: 'aleph_one' }],
        gameId: 1,
        status: 0,
        isRanked: false,
        isSpectatable: false,
        disableSpectate: false,
      },
    });
    expect(wrapper.find('.text-surface-1').text()).toBe('vs aleph_one');
  });

  it('displays "[player1 username] vs [player2 username]" when there are two players', () => {
    const wrapper = shallowMount(GameListItem, {
      propsData: {
        name: 'Test Game',
        players: [{ username: 'aleph_one' }, { username: 'SUBMARINO' }],
        gameId: 1,
        status: 0,
        isRanked: false,
        isSpectatable: false,
        disableSpectate: false,
      },
    });
    expect(wrapper.find('.text-surface-1').text()).toBe('aleph_one vs SUBMARINO');
  });
});