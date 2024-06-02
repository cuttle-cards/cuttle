-- UPDATE All Timestamps to be timestampz
-- migrates all the old data
-- preserves original, numeric values in columns with "old" prefix

------------------
-- season table --
------------------
alter table "season"
rename column "startTime" to "oldStartTime";

alter table "season"
rename column "endTime" to "oldEndTime";

alter table "season"
rename column "createdAt" to "oldCreatedAt";

alter table "season"
rename column "updatedAt" to "oldUpdatedAt";

alter table "season"
add column "startTime" timestamptz,
add column "endTime" timestamptz,
add column "createdAt" timestamptz,
add column "updatedAt" timestamptz;

update "season"
set 
  "startTime" = to_timestamp("oldStartTime"/ 1000.0),
  "endTime" = to_timestamp("oldEndTime" / 1000.0),
  "createdAt" = to_timestamp("oldCreatedAt" / 1000.0),
  "updatedAt" = to_timestamp("oldUpdatedAt" / 1000.0);

-----------------
-- match table --
-----------------
alter table "match"
rename column "startTime" to "oldStartTime";

alter table "match"
rename column "endTime" to "oldEndTime";

alter table "match"
rename column "createdAt" to "oldCreatedAt";

alter table "match"
rename column "updatedAt" to "oldUpdatedAt";

alter table "match"
add column "startTime" timestamptz,
add column "endTime" timestamptz,
add column "createdAt" timestamptz,
add column "updatedAt" timestamptz;

update "match"
set 
  "startTime" = to_timestamp("oldStartTime"/ 1000.0),
  "endTime" = to_timestamp("oldEndTime" / 1000.0),
  "createdAt" = to_timestamp("oldCreatedAt" / 1000.0),
  "updatedAt" = to_timestamp("oldUpdatedAt" / 1000.0);

----------------
-- game table --
----------------
alter table "game"
rename column "lockedAt" to "oldLockedAt";

alter table "game"
rename column "createdAt" to "oldCreatedAt";

alter table "game"
rename column "updatedAt" to "oldUpdatedAt";

alter table "game"
add column "lockedAt" timestamptz,
add column "createdAt" timestamptz,
add column "updatedAt" timestamptz;

update "game"
set 
  "lockedAt" = to_timestamp("oldLockedAt" / 1000.0),
  "createdAt" = to_timestamp("oldCreatedAt" / 1000.0),
  "updatedAt" = to_timestamp("oldUpdatedAt" / 1000.0);