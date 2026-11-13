-- CreateEnum
CREATE TYPE "GuardianRelationship" AS ENUM ('MOTHER', 'FATHER', 'LEGAL_GUARDIAN');

-- CreateEnum
CREATE TYPE "AuthorizationType" AS ENUM ('FIELD_TRIP', 'TRAVEL', 'IMAGE_USE', 'EARLY_DISMISSAL');

-- CreateEnum
CREATE TYPE "AuthorizationAnswer" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'GUARDIAN';

-- CreateTable
CREATE TABLE "guardians" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dni" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "occupation" TEXT,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_guardians" (
    "guardianId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "relationship" "GuardianRelationship" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("guardianId","studentId")
);

-- CreateTable
CREATE TABLE "authorization_requests" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AuthorizationType" NOT NULL,
    "description" TEXT NOT NULL,
    "deadlineDate" DATE NOT NULL,
    "destination" TEXT,
    "eventDate" DATE,
    "responsible" TEXT,
    "createdBy" UUID NOT NULL,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authorization_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorization_responses" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "answer" "AuthorizationAnswer" NOT NULL DEFAULT 'PENDING',
    "respondedBy" UUID,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "authorization_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_correction_requests" (
    "id" UUID NOT NULL,
    "guardianId" UUID NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardian_correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guardians_userId_key" ON "guardians"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "guardians_dni_key" ON "guardians"("dni");

-- CreateIndex
CREATE INDEX "student_guardians_studentId_idx" ON "student_guardians"("studentId");

-- CreateIndex
CREATE INDEX "authorization_responses_studentId_idx" ON "authorization_responses"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "authorization_responses_requestId_studentId_key" ON "authorization_responses"("requestId", "studentId");

-- CreateIndex
CREATE INDEX "guardian_correction_requests_guardianId_status_idx" ON "guardian_correction_requests"("guardianId", "status");

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorization_responses" ADD CONSTRAINT "authorization_responses_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "authorization_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorization_responses" ADD CONSTRAINT "authorization_responses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_correction_requests" ADD CONSTRAINT "guardian_correction_requests_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

