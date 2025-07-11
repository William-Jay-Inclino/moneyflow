/*
  Warnings:

  - Added the required column `income_date` to the `user_income` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_income" ADD COLUMN     "income_date" TIMESTAMPTZ NOT NULL;
