/*
  Warnings:

  - You are about to drop the `user_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_categories" DROP CONSTRAINT "user_categories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "user_categories" DROP CONSTRAINT "user_categories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_expenses" DROP CONSTRAINT "user_expenses_category_id_fkey";

-- DropForeignKey
ALTER TABLE "user_income" DROP CONSTRAINT "user_income_category_id_fkey";

-- DropTable
DROP TABLE "user_categories";

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- AddForeignKey
ALTER TABLE "user_expenses" ADD CONSTRAINT "user_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_income" ADD CONSTRAINT "user_income_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
