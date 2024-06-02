alter table "season"
rename column "startTime" to "oldStartTime";

alter table "season"
rename column "endTime" to "oldEndTime";

alter table "season"
add column "startTime" timestamptz,
add column "endTime" timestamptz;

update "season"
set "startTime" = to_timestamp("oldStartTime"/1000.0),
	"endTime" = to_timestamp("oldEndTime" /1000.0);