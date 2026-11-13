-- CreateEnum
CREATE TYPE "RepClaimDestination" AS ENUM ('BEDELIA', 'DIRECTION', 'PRECEPTORSHIP', 'STAFF');

-- CreateEnum
CREATE TYPE "JustificationDocumentType" AS ENUM ('MEDICAL', 'WORK', 'FORCE_MAJEURE');

-- CreateEnum
CREATE TYPE "ForumChannel" AS ENUM ('GENERAL', 'QUESTIONS', 'PROPOSALS');

-- CreateEnum
CREATE TYPE "StaffAbsenceReason" AS ENUM ('SICK_LEAVE', 'FAMILY_CARE', 'OFFICIAL_PROCEDURE', 'FORCE_MAJEURE', 'EXAM_TRAINING');

-- AlterEnum
ALTER TYPE "RepClaimStatus" ADD VALUE 'FORWARDED';

-- AlterTable
ALTER TABLE "forum_threads" ADD COLUMN     "channel" "ForumChannel" NOT NULL DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "installations" ADD COLUMN     "code" TEXT,
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "lastCleanedBy" UUID;

-- AlterTable
ALTER TABLE "justifications" ADD COLUMN     "documentName" TEXT,
ADD COLUMN     "documentType" "JustificationDocumentType",
ADD COLUMN     "subjectId" UUID;

-- AlterTable
ALTER TABLE "rep_announcements" ADD COLUMN     "attachments" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "draft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "rep_claims" ADD COLUMN     "anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archiveReason" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "forwardNote" TEXT,
ADD COLUMN     "forwardedTo" "RepClaimDestination",
ADD COLUMN     "history" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "rep_events" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "endTime" TEXT;

-- AlterTable
ALTER TABLE "rep_threads" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hiddenReason" TEXT,
ADD COLUMN     "reportReason" TEXT,
ADD COLUMN     "reported" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "staff_tasks" ADD COLUMN     "installationId" UUID,
ADD COLUMN     "priority" "IncidentPriority";

-- CreateTable
CREATE TABLE "staff_absences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,
    "reason" "StaffAbsenceReason" NOT NULL,
    "notes" TEXT NOT NULL,
    "documentName" TEXT,
    "documentUrl" TEXT,
    "status" "JustificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_absences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_absences_userId_status_idx" ON "staff_absences"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rep_claims_code_key" ON "rep_claims"("code");

-- AddForeignKey
ALTER TABLE "justifications" ADD CONSTRAINT "justifications_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_tasks" ADD CONSTRAINT "staff_tasks_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_absences" ADD CONSTRAINT "staff_absences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

