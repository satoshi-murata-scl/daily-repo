-- AlterTable
ALTER TABLE "ActionGuideline" ADD COLUMN "ownerEvaluationLevel" INTEGER;

-- CreateTable
CREATE TABLE "MeetingNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "month" DATETIME NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "nextAction" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MeetingNote_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MeetingNote_staffId_idx" ON "MeetingNote"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingNote_staffId_month_key" ON "MeetingNote"("staffId", "month");
