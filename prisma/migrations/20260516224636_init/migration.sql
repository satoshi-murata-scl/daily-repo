-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeCode" TEXT NOT NULL DEFAULT 'STORE001',
    "name" TEXT NOT NULL DEFAULT 'サンプル店舗',
    "statement" TEXT NOT NULL DEFAULT '',
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "storeId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "StandardCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "checkName" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StandardCheck_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "stdCheck1" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck2" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck3" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck4" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck5" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck6" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck7" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck8" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck9" BOOLEAN NOT NULL DEFAULT false,
    "stdCheck10" BOOLEAN NOT NULL DEFAULT false,
    "goal1Done" BOOLEAN NOT NULL DEFAULT false,
    "goal2Done" BOOLEAN NOT NULL DEFAULT false,
    "goal3Done" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT NOT NULL DEFAULT '',
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LevelHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "goalNo" INTEGER NOT NULL,
    "oldLevel" INTEGER NOT NULL,
    "newLevel" INTEGER NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,
    CONSTRAINT "LevelHistory_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_storeCode_key" ON "Store"("storeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "StandardCheck_storeId_isActive_idx" ON "StandardCheck"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "DailyRecord_staffId_date_idx" ON "DailyRecord"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecord_staffId_date_key" ON "DailyRecord"("staffId", "date");

-- CreateIndex
CREATE INDEX "LevelHistory_staffId_idx" ON "LevelHistory"("staffId");
