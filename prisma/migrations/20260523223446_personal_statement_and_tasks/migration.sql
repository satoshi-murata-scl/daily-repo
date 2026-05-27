-- AlterTable
ALTER TABLE "LevelHistory" ADD COLUMN "guidelineId" TEXT;

-- CreateTable
CREATE TABLE "ActionGuideline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalChecks" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActionGuideline_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isDaily" BOOLEAN NOT NULL DEFAULT true,
    "targetDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "carriedFromId" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessTask_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuidelineDailyCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyRecordId" TEXT NOT NULL,
    "guidelineId" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GuidelineDailyCheck_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuidelineDailyCheck_guidelineId_fkey" FOREIGN KEY ("guidelineId") REFERENCES "ActionGuideline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReminderLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "storeId" TEXT NOT NULL,
    "personalMission" TEXT NOT NULL DEFAULT '',
    "vision30Days" TEXT NOT NULL DEFAULT '',
    "personalValues" TEXT NOT NULL DEFAULT '',
    "mottoTitle" TEXT NOT NULL DEFAULT '',
    "mottoDesc" TEXT NOT NULL DEFAULT '',
    "goal1Title" TEXT NOT NULL DEFAULT '',
    "goal1Desc" TEXT NOT NULL DEFAULT '',
    "goal1Level" INTEGER NOT NULL DEFAULT 1,
    "goal2Title" TEXT NOT NULL DEFAULT '',
    "goal2Desc" TEXT NOT NULL DEFAULT '',
    "goal2Level" INTEGER NOT NULL DEFAULT 1,
    "goal3Title" TEXT NOT NULL DEFAULT '',
    "goal3Desc" TEXT NOT NULL DEFAULT '',
    "goal3Level" INTEGER NOT NULL DEFAULT 1,
    "bizTitle" TEXT NOT NULL DEFAULT '',
    "bizDesc" TEXT NOT NULL DEFAULT '',
    "bizValue" REAL,
    "bizUnit" TEXT NOT NULL DEFAULT '',
    "bizDeadline" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Staff_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Staff" ("bizDeadline", "bizDesc", "bizTitle", "bizUnit", "bizValue", "createdAt", "email", "goal1Desc", "goal1Level", "goal1Title", "goal2Desc", "goal2Level", "goal2Title", "goal3Desc", "goal3Level", "goal3Title", "id", "mottoDesc", "mottoTitle", "name", "passwordHash", "role", "storeId", "updatedAt") SELECT "bizDeadline", "bizDesc", "bizTitle", "bizUnit", "bizValue", "createdAt", "email", "goal1Desc", "goal1Level", "goal1Title", "goal2Desc", "goal2Level", "goal2Title", "goal3Desc", "goal3Level", "goal3Title", "id", "mottoDesc", "mottoTitle", "name", "passwordHash", "role", "storeId", "updatedAt" FROM "Staff";
DROP TABLE "Staff";
ALTER TABLE "new_Staff" RENAME TO "Staff";
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeCode" TEXT NOT NULL DEFAULT 'STORE001',
    "name" TEXT NOT NULL DEFAULT 'サンプル店舗',
    "statement" TEXT NOT NULL DEFAULT '',
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT NOT NULL DEFAULT '21:00',
    "lineNotifyToken" TEXT,
    "appBaseUrl" TEXT NOT NULL DEFAULT 'http://localhost:3000'
);
INSERT INTO "new_Store" ("createdAt", "id", "name", "pdfUrl", "statement", "storeCode") SELECT "createdAt", "id", "name", "pdfUrl", "statement", "storeCode" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_storeCode_key" ON "Store"("storeCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ActionGuideline_staffId_isActive_idx" ON "ActionGuideline"("staffId", "isActive");

-- CreateIndex
CREATE INDEX "BusinessTask_staffId_targetDate_status_idx" ON "BusinessTask"("staffId", "targetDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GuidelineDailyCheck_dailyRecordId_guidelineId_key" ON "GuidelineDailyCheck"("dailyRecordId", "guidelineId");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderLog_staffId_date_key" ON "ReminderLog"("staffId", "date");
