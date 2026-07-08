---
name: ctl-vue-patterns
description: "Vue 3 / Pinia / Vuetify frontend patterns for Cuttle. Use on 'write a component', 'add a store', 'Pinia defineStore', 'script setup', 'Vuetify component', 'add a route', 'socket event handler', or any frontend/UI question."
model: inherit
allowed-tools: Read, Grep, Glob, Bash
---

# Vue Patterns

Quick reference for Cuttle's frontend. Full details in `.agents/docs/vue-patterns.md`.

## Before writing any frontend code

```bash
# Find similar components
find src/components -name "*.vue" | head -20
find src/routes -name "*.vue" | head -30

# Find similar stores
grep -r "defineStore" src/stores/ --include="*.js" -l

# Find existing socket event handlers
grep -r "handleInGameEvents\|on('game'" src/ --include="*.js" -l
```

## File locations

| Type | Path |
|------|------|
| Route entry | `src/routes/<name>/<Name>View.vue` |
| Page components | `src/routes/<name>/components/` |
| Shared components | `src/components/` |
| Stores | `src/stores/` |
| Router | `src/router.js` |

## Vue SFC template

```vue
<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const gameStore = useGameStore();

const localState = ref(null);
const derivedValue = computed(() => gameStore.someField);

function handleAction() {
  // ...
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <v-card-title>{{ t('dialog.title') }}</v-card-title>
      <v-card-text>Content</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="handleAction">{{ t('common.confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```

Always use `<script setup>`. Never use Options API.

Canonical example: `src/components/BaseDialog.vue`

## Pinia store template

```js
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useExampleStore = defineStore('example', () => {
  // State — use ref()
  const items = ref([]);
  const loading = ref(false);

  // Getters — use computed()
  const count = computed(() => items.value.length);

  // Actions — plain functions
  function addItem(item) {
    items.value.push(item);
  }

  return { items, loading, count, addItem };
});
```

Canonical example: `src/stores/game.js`

### Importing stores

```js
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
const gameStore = useGameStore();
```

## Import aliases

| Alias | Resolves to |
|-------|-------------|
| `@` | `src/` |
| `_` | project root |

```js
import { useGameStore } from '@/stores/game';      // @/... → src/...
import { version } from '_/package.json';           // _/... → root/...
import MoveType from '../../utils/MoveType.json';   // relative ok too
```

## Internationalization

All user-visible strings must use `vue-i18n`:

```vue
<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
<template>
  <span>{{ t('game.draw') }}</span>
  <v-btn>{{ t('common.confirm') }}</v-btn>
</template>
```

Do not hardcode English strings in templates.

## Vuetify components

Use Vuetify for all UI elements. Do not write raw HTML buttons/modals/inputs.

Common components: `v-btn`, `v-card`, `v-dialog`, `v-list`, `v-list-item`, `v-icon`, `v-text-field`, `v-select`, `v-snackbar`, `v-tooltip`.

## Router navigation

```js
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

// Navigate
router.push({ name: 'game', params: { gameId: id } });

// Read params
const gameId = route.params.gameId;
```

Route names are in `src/router.js`.

## Socket connection

```js
import { io } from '@/plugins/sails.js';
// io is already configured — call methods directly
io.socket.on('game', (data) => { /* handle */ });
io.socket.get('/api/game', (body, res) => { /* handle */ });
```

In-game events are handled in `src/plugins/sockets/inGameEvents.js`.

## Security rules

- Never use `v-html` with user-supplied content.
- Never expose server-only data (session secrets, DB credentials) in frontend code.

## Full reference

`.agents/docs/vue-patterns.md`
