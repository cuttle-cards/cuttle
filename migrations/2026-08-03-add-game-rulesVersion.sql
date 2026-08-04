-- Migration: add "rulesVersion" column to the "game" table
--
-- Context: PR #1359 (hand-limit rework) adds Game.rulesVersion — see api/models/Game.js and
-- utils/rulesVersion.js. Production and staging run Waterline with migrate: 'safe'
-- (config/env/production.js, config/env/staging.js), so the column is NOT auto-created on lift and
-- must be applied manually with this script. Dev uses migrate: 'drop' and creates it automatically.
--
-- Column/table names are Waterline's camelCase identity (no columnName/tableName overrides on the
-- model), so the column must be double-quoted: "rulesVersion" on table "game". "createdAt" is a
-- timestamptz (config/models.js), so it is compared directly against UTC timestamp literals below.
--
-- New rows created through the app receive '1.0.2' from the model's `defaultsTo`
-- (CURRENT_RULES_VERSION); this script only creates the column and backfills rows that predate it.
--
-- Idempotent — safe to run more than once:
--   * ADD COLUMN IF NOT EXISTS is a no-op if the column already exists.
--   * The UPDATE only touches rows whose "rulesVersion" is still NULL, so a re-run affects 0 rows.

BEGIN;

ALTER TABLE "game"
  ADD COLUMN IF NOT EXISTS "rulesVersion" TEXT;

-- Backfill each pre-existing game with the rule set that was live at its createdAt. Boundaries are
-- the UTC merge timestamps of the PRs that shipped each rule change (see the VERSION HISTORY in
-- utils/rulesVersion.js):
--   0.0.1  #207   2022-11-09T01:16:54Z  Reduced goal for 3 & 4 kings
--   0.1.1  #855   2024-05-15T10:34:55Z  Five rework (discard, then draw 3)
--   1.0.0  #1197  2025-05-30T13:17:20Z  GameState API release
--   1.0.1  #1320  2026-01-14T21:22:55Z  Cannot Three for a Three
-- 1.0.2 (this PR's hand-limit rework) is applied to NEW games by the model's defaultsTo, not here.
UPDATE "game"
  SET "rulesVersion" = CASE
    WHEN "createdAt" < TIMESTAMPTZ '2022-11-09 01:16:54+00' THEN '0.0.0'
    WHEN "createdAt" < TIMESTAMPTZ '2024-05-15 10:34:55+00' THEN '0.0.1'
    WHEN "createdAt" < TIMESTAMPTZ '2025-05-30 13:17:20+00' THEN '0.1.1'
    WHEN "createdAt" < TIMESTAMPTZ '2026-01-14 21:22:55+00' THEN '1.0.0'
    ELSE '1.0.1'
  END
  WHERE "rulesVersion" IS NULL;

COMMIT;
