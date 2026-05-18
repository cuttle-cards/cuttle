All translatation files in @src/translations should have the same keys in the same order at all times.

Any time you add a new key to any of the translation json files, you must add that same key in the same position to all other language files and translate the value into the language of that file e.g. use an English value in @en.json and a french value in @fr.json.

Likewise if you delete a key from one translation file, delete it from all files, and if you modify the text/translation of one value in one file, ensure that the translations are appropriately matching in each other translation file.