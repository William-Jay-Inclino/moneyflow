-- CreateIndex
CREATE INDEX "user_income_user_id_income_date_idx" ON "user_income"("user_id", "income_date");

-- CreateIndex
CREATE INDEX "user_income_income_date_idx" ON "user_income"("income_date");
