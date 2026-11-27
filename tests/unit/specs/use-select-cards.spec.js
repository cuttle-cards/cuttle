import { describe, it, expect } from 'vitest';
import { ref, computed } from 'vue';
import { useSelectCards } from '@/composables/useSelectCards';

describe('useSelectCards', () => {
  it('starts with nothing selected', () => {
    const { selectedIds, isSelected, ready } = useSelectCards(2);
    expect(selectedIds.value).toEqual([]);
    expect(isSelected(1)).toBe(false);
    expect(ready.value).toBe(false);
  });

  it('selects a card on first click and deselects it on second click', () => {
    const { selectedIds, isSelected, selectCard } = useSelectCards(2);
    selectCard(1);
    expect(selectedIds.value).toEqual([ 1 ]);
    expect(isSelected(1)).toBe(true);

    selectCard(1);
    expect(selectedIds.value).toEqual([]);
    expect(isSelected(1)).toBe(false);
  });

  it('is ready once exactly count cards are selected', () => {
    const { ready, selectCard } = useSelectCards(2);
    selectCard(1);
    expect(ready.value).toBe(false);
    selectCard(2);
    expect(ready.value).toBe(true);
  });

  it('drops the oldest selection when more than count cards are picked', () => {
    const { selectedIds, ready, selectCard } = useSelectCards(2);
    selectCard(1);
    selectCard(2);
    selectCard(3);
    expect(selectedIds.value).toEqual([ 2, 3 ]);
    expect(ready.value).toBe(true);
  });

  it('follows a reactive count', () => {
    const count = ref(1);
    const { selectedIds, ready, selectCard } = useSelectCards(count);
    selectCard(1);
    expect(ready.value).toBe(true);

    count.value = 2;
    expect(ready.value).toBe(false);
    selectCard(2);
    expect(selectedIds.value).toEqual([ 1, 2 ]);
    expect(ready.value).toBe(true);
  });

  it('accepts a computed count', () => {
    const hand = ref([ 1, 2, 3 ]);
    const count = computed(() => hand.value.length - 2);
    const { ready, selectCard } = useSelectCards(count);
    selectCard(1);
    expect(ready.value).toBe(true);
  });

  it('cannot select anything when count is 0, and is ready immediately', () => {
    const { selectedIds, ready, selectCard } = useSelectCards(0);
    expect(ready.value).toBe(true);
    selectCard(1);
    expect(selectedIds.value).toEqual([]);
    expect(ready.value).toBe(true);
  });

  it('clears the selection', () => {
    const { selectedIds, ready, selectCard, clear } = useSelectCards(2);
    selectCard(1);
    selectCard(2);
    clear();
    expect(selectedIds.value).toEqual([]);
    expect(ready.value).toBe(false);
  });
});
