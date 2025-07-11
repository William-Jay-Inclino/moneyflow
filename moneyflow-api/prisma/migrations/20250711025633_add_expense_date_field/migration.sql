/*
  Warnings:

  - Added the required column `expense_date` to the `user_expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_expenses" ADD COLUMN     "expense_date" DATE NOT NULL;

-- CreateIndex
CREATE INDEX "user_expenses_user_id_expense_date_idx" ON "user_expenses"("user_id", "expense_date");

-- CreateIndex
CREATE INDEX "user_expenses_expense_date_idx" ON "user_expenses"("expense_date");
