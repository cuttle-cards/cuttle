import { ref, computed, toValue } from 'vue';

/**
 * Tracks which cards are selected in a "pick N cards" dialog.
 *
 * @param {number | import('vue').Ref<number>} count - how many cards must be selected.
 *   Accepts a ref/computed so the count can change (e.g. discarding down to the hand limit).
 */
export function useSelectCards(count) {
  const selectedIds = ref([]);

  const isSelected = (id) => selectedIds.value.includes(id);
  const ready = computed(() => selectedIds.value.length === toValue(count));

  // Toggle the card; if that puts us over the count, drop the oldest selection
  function selectCard(id) {
    const idx = selectedIds.value.indexOf(id);
    if (idx !== -1) {
      selectedIds.value.splice(idx, 1);
      return;
    }
    selectedIds.value.push(id);
    if (selectedIds.value.length > toValue(count)) {
      selectedIds.value.splice(0, 1);
    }
  }

  function clear() {
    selectedIds.value = [];
  }

  return {
    selectedIds,
    isSelected,
    ready,
    selectCard,
    clear,
  };
}
