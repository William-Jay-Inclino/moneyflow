/*
  Warnings:

  - You are about to drop the column `name` on the `user_categories` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `user_categories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_categories_user_id_name_type_key";

-- DropIndex
DROP INDEX "user_categories_user_id_type_idx";

-- AlterTable
ALTER TABLE "user_categories" DROP COLUMN "name",
DROP COLUMN "type";
