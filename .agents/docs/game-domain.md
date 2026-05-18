# Game Domain Glossary

Canonical vocabulary for Cuttle. Use these terms in code, tests, and comments. See `docs/game-rules.md` for full rules.

## Players

| Term | Meaning |
|------|---------|
| `p0` | Player 0 — the player who was dealt 5 cards and goes first |
| `p1` | Player 1 — the player who was dealt 6 cards |
| `pNum` | Player number: `0` or `1` |

In code, player objects are stored on `game.p0` and `game.p1`. The `pNum` is used in move payloads and socket events.

## Cards

### Ranks (integers 1–13)

| Rank | Name | Role |
|------|------|------|
| 1 | Ace | One-off: scrap all point cards |
| 2 | Two | One-off: counter a one-off OR scrap a royal/glasses eight |
| 3 | Three | One-off: take one card from scrap pile |
| 4 | Four | One-off: opponent discards two cards |
| 5 | Five | One-off: discard one, draw up to three |
| 6 | Six | One-off: scrap all royals and glasses eights |
| 7 | Seven | One-off: reveal top two deck cards, play one immediately |
| 8 | Eight | Royal: "Glasses Eight" — opponent plays with hand revealed |
| 9 | Nine | One-off: return opponent's field card to their hand (frozen one turn) |
| 10 | Ten | Points only |
| 11 | Jack | Royal: steal an opponent's point card |
| 12 | Queen | Royal: protect your other cards from targeting |
| 13 | King | Royal: reduce points-to-win threshold |

### Suits (integers 0–3)

| Suit | Integer |
|------|---------|
| Clubs | 0 (weakest for scuttle tiebreak) |
| Diamonds | 1 |
| Hearts | 2 |
| Spades | 3 (strongest) |

### Card representation in code

```js
// In game store / API responses
{ rank: 7, suit: 0 }   // 7 of Clubs

// In GameCard class (src/stores/game.js)
card.name  // "7♣️"

// In Cypress selectors
'[data-player-hand-card=7_0]'   // rank_suit
```

## Locations

| Term | Meaning | Selector location |
|------|---------|-------------------|
| `hand` | Cards in a player's hand | `data-player-hand-card` / `data-opponent-hand-card` |
| `points` | Cards played for points | `data-player-point-card` / `data-opponent-point-card` |
| `faceCards` | Royals and glasses eights in play | `data-player-face-card` / `data-opponent-face-card` |
| `scrap` | Scrapped cards pile | — |

## Actions

| Term | API slug | When |
|------|----------|------|
| Draw | `draw` | Take top deck card |
| Play for points | `points` | Play Ace–Ten to own field |
| Scuttle | `scuttle` | Capture opponent's lower-ranked point card |
| Play royal/glasses eight | `faceCard` | Play J/Q/K/8 to own field |
| Play one-off | `untargetedOneOff` or `targetedOneOff` | Play A–7 or 9 to scrap pile |
| Jack (steal) | `jack` | Play Jack onto opponent's point card |
| Counter | `counter` | Play Two in response to opponent's one-off |
| Resolve | `resolve` | Resolve a stacked counter chain |

## Win conditions

- Default: 21+ points wins.
- With Kings: 1 King → 14pts, 2 Kings → 10pts, 3 Kings → 5pts, 4 Kings → 0pts (instant win on play).
- Three consecutive passes → stalemate.

## Socket events

Game state is broadcast per-player via `sails.helpers.broadcastGameEvent(gameId, payload)` or `sails.helpers.gameStates.publishGameState()`. The `change` field in the payload identifies the event type (e.g., `'rematch'`, `'newGameForRematch'`).

## Key files

| File | Purpose |
|------|---------|
| `utils/MoveType.json` | Enum of all move type strings |
| `utils/GameStatus.json` | Enum: `CREATED`, `STARTED`, `FINISHED` |
| `utils/GamePhase.json` | Enum for game phase tracking |
| `src/stores/game.js` | Pinia store: full game state, socket event handlers |
| `api/helpers/broadcast-game-event.js` | Broadcasts payload to all game rooms |
| `docs/game-rules.md` | Complete rules for human reference |
