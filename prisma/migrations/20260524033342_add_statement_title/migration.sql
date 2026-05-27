-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeCode" TEXT NOT NULL DEFAULT 'STORE001',
    "name" TEXT NOT NULL DEFAULT 'サンプル店舗',
    "statementTitle" TEXT NOT NULL DEFAULT '',
    "statement" TEXT NOT NULL DEFAULT '',
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT NOT NULL DEFAULT '21:00',
    "lineNotifyToken" TEXT,
    "appBaseUrl" TEXT NOT NULL DEFAULT 'http://localhost:3000'
);
INSERT INTO "new_Store" ("appBaseUrl", "createdAt", "id", "lineNotifyToken", "name", "pdfUrl", "reminderEnabled", "reminderTime", "statement", "storeCode") SELECT "appBaseUrl", "createdAt", "id", "lineNotifyToken", "name", "pdfUrl", "reminderEnabled", "reminderTime", "statement", "storeCode" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_storeCode_key" ON "Store"("storeCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
