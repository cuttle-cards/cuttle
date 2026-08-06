---
name: announcement
description: >-
  Create or replace the site announcement popup on the Cuttle home page. Use when the user wants to
  "make an announcement", "announce X", "put up a banner/popup for Y", "add a home-page
  announcement", or update the current one. Gathers the announcement's copy, timing, and optional
  image/cards, then writes the single `announcementData` object in announcementData.js and the flat
  `announcement` i18n block across every translation file. Follows the pattern of PRs #1183 /
  #1184.
---

# Create a Cuttle home-page announcement

The home page shows **one** announcement popup at a time (a `BaseDialog`). This skill turns a
plain-English announcement ("the hand-limit rules changed — here's how it works now, live from
today through next week") into the exact file changes that render it.

Everything the popup needs already exists: the dialog component, the paragraph renderer, and the
translation files. Your job is to (1) gather the announcement details, (2) replace the exported
`announcementData` object, and (3) replace the flat `announcement` i18n block in **every**
translation file (`src/translations/*.json`). **Do not invent new component props** — reuse the fields documented below. Only
edit `AnnouncementDialog.vue` if the announcement genuinely needs a capability the current dialog
doesn't already support (it already handles multiple paragraph blocks, headings, inline links,
display cards, and an image).

## How the popup works (so you set the right fields)

- **Component:** `src/routes/home/components/announcementDialog/AnnouncementDialog.vue`. It renders
  only when `announcementIsActive` is true and shows once per `id` per browser.
- **Data:** `src/routes/home/components/announcementDialog/data/announcementData.js` — a single
  exported `announcementData` object. Replace it wholesale.
- **Paragraph renderer:** `src/components/BaseParagraph.vue` — for each `announcementText` block it
  renders `<h2>{{ t(heading) }}</h2>` (only if `heading` is set) then a `<p>` of chunks; a chunk
  with a `url` renders as an external link labelled `t(chunk.text)`, otherwise plain `t(chunk.text)`.
- **Show-once logic:** on close, the dialog writes `announcementData.id` to the `LS_ANNOUNCEMENT`
  localStorage key; it shows only while the stored value ≠ `id`. **Bump `id` to re-show the popup to
  everyone** (users who dismissed a prior announcement will see the new one).
- **Timing/targeting:** `startTime`/`endTime` (dayjs-parsed `YYYY-MM-DD`) gate visibility; `userIds`
  (if present and non-empty) restricts the popup to those user ids.

## Step 1 — Gather the announcement details

Ask the user for (fill sensible defaults, confirm anything ambiguous before writing):

- **id** — a new unique slug (e.g. `handLimit2026Announcement`). Required, must differ from the
  current one so the popup re-shows.
- **activatorText** — the label on the button that re-opens the announcement (short).
- **title** — the dialog title.
- **Body** — one or more blocks, each an optional **heading** + one or more **paragraphs**. Note any
  inline **links** (label + url).
- **startTime / endTime** — optional `YYYY-MM-DD` window. Omit a bound to leave it open on that side.
- **image** — optional. If given, place the asset in `public/img/announcement/` and reference it as
  `/img/announcement/<file>` via `imgSrc`.
- **displayCards** — optional `[{ suit, rank }]` (suit 0=clubs,1=diamonds,2=hearts,3=spades; rank
  1–13) rendered as overlapping card faces.
- **userIds** — optional number[] to target specific users; omit for everyone.

## Step 2 — Write `announcementData.js`

Replace the exported object. Every `heading` and every chunk `text` is an **i18n key**, not literal
text (the literal text goes in the translation files in Step 3). Link hrefs live here in the JS; the
link's visible label is an i18n key.

```js
export const announcementData = {
  id: '<newUniqueId>',
  activatorText: 'announcement.activatorText',
  title: 'announcement.title',
  displayCards: [],                       // or [{ suit, rank }, ...]
  imgSrc: '/img/announcement/<file>',     // omit or '' if no image
  startTime: '<YYYY-MM-DD>',              // omit if no start bound
  endTime: '<YYYY-MM-DD>',                // omit if no end bound
  // userIds: [ ... ],                     // omit for all users
  announcementText: [
    {
      heading: 'announcement.heading',
      paragraph: [
        { text: 'announcement.paragraph' },
        // inline link example — href here, label from i18n:
        // { text: 'announcement.linkLabel', url: 'https://example.com' },
      ],
    },
    // add more { heading, paragraph } blocks for multi-section announcements,
    // each referencing its own i18n keys (announcement.heading2, announcement.paragraph2, ...)
  ],
};
```

Keep the leading commented `import { Card }` line if present; the current data uses inline
`{ suit, rank }` objects.

## Step 3 — Replace the `announcement` i18n block in every translation file

Files: `src/translations/*.json` (every JSON file in the directory — don't hardcode the list). The
`announcement` object is **flat** (string keys only) and sits just before the `profile` block in each
file. Replace its contents so that
**every** i18n key referenced by the data in Step 2 has a value. Example (English):

```json
"announcement": {
  "activatorText": "Hand limit updated!",
  "title": "New Hand Limit Rule",
  "heading": "Discard at end of turn",
  "paragraph": "You can now go over 8 cards during your turn — just discard back down to 8 at the end. ..."
}
```

Rules:
- **Translation parity is mandatory** (see `.claude/rules/translation-parity.md`, esp. its
  "Values must be in the file's language" section): all translation files must hold the **same keys
  in the same order**, with the text properly translated into each non-English language — never copy
  the English string into a non-English file as a placeholder.
- If you added extra blocks/links in Step 2, add their keys (`heading2`, `paragraph2`, `linkLabel`,
  …) to **every** file.
- Remove any now-unused keys from the previous announcement (e.g. a `twitchLink` that the new
  announcement doesn't use) from every file, so the block matches the new data exactly.
- After editing, confirm each file still parses as JSON.

## Step 4 — Verify

- JSON valid in every translation file.
- Every i18n key referenced in `announcementData.js` exists in every translation file (and vice
  versa — no orphan keys).
- `npm run lint` passes.
- Load the home page: the popup should open (new `id`), render the copy/heading/links/image, and
  stay dismissed after closing. Spot-check a non-English locale for parity and that no key renders
  raw (e.g. `announcement.paragraph2`).
