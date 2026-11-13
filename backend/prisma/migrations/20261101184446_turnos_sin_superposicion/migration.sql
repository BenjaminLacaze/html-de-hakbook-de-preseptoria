-- DropIndex
DROP INDEX "staff_shifts_userId_date_key";

-- CreateIndex
CREATE INDEX "staff_shifts_userId_date_idx" ON "staff_shifts"("userId", "date");
