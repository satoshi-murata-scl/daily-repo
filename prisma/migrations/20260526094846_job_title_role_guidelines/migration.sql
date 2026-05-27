-- CreateTable
CREATE TABLE "RoleGuideline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoleGuideline_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "jobTitle" TEXT NOT NULL DEFAULT 'STYLIST',
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
INSERT INTO "new_Staff" ("bizDeadline", "bizDesc", "bizTitle", "bizUnit", "bizValue", "createdAt", "email", "goal1Desc", "goal1Level", "goal1Title", "goal2Desc", "goal2Level", "goal2Title", "goal3Desc", "goal3Level", "goal3Title", "id", "mottoDesc", "mottoTitle", "name", "passwordHash", "personalMission", "personalValues", "role", "storeId", "updatedAt", "vision30Days") SELECT "bizDeadline", "bizDesc", "bizTitle", "bizUnit", "bizValue", "createdAt", "email", "goal1Desc", "goal1Level", "goal1Title", "goal2Desc", "goal2Level", "goal2Title", "goal3Desc", "goal3Level", "goal3Title", "id", "mottoDesc", "mottoTitle", "name", "passwordHash", "personalMission", "personalValues", "role", "storeId", "updatedAt", "vision30Days" FROM "Staff";
DROP TABLE "Staff";
ALTER TABLE "new_Staff" RENAME TO "Staff";
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RoleGuideline_storeId_jobTitle_isActive_idx" ON "RoleGuideline"("storeId", "jobTitle", "isActive");
