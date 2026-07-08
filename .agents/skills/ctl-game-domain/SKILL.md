---
name: ctl-game-domain
description: "Cuttle game vocabulary index. Use on 'what is a one-off', 'what does scuttle mean', 'what rank is a jack', 'suit order', 'how does the seven work', 'p0 vs p1', 'card selector format', or any domain term lookup. Anti-hallucination guard for game-specific logic."
model: inherit
allowed-tools: Read, Grep
---

# Game Domain

Canonical vocabulary for Cuttle. Full details in `.agents/docs/game-domain.md` and `docs/game-rules.md`.

## Players

| Term | Meaning |
|------|---------|
| `p0` | Player dealt 5 cards — goes first |
| `p1` | Player dealt 6 cards |
| `pNum` | Integer: `0` or `1` |

## Card ranks (1–13)

| Rank | Name | Type | Effect |
|------|------|------|--------|
| 1 | Ace | One-off | Scrap all point cards (both players) |
| 2 | Two | One-off | Counter a one-off OR scrap a royal/glasses eight |
| 3 | Three | One-off | Take one card from scrap pile to hand |
| 4 | Four | One-off | Opponent discards 2 cards of their choice |
| 5 | Five | One-off | Discard 1, draw up to 3 from deck |
| 6 | Six | One-off | Scrap all royals and glasses eights (both players) |
| 7 | Seven | One-off | Reveal top 2 deck cards, play one immediately |
| 8 | Eight | Royal | "Glasses Eight" — opponent plays with hand revealed |
| 9 | Nine | One-off | Return opponent's field card to hand (frozen 1 turn) |
| 10 | Ten | Points only | 10 points |
| 11 | Jack | Royal | Steal an opponent's point card |
| 12 | Queen | Royal | Protect your other cards from targeting |
| 13 | King | Royal | Reduce points-to-win threshold |

Number cards (Ace–Ten) score their face value as points when played to the field.

## Card suits (0–3)

| Integer | Suit | Scuttle rank |
|---------|------|--------------|
| 0 | Clubs | weakest |
| 1 | Diamonds | |
| 2 | Hearts | |
| 3 | Spades | strongest |

Suit is the tiebreaker for scuttle: you can scuttle a card of the same rank only if your suit is higher.

## Game actions

| Action | API slug | Trigger |
|--------|----------|---------|
| Draw | `draw` | Click deck |
| Play for points | `points` | Select card → click own field |
| Scuttle | `scuttle` | Select higher card → click opponent's point card |
| Royal / Glasses Eight | `faceCard` | Select J/Q/K/8 → click own field |
| One-off (untargeted) | `untargetedOneOff` | Select A/3/4/5/6 → click scrap pile |
| One-off (targeted) | `targetedOneOff` | Select 2/7/9 → click target |
| Jack (steal) | `jack` | Select Jack → click opponent's point card |
| Counter | `counter` | Play Two in response to opponent's one-off |
| Resolve | `resolve` | Resolve counter chain |

## Card selector format

```
data-<player>-<location>-card=<rank>_<suit>
```

| Segment | Values |
|---------|--------|
| `<player>` | `player` (current player) or `opponent` |
| `<location>` | `hand`, `point`, `face-card` |
| `<rank>` | 1–13 |
| `<suit>` | 0–3 |

Examples:
```js
'[data-player-hand-card=7_0]'       // 7 of Clubs in hand
'[data-opponent-point-card=6_2]'    // opponent's 6 of Hearts
'[data-move-choice=scuttle]'        // scuttle move option
```

## Win conditions

- Default: first to 21+ points.
- 1 King: 14pts to win. 2 Kings: 10pts. 3 Kings: 5pts. 4 Kings: 0pts (win on play).
- Three consecutive passes → stalemate.

## Terminology to avoid confusing

| Do not say | Say instead |
|------------|-------------|
| "destroy" | "scrap" |
| "discard pile" | "scrap pile" |
| "play area" | "field" or "points"/"faceCards" depending on card type |
| "special cards" | "royals and glasses eights" |
| "instant effects" | "one-offs" |

## Key source files

- `docs/game-rules.md` — full rules for human reference
- `.agents/docs/game-domain.md` — extended glossary with code examples
- `utils/MoveType.json` — all move type strings
- `utils/GameStatus.json` — game status enum
- `src/stores/game.js` — GameCard class, card sorting, socket events
- `api/helpers/broadcast-game-event.js` — socket broadcast pattern
