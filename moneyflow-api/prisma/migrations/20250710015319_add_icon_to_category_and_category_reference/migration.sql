/*
  Warnings:

  - Added the required column `icon` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add icon column with default value first
ALTER TABLE "categories" ADD COLUMN "icon" TEXT NOT NULL DEFAULT '📁';

-- Update existing records with appropriate icons based on name
UPDATE "categories" SET "icon" = '🍽️' WHERE "name" = 'Eating out';
UPDATE "categories" SET "icon" = '🚗' WHERE "name" = 'Transportation';
UPDATE "categories" SET "icon" = '🛒' WHERE "name" = 'Groceries & Essentials';
UPDATE "categories" SET "icon" = '⚡' WHERE "name" = 'Utilities';
UPDATE "categories" SET "icon" = '🏠' WHERE "name" = 'Housing';
UPDATE "categories" SET "icon" = '📱' WHERE "name" = 'Load / Subscriptions';
UPDATE "categories" SET "icon" = '🏥' WHERE "name" = 'Healthcare';
UPDATE "categories" SET "icon" = '🛡️' WHERE "name" = 'Insurance';
UPDATE "categories" SET "icon" = '🛍️' WHERE "name" = 'Shopping';
UPDATE "categories" SET "icon" = '🎬' WHERE "name" = 'Entertainment';
UPDATE "categories" SET "icon" = '💰' WHERE "name" = 'Savings & Investment';
UPDATE "categories" SET "icon" = '🎁' WHERE "name" = 'Gifts & Donations';
UPDATE "categories" SET "icon" = '📦' WHERE "name" = 'Others' AND "type" = 'EXPENSE';
UPDATE "categories" SET "icon" = '💼' WHERE "name" = 'Salary / Wages';
UPDATE "categories" SET "icon" = '📈' WHERE "name" = 'Dividends';
UPDATE "categories" SET "icon" = '💻' WHERE "name" = 'Freelance';
UPDATE "categories" SET "icon" = '💳' WHERE "name" = 'Interest';
UPDATE "categories" SET "icon" = '🏢' WHERE "name" = 'Business';
UPDATE "categories" SET "icon" = '💎' WHERE "name" = 'Others' AND "type" = 'INCOME';

-- AlterTable
ALTER TABLE "user_categories" ADD COLUMN     "category_id" INTEGER;

-- CreateIndex
CREATE INDEX "user_categories_category_id_idx" ON "user_categories"("category_id");

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
