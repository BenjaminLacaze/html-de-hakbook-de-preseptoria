-- CreateEnum
CREATE TYPE "CorrectionField" AS ENUM ('FIRST_NAME', 'LAST_NAME', 'DNI', 'EMAIL', 'PHONE', 'ADMISSION_DATE', 'OTHER');

-- CreateEnum
CREATE TYPE "CorrectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StaffShiftType" AS ENUM ('REGULAR', 'SWAP', 'OFF', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "ShiftChangeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "notice_reads" (
    "noticeId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notice_reads_pkey" PRIMARY KEY ("noticeId","userId")
);

-- CreateTable
CREATE TABLE "attendance_qr_codes" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_correction_requests" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "field" "CorrectionField" NOT NULL,
    "currentValue" TEXT,
    "proposedValue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" UUID NOT NULL,
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_shifts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "type" "StaffShiftType" NOT NULL DEFAULT 'REGULAR',
    "notes" TEXT,
    "createdBy" UUID NOT NULL,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_change_requests" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "colleagueId" UUID NOT NULL,
    "requesterShiftId" UUID NOT NULL,
    "colleagueShiftId" UUID NOT NULL,
    "reason" TEXT,
    "status" "ShiftChangeStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "respondedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notice_reads_userId_idx" ON "notice_reads"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_qr_codes_codeHash_key" ON "attendance_qr_codes"("codeHash");

-- CreateIndex
CREATE INDEX "attendance_qr_codes_sessionId_idx" ON "attendance_qr_codes"("sessionId");

-- CreateIndex
CREATE INDEX "data_correction_requests_studentId_status_idx" ON "data_correction_requests"("studentId", "status");

-- CreateIndex
CREATE INDEX "staff_shifts_date_idx" ON "staff_shifts"("date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_shifts_userId_date_key" ON "staff_shifts"("userId", "date");

-- CreateIndex
CREATE INDEX "shift_change_requests_colleagueId_status_idx" ON "shift_change_requests"("colleagueId", "status");

-- CreateIndex
CREATE INDEX "shift_change_requests_requesterId_status_idx" ON "shift_change_requests"("requesterId", "status");

-- AddForeignKey
ALTER TABLE "notice_reads" ADD CONSTRAINT "notice_reads_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notice_reads" ADD CONSTRAINT "notice_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_qr_codes" ADD CONSTRAINT "attendance_qr_codes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_correction_requests" ADD CONSTRAINT "data_correction_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_shifts" ADD CONSTRAINT "staff_shifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_colleagueId_fkey" FOREIGN KEY ("colleagueId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_requesterShiftId_fkey" FOREIGN KEY ("requesterShiftId") REFERENCES "staff_shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_change_requests" ADD CONSTRAINT "shift_change_requests_colleagueShiftId_fkey" FOREIGN KEY ("colleagueShiftId") REFERENCES "staff_shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
