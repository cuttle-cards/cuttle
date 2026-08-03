-- Migration: add "rulesVersion" column to the "game" table
--
-- Context: PR #1359 (hand-limit rework) adds Game.rulesVersion — see api/models/Game.js and
-- utils/rulesVersion.js. Production and staging run Waterline with migrate: 'safe'
-- (config/env/production.js, config/env/staging.js), so the column is NOT auto-created on lift and
-- must be applied manually with this script. Dev uses migrate: 'drop' and creates it automatically.
--
-- Column/table names are Waterline's camelCase identity (no columnName/tableName overrides on the
-- model), so the column must be double-quoted: "rulesVersion" on table "game".
--
-- New rows created through the app receive '1.0.0' from the model's `defaultsTo`
-- (CURRENT_RULES_VERSION); this script only creates the column and backfills rows that predate it.
--
-- Idempotent — safe to run more than once:
--   * ADD COLUMN IF NOT EXISTS is a no-op if the column already exists.
--   * The UPDATE only touches rows whose "rulesVersion" is still NULL, so a re-run affects 0 rows.

BEGIN;

ALTER TABLE "game"
  ADD COLUMN IF NOT EXISTS "rulesVersion" TEXT;

-- Backfill all pre-existing rows to the current rule set version.
UPDATE "game"
  SET "rulesVersion" = '1.0.0'
  WHERE "rulesVersion" IS NULL;

COMMIT;
