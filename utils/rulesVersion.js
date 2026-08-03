/**
 * rulesVersion.js
 *
 * Canonical version of Cuttle's core rule set. Stamped onto each Game at creation time (see
 * api/models/Game.js `rulesVersion`) so any game can be disambiguated back to the rules it was
 * played under.
 *
 * Semver semantics for the rule set (independent of the app's package.json version):
 *  - major: a paradigm / rules-breaking change (e.g. the hand-limit rework that introduced this
 *    versioning at 1.0.2 — players now discard down to 8 at end of turn instead of being blocked
 *    from drawing past it).
 *  - minor: an additive, backwards-compatible rule option.
 *  - patch: a clarification or enforcement fix that doesn't change legal play.
 *
 * Orthogonal, opt-in rule mods that aren't expressible on a single linear version (e.g. whether
 * jokers are shuffled in and what they do) are intentionally NOT encoded here — they will be
 * tracked in a separate `ruleVariants` column on Game when the first such variant ships.
 * 
 * VERSION HISTORY
 * 0.0.0 => Prior to GameState API
 * 1.0.0 => GameState API release
 * 1.0.1 => Cannot Three for a Three
 * 1.0.2 => Hand limit rework: discard down to 8 at end of your turn
 */
module.exports = {
  CURRENT_RULES_VERSION: '1.0.2',
};
