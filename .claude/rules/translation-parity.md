---
paths:
  - "src/translations/*.json"
---

## Translation File Parity

All JSON files in this directory must have identical keys in identical order at all times.

Before editing any translation file, read all other files in this directory to understand the current key set and order.

When adding a key: add it at the same position in every file, with the value translated into each file's language (e.g. English in en.json, French in fr.json).

When deleting a key: delete it from every file.

When changing a value: update the corresponding translation in every other file so the meaning stays in sync across languages.

This applies whether translation changes are the primary task or incidental to a larger change.
