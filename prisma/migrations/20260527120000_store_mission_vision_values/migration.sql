-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeCode" TEXT NOT NULL DEFAULT 'STORE001',
    "name" TEXT NOT NULL DEFAULT 'サンプル店舗',
    "mission" TEXT NOT NULL DEFAULT '',
    "vision" TEXT NOT NULL DEFAULT '',
    "values" TEXT NOT NULL DEFAULT '',
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT NOT NULL DEFAULT '21:00',
    "lineNotifyToken" TEXT,
    "appBaseUrl" TEXT NOT NULL DEFAULT 'http://localhost:3000',
    "maxStaff" INTEGER NOT NULL DEFAULT 10,
    "level2MinChecks" INTEGER NOT NULL DEFAULT 8,
    "level3MinChecks" INTEGER NOT NULL DEFAULT 18,
    "level4MinChecks" INTEGER NOT NULL DEFAULT 30,
    "level5MinChecks" INTEGER NOT NULL DEFAULT 50
);
INSERT INTO "new_Store" (
    "id",
    "storeCode",
    "name",
    "mission",
    "vision",
    "values",
    "pdfUrl",
    "createdAt",
    "reminderEnabled",
    "reminderTime",
    "lineNotifyToken",
    "appBaseUrl",
    "maxStaff",
    "level2MinChecks",
    "level3MinChecks",
    "level4MinChecks",
    "level5MinChecks"
)
SELECT
    "id",
    "storeCode",
    "name",
    CASE
        WHEN "statement" != '' THEN "statement"
        ELSE "statementTitle"
    END,
    '',
    '',
    "pdfUrl",
    "createdAt",
    "reminderEnabled",
    "reminderTime",
    "lineNotifyToken",
    "appBaseUrl",
    "maxStaff",
    "level2MinChecks",
    "level3MinChecks",
    "level4MinChecks",
    "level5MinChecks"
FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_storeCode_key" ON "Store"("storeCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
