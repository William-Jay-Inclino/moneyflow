/*
  Warnings:

  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email_verify_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- First, add new columns with defaults
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "email_verify_token" TEXT;
ALTER TABLE "users" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'temp_password_needs_reset';

-- Drop the username index
DROP INDEX "users_username_key";

-- Remove the username column
ALTER TABLE "users" DROP COLUMN "username";

-- Create new indexes
CREATE UNIQUE INDEX "users_email_verify_token_key" ON "users"("email_verify_token");
CREATE INDEX "users_email_verified_idx" ON "users"("email_verified");
