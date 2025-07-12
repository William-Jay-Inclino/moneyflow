/*
  Warnings:

  - A unique constraint covering the columns `[user_id,category_id]` on the table `user_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_categories" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_accounts_user_id_idx" ON "user_accounts"("user_id");

-- CreateIndex
CREATE INDEX "user_categories_user_id_enabled_idx" ON "user_categories"("user_id", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "user_categories_user_id_category_id_key" ON "user_categories"("user_id", "category_id");

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
