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

## Values must be in the file's language

Every value in a non-English file must be written in that file's language. Never copy the English string into `de/es/fr/ukr` as a placeholder "to translate later" — deferred translations do not get done, and the English text ships to non-English users. When **adding** a key, provide the real translation in every file at add time (produce a faithful translation rather than deferring). This requirement applies to adding keys, not only to changing existing values — structural key-parity is trivially (and wrongly) satisfied by an English copy.

### Self-check after editing

For each key you added or changed, compare the non-English value against the `en.json` value. If a non-English value is byte-identical to English **and** the string is translatable prose, it is an untranslated placeholder — translate it. Legitimate matches are fine and expected: proper nouns, URLs, `{placeholder}` tokens, and pure numbers/punctuation may be identical across languages.
