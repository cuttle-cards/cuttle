# Vue Patterns

Detailed reference for frontend patterns in Cuttle. See `ctl-vue-patterns` skill for quick lookups.

## Component structure

Cuttle uses Vue 3 with `<script setup>` and Vuetify 3.

```vue
<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();
const localState = ref(null);

const derivedValue = computed(() => gameStore.someField);
</script>

<template>
  <v-dialog v-model="isOpen">
    <v-card>
      <v-card-title>Title</v-card-title>
      <v-card-actions>
        <v-btn @click="handleAction">Action</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```

## File locations

| Type | Path |
|------|------|
| Route entry point | `src/routes/<routeName>/<RouteName>View.vue` |
| Page-specific components | `src/routes/<routeName>/components/` |
| Shared components | `src/components/` |
| Stores | `src/stores/` |
| Router | `src/router.js` |

## Pinia stores

All stores use the composition API form (not options API):

```js
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  // State
  const id = ref(null);
  const status = ref(null);

  // Getters
  const isStarted = computed(() => status.value === GameStatus.STARTED);

  // Actions
  function setGame(gameData) {
    id.value = gameData.id;
    status.value = gameData.status;
  }

  return { id, status, isStarted, setGame };
});
```

Canonical example: `src/stores/game.js`

### Store discovery

```bash
grep -r "defineStore" src/stores/
```

## Imports and aliases

| Alias | Resolves to |
|-------|-------------|
| `@` | `src/` |
| `_` | project root |

```js
import { useGameStore } from '@/stores/game';
import MoveType from '../../utils/MoveType.json';  // relative from src/
import { version } from '_/package.json';           // from root
```

## Vuetify usage

- Use Vuetify components (`v-btn`, `v-dialog`, `v-card`, `v-list`, etc.) for all UI.
- Do not write raw HTML buttons or modals.
- Look at `src/components/BaseDialog.vue` for dialog patterns.
- Styles use `sass/variables.scss` for design tokens.

## Internationalization

Cuttle uses `vue-i18n`. All user-visible strings go through `$t('key')`:

```vue
<template>
  <span>{{ $t('game.draw') }}</span>
</template>
```

Translation files are in `src/i18n/`.

## Socket connection

The Sails socket client is initialized in `src/plugins/sails.js` and imported as `io`:

```js
import { io } from '@/plugins/sails.js';
```

In-game socket events are handled in `src/plugins/sockets/inGameEvents.js`.

## Router navigation

```js
import { useRouter } from 'vue-router';
const router = useRouter();
router.push({ name: 'game', params: { gameId } });
```

Route names are defined in `src/router.js`.

## Key constants

| File | Contents |
|------|---------|
| `utils/MoveType.json` | Move type strings |
| `utils/GameStatus.json` | Game status enums |
| `utils/GamePhase.json` | Game phase enums |
| `utils/local-storage-utils.js` | LocalStorage key constants |
