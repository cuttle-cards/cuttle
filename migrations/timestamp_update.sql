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
