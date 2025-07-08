/*
  Warnings:

  - You are about to drop the `user_expense_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_income_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_expense_categories" DROP CONSTRAINT "user_expense_categories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_expenses" DROP CONSTRAINT "user_expenses_category_id_fkey";

-- DropForeignKey
ALTER TABLE "user_income" DROP CONSTRAINT "user_income_category_id_fkey";

-- DropForeignKey
ALTER TABLE "user_income_categories" DROP CONSTRAINT "user_income_categories_user_id_fkey";

-- DropTable
DROP TABLE "user_expense_categories";

-- DropTable
DROP TABLE "user_income_categories";

-- CreateTable
CREATE TABLE "user_categories" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,

    CONSTRAINT "user_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_categories_user_id_idx" ON "user_categories"("user_id");

-- CreateIndex
CREATE INDEX "user_categories_user_id_type_idx" ON "user_categories"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "user_categories_user_id_name_type_key" ON "user_categories"("user_id", "name", "type");

-- CreateIndex
CREATE INDEX "category_defaults_type_idx" ON "category_defaults"("type");

-- CreateIndex
CREATE INDEX "category_defaults_name_idx" ON "category_defaults"("name");

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_expenses" ADD CONSTRAINT "user_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "user_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_income" ADD CONSTRAINT "user_income_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "user_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
