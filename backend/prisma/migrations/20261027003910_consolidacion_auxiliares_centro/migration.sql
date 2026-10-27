-- CreateEnum
CREATE TYPE "StaffTaskType" AS ENUM ('CLEANING', 'MAINTENANCE', 'ROUTINE');

-- CreateEnum
CREATE TYPE "StaffTaskStatus" AS ENUM ('PENDING', 'DONE');

-- CreateEnum
CREATE TYPE "InstallationStatus" AS ENUM ('OK', 'MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "RepEventType" AS ENUM ('ACADEMIC', 'CULTURAL', 'SPORTS', 'MEETING');

-- CreateEnum
CREATE TYPE "RepForumCategory" AS ENUM ('GENERAL', 'PROPOSALS', 'EVENTS');

-- CreateEnum
CREATE TYPE "RepClaimCategory" AS ENUM ('ACADEMIC', 'INFRASTRUCTURE', 'ADMINISTRATIVE', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "RepClaimStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'STAFF';
ALTER TYPE "Role" ADD VALUE 'STUDENT_REP';

-- AlterTable
ALTER TABLE "careers" ADD COLUMN     "demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "demo" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "staff_tasks" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "StaffTaskType" NOT NULL,
    "status" "StaffTaskStatus" NOT NULL DEFAULT 'PENDING',
    "location" TEXT NOT NULL,
    "details" TEXT,
    "assignedToUserId" UUID,
    "completedAt" TIMESTAMP(3),
    "completedBy" UUID,
    "createdBy" UUID NOT NULL,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "InstallationStatus" NOT NULL DEFAULT 'OK',
    "layout" JSONB NOT NULL,
    "lastCleanedAt" TIMESTAMP(3),
    "nextTask" TEXT,
    "notes" TEXT,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "IncidentPriority" NOT NULL,
    "sector" TEXT NOT NULL,
    "installationId" UUID,
    "imageUrl" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "reportedBy" UUID NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" UUID,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "task" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "installationId" UUID,
    "recordedBy" UUID NOT NULL,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rep_events" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "type" "RepEventType" NOT NULL,
    "organizer" TEXT NOT NULL,
    "createdBy" UUID NOT NULL,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rep_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rep_event_participants" (
    "eventId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rep_event_participants_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateTable
CREATE TABLE "rep_threads" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "RepForumCategory" NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rep_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rep_replies" (
    "id" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rep_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rep_announcements" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "publishDate" DATE,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rep_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rep_claims" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "category" "RepClaimCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RepClaimStatus" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "responderId" UUID,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rep_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_tasks_date_idx" ON "staff_tasks"("date");

-- CreateIndex
CREATE UNIQUE INDEX "installations_name_key" ON "installations"("name");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "rep_events_date_idx" ON "rep_events"("date");

-- CreateIndex
CREATE INDEX "rep_claims_status_idx" ON "rep_claims"("status");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_event_participants" ADD CONSTRAINT "rep_event_participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "rep_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_event_participants" ADD CONSTRAINT "rep_event_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_threads" ADD CONSTRAINT "rep_threads_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_replies" ADD CONSTRAINT "rep_replies_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "rep_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_replies" ADD CONSTRAINT "rep_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_announcements" ADD CONSTRAINT "rep_announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_claims" ADD CONSTRAINT "rep_claims_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
